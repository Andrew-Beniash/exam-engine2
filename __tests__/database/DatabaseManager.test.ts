import {DatabaseManager} from '../../src/services/database/DatabaseManager';

// Mock react-native-quick-sqlite
jest.mock('react-native-quick-sqlite', () => {
  const mockDB = {
    execute: jest.fn(),
    close: jest.fn(),
  };

  return {
    open: jest.fn(() => mockDB),
  };
});

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;
  let mockExecute: jest.Mock;
  let mockClose: jest.Mock;

  beforeEach(() => {
    // Reset singleton instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (DatabaseManager as any).instance = undefined;
    
    dbManager = DatabaseManager.getInstance();
    
    // Get mock functions
    const mockDB = require('react-native-quick-sqlite').open();
    mockExecute = mockDB.execute;
    mockClose = mockDB.close;
    
    // Reset mocks completely
    mockExecute.mockReset();
    mockClose.mockReset();
  });

  afterEach(async () => {
    await dbManager.close();
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = DatabaseManager.getInstance();
      const instance2 = DatabaseManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Database Initialization', () => {
    it('opens database and runs migrations', async () => {
      // Mock migrations table check (doesn't exist initially)
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();

      // Verify database operations
      expect(mockExecute).toHaveBeenCalledWith('PRAGMA foreign_keys = ON');
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations')
      );
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT version FROM migrations WHERE version = ?',
        ['001_initial']
      );
    });

    it('does not re-run already applied migrations', async () => {
      // Mock migrations table check (migration already applied)
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: [{version: '001_initial'}]}); // migration check - already applied

      await dbManager.initialize();

      // Verify the right calls were made
      expect(mockExecute).toHaveBeenCalledTimes(3); // PRAGMA + table creation + migration check
      expect(mockExecute).toHaveBeenNthCalledWith(1, 'PRAGMA foreign_keys = ON');
      expect(mockExecute).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'));
      expect(mockExecute).toHaveBeenNthCalledWith(3, 'SELECT version FROM migrations WHERE version = ?', ['001_initial']);
      
      // Should not execute the migration SQL
      expect(mockExecute).not.toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS exams')
      );
    });

    it('handles multiple initializations gracefully', async () => {
      // Mock first initialization
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();
      
      // Reset mock for second call
      mockExecute.mockClear();
      
      // Second initialization should not re-run migrations
      await dbManager.initialize();
      
      // Should not call execute again
      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  describe('Table Management', () => {
    beforeEach(async () => {
      // Mock initial setup
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();
      mockExecute.mockClear();
    });

    it('checks if table exists', () => {
      mockExecute.mockReturnValue({rows: [{name: 'exams'}]});

      const exists = dbManager.tableExists('exams');

      expect(exists).toBe(true);
      expect(mockExecute).toHaveBeenCalledWith(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        ['exams']
      );
    });

    it('returns false for non-existent table', () => {
      mockExecute.mockReturnValue({rows: []});

      const exists = dbManager.tableExists('non_existent');

      expect(exists).toBe(false);
    });

    it('gets all table names', () => {
      const mockTables = [
        {name: 'exams'},
        {name: 'topics'},
        {name: 'questions'},
        {name: 'attempts'},
      ];
      mockExecute.mockReturnValue({rows: mockTables});

      const tables = dbManager.getAllTables();

      expect(tables).toEqual(['exams', 'topics', 'questions', 'attempts']);
      expect(mockExecute).toHaveBeenCalledWith(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );
    });
  });

  describe('Expected Tables Creation', () => {
    const expectedTables = [
      'exams',
      'topics', 
      'questions',
      'exhibits',
      'question_exhibits',
      'attempts',
      'attempt_items',
      'progress',
      'user_preferences',
      'content_packs',
      'migrations'
    ];

    beforeEach(async () => {
      // Mock migrations setup and execution
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();
    });

    expectedTables.forEach(tableName => {
      it(`confirms ${tableName} table exists after migration`, () => {
        // Mock table exists check
        mockExecute.mockReturnValue({rows: [{name: tableName}]});

        const exists = dbManager.tableExists(tableName);
        
        expect(exists).toBe(true);
      });
    });

    it('creates all expected tables in migration', () => {
      // Verify the migration SQL contains all table creation statements
      const tablesToCheck = expectedTables.filter(tableName => tableName !== 'migrations');
      
      tablesToCheck.forEach(tableName => {
        expect(mockExecute).toHaveBeenCalledWith(
          expect.stringContaining(`CREATE TABLE IF NOT EXISTS ${tableName}`)
        );
      });
    });
  });

  describe('Fixture Loading', () => {
    beforeEach(async () => {
      // Mock initialization
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();
      mockExecute.mockClear();
    });

    it('loads test fixtures successfully', async () => {
      // Mock successful fixture insertion
      mockExecute
        .mockReturnValueOnce({rows: []}) // exam insertion
        .mockReturnValueOnce({rows: []}) // topic insertion
        .mockReturnValueOnce({rows: []}) // question insertion
        .mockReturnValueOnce({rows: []}); // content pack insertion

      await dbManager.loadFixtures();

      // Verify exam insertion
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO exams'),
        expect.arrayContaining([
          'cbap',
          'Certified Business Analysis Professional',
          'CBAP',
          'IIBA'
        ])
      );

      // Verify topic insertion
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO topics'),
        expect.arrayContaining([
          'cbap_planning',
          'cbap',
          'Business Analysis Planning'
        ])
      );

      // Verify question insertion
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO questions'),
        expect.arrayContaining([
          'q_cbap_planning_001',
          'cbap',
          'cbap_planning',
          'single',
          'medium'
        ])
      );

      // Verify content pack insertion
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO content_packs'),
        expect.arrayContaining([
          'cbap',
          '2025.01.01'
        ])
      );
    });

    it('includes proper question content structure', async () => {
      await dbManager.loadFixtures();

      // Find the question insertion call
      const questionCall = mockExecute.mock.calls.find(call => 
        call[0].includes('INSERT OR REPLACE INTO questions')
      );

      // Ensure we found the call and extract question content
      expect(questionCall).toBeDefined();
      expect(questionCall).not.toBeUndefined();
      
      const questionContent = JSON.parse(questionCall![1][5]); // content_json is the 6th parameter
      
      expect(questionContent).toEqual({
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
    });

    it('handles fixture loading errors gracefully', async () => {
      // Mock database error
      mockExecute.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(dbManager.loadFixtures()).rejects.toThrow('Database error');
    });
  });

  describe('Connection Management', () => {
    it('throws error when accessing connection before initialization', () => {
      const uninitializedManager = DatabaseManager.getInstance();
      
      expect(() => uninitializedManager.getConnection()).toThrow(
        'Database not initialized. Call initialize() first.'
      );
    });

    it('returns connection after initialization', async () => {
      // Mock initialization
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();

      const connection = dbManager.getConnection();
      
      expect(connection).toBeDefined();
      expect(connection.execute).toBeDefined();
    });

    it('closes database connection properly', async () => {
      // Mock initialization
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();
      await dbManager.close();

      expect(mockClose).toHaveBeenCalled();
    });

    it('handles multiple close calls gracefully', async () => {
      // Mock initialization
      mockExecute
        .mockReturnValueOnce({rows: []}) // PRAGMA foreign_keys = ON
        .mockReturnValueOnce({rows: []}) // migrations table creation
        .mockReturnValueOnce({rows: []}) // migration check - not applied
        .mockReturnValueOnce({rows: []}) // migration execution
        .mockReturnValueOnce({rows: []}); // migration record insertion

      await dbManager.initialize();
      await dbManager.close();
      await dbManager.close(); // Second close should not throw

      expect(mockClose).toHaveBeenCalledTimes(1); // Should only be called once
    });
  });
});