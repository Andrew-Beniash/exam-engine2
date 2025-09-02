-- Initial database schema for Exam Engine
-- Based on the complete specification from doc/complete_exam_engine_spec.md

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