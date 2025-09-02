import {open, QuickSQLiteConnection} from 'react-native-quick-sqlite';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: QuickSQLiteConnection | null = null;
  private readonly dbName = 'exam_engine.db';

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection and run migrations
   */
  public async initialize(): Promise<void> {
    if (this.db) {
      return; // Already initialized
    }

    try {
      this.db = open({name: this.dbName});
      console.log(`Database ${this.dbName} opened successfully`);
      
      // Enable foreign key constraints
      this.db.execute('PRAGMA foreign_keys = ON');
      
      // Run migrations
      await this.runMigrations();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get database connection
   */
  public getConnection(): QuickSQLiteConnection {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  /**
   * Run database migrations in order
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database connection not available');
    }

    // Create migrations table if it doesn't exist
    this.db.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        version TEXT NOT NULL UNIQUE,
        applied_at INTEGER NOT NULL
      )
    `);

    const migrations = [
      {version: '001_initial', migration: this.getMigration001()},
    ];

    for (const {version, migration} of migrations) {
      await this.runMigration(version, migration);
    }
  }

  /**
   * Run a single migration if it hasn't been applied yet
   */
  private async runMigration(version: string, migration: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database connection not available');
    }

    // Check if migration has already been applied
    const result = this.db.execute(
      'SELECT version FROM migrations WHERE version = ?',
      [version],
    );

    if (result && result.rows && result.rows.length > 0) {
      console.log(`Migration ${version} already applied`);
      return;
    }

    try {
      console.log(`Applying migration ${version}...`);
      
      // Execute migration
      this.db.execute(migration);
      
      // Record migration as applied
      this.db.execute(
        'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
        [version, Date.now()],
      );
      
      console.log(`Migration ${version} applied successfully`);
    } catch (error) {
      console.error(`Failed to apply migration ${version}:`, error);
      throw error;
    }
  }

  /**
   * Get the initial migration SQL
   */
  private getMigration001(): string {
    return `
      -- Exam configuration and metadata
      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,              -- 'cbap', 'pmp', 'az104'
        name TEXT NOT NULL,               -- 'CBAP Certification'
        code TEXT NOT NULL,               -- 'CBAP'
        provider TEXT,                    -- 'IIBA'
        version TEXT NOT NULL,            -- '2025.08.28'
        total_questions INTEGER NOT NULL, -- 150 for exam, 1200 in database
        time_limit_minutes INTEGER,       -- 210
        passing_score REAL,               -- 0.70
        blueprint_version TEXT,           -- 'v4.0'
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      -- Topic/domain taxonomy per exam
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,              -- 'cbap_planning'
        exam_id TEXT NOT NULL,            -- 'cbap'
        name TEXT NOT NULL,               -- 'Business Analysis Planning'
        short_name TEXT,                  -- 'Planning'
        description TEXT,
        parent_id TEXT,                   -- For subtopics
        weight REAL,                      -- 0.16 (16% of exam)
        icon TEXT,                        -- '🎯'
        color TEXT,                       -- '#2B5CE6'
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (parent_id) REFERENCES topics(id)
      );

      -- Enhanced questions table with flexible content
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,              -- UUID
        exam_id TEXT NOT NULL,            -- 'cbap'
        topic_id TEXT NOT NULL,           -- 'cbap_planning'
        question_type TEXT NOT NULL,      -- 'single', 'multi', 'match', etc.
        difficulty TEXT NOT NULL,         -- 'easy', 'medium', 'hard'
        content_json TEXT NOT NULL,       -- Flexible question content
        explanation TEXT,                 -- Answer explanation
        rationale TEXT,                   -- Why other answers are wrong
        reference TEXT,                   -- BABOK section reference
        tags TEXT,                        -- JSON array of tags
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (topic_id) REFERENCES topics(id)
      );

      -- Question exhibits and media assets
      CREATE TABLE IF NOT EXISTS exhibits (
        id TEXT PRIMARY KEY,              -- UUID
        exam_id TEXT NOT NULL,            -- 'cbap'
        filename TEXT NOT NULL,           -- 'process_diagram.png'
        uri TEXT NOT NULL,                -- 'assets/exhibits/process_diagram.png'
        content_type TEXT NOT NULL,       -- 'image/png'
        file_size INTEGER,                -- bytes
        width INTEGER,                    -- pixels
        height INTEGER,                   -- pixels
        description TEXT,                 -- Alt text for accessibility
        created_at INTEGER NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams(id)
      );

      -- Many-to-many relationship between questions and exhibits
      CREATE TABLE IF NOT EXISTS question_exhibits (
        question_id TEXT NOT NULL,
        exhibit_id TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        PRIMARY KEY (question_id, exhibit_id),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (exhibit_id) REFERENCES exhibits(id) ON DELETE CASCADE
      );

      -- User practice attempts and sessions
      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,              -- UUID
        exam_id TEXT NOT NULL,            -- 'cbap'
        session_type TEXT NOT NULL,       -- 'adaptive', 'quick', 'full_exam'
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        score REAL DEFAULT 0.0,           -- 0.0 to 1.0
        time_limit_seconds INTEGER,
        time_spent_seconds INTEGER,
        is_completed BOOLEAN DEFAULT FALSE,
        device_id TEXT NOT NULL,          -- Pseudonymous device identifier
        FOREIGN KEY (exam_id) REFERENCES exams(id)
      );

      -- Individual question responses within attempts
      CREATE TABLE IF NOT EXISTS attempt_items (
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        given_answers TEXT NOT NULL,      -- JSON array of selected choice IDs
        is_correct BOOLEAN NOT NULL,
        partial_score REAL DEFAULT 0.0,   -- For partial credit questions
        time_spent_seconds INTEGER NOT NULL,
        flagged BOOLEAN DEFAULT FALSE,
        reviewed BOOLEAN DEFAULT FALSE,
        answered_at INTEGER NOT NULL,
        PRIMARY KEY (attempt_id, question_id),
        FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      );

      -- Aggregated progress tracking by topic
      CREATE TABLE IF NOT EXISTS progress (
        exam_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        questions_attempted INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        accuracy REAL DEFAULT 0.0,
        proficiency_score REAL DEFAULT 0.5,  -- EWMA-based proficiency (0.0-1.0)
        last_practiced_at INTEGER,
        practice_streak INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,   -- seconds
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (exam_id, topic_id),
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (topic_id) REFERENCES topics(id)
      );

      -- User preferences and settings
      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      -- Content pack metadata and versioning
      CREATE TABLE IF NOT EXISTS content_packs (
        exam_id TEXT NOT NULL,
        version TEXT NOT NULL,
        sha256_hash TEXT NOT NULL,
        installed_at INTEGER NOT NULL,
        file_size INTEGER NOT NULL,
        question_count INTEGER NOT NULL,
        exhibit_count INTEGER NOT NULL,
        status TEXT DEFAULT 'active',     -- 'active', 'updating', 'archived'
        PRIMARY KEY (exam_id, version),
        FOREIGN KEY (exam_id) REFERENCES exams(id)
      );

      -- Indexes for performance optimization
      CREATE INDEX IF NOT EXISTS idx_questions_exam_topic ON questions(exam_id, topic_id);
      CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
      CREATE INDEX IF NOT EXISTS idx_attempts_exam_completed ON attempts(exam_id, is_completed);
      CREATE INDEX IF NOT EXISTS idx_attempt_items_question ON attempt_items(question_id);
      CREATE INDEX IF NOT EXISTS idx_progress_exam_accuracy ON progress(exam_id, accuracy);
      CREATE INDEX IF NOT EXISTS idx_progress_last_practiced ON progress(last_practiced_at);
    `;
  }

  /**
   * Load test fixtures for development and testing
   */
  public async loadFixtures(): Promise<void> {
    if (!this.db) {
      throw new Error('Database connection not available');
    }

    const now = Date.now();

    try {
      // Insert test exam
      this.db.execute(`
        INSERT OR REPLACE INTO exams 
        (id, name, code, provider, version, total_questions, time_limit_minutes, passing_score, blueprint_version, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'cbap',
        'Certified Business Analysis Professional',
        'CBAP',
        'IIBA',
        '2025.01.01',
        150,
        210,
        0.70,
        'v4.0',
        now,
        now,
      ]);

      // Insert test topic
      this.db.execute(`
        INSERT OR REPLACE INTO topics 
        (id, exam_id, name, short_name, description, weight, icon, color, order_index) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'cbap_planning',
        'cbap',
        'Business Analysis Planning',
        'Planning',
        'Planning and monitoring of business analysis activities',
        0.16,
        '🎯',
        '#2B5CE6',
        1,
      ]);

      // Insert test question
      const questionContent = JSON.stringify({
        stem: 'Which activity is part of Business Analysis Planning?',
        choices: [
          {id: 'A', text: 'Define stakeholder roles and responsibilities', isCorrect: true},
          {id: 'B', text: 'Elicit requirements from stakeholders', isCorrect: false},
          {id: 'C', text: 'Test the final solution', isCorrect: false},
          {id: 'D', text: 'Implement approved changes', isCorrect: false},
        ],
        correct: ['A'],
        shuffleChoices: true,
      });

      this.db.execute(`
        INSERT OR REPLACE INTO questions 
        (id, exam_id, topic_id, question_type, difficulty, content_json, explanation, reference, tags, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'q_cbap_planning_001',
        'cbap',
        'cbap_planning',
        'single',
        'medium',
        questionContent,
        'Business Analysis Planning involves defining how BA activities will be conducted, including stakeholder roles and responsibilities.',
        'BABOK 3.1.2',
        JSON.stringify(['planning', 'stakeholder', 'roles']),
        now,
        now,
      ]);

      // Insert content pack metadata
      this.db.execute(`
        INSERT OR REPLACE INTO content_packs 
        (exam_id, version, sha256_hash, installed_at, file_size, question_count, exhibit_count, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'cbap',
        '2025.01.01',
        'test_hash_123',
        now,
        1024,
        1,
        0,
        'active',
      ]);

      console.log('Test fixtures loaded successfully');
    } catch (error) {
      console.error('Failed to load test fixtures:', error);
      throw error;
    }
  }

  /**
   * Check if a table exists in the database
   */
  public tableExists(tableName: string): boolean {
    if (!this.db) {
      throw new Error('Database connection not available');
    }

    const result = this.db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
    );

    return Boolean(result && result.rows && result.rows.length > 0);
  }

  /**
   * Get all table names in the database
   */
  public getAllTables(): string[] {
    if (!this.db) {
      throw new Error('Database connection not available');
    }

    const result = this.db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );

    if (result && result.rows) {
      // Handle both real SQLite result (with .item()) and mock array
      if (Array.isArray(result.rows)) {
        return result.rows.map((row: {name: string}) => row.name);
      } else {
        // Real SQLite result set
        const tables: string[] = [];
        for (let i = 0; i < result.rows.length; i++) {
          const row = result.rows.item(i);
          tables.push(row.name as string);
        }
        return tables;
      }
    }
    return [];
  }
}