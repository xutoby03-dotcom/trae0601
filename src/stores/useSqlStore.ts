import { create } from 'zustand';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { databases, defaultDatabaseId } from '@/data/databases';
import type { QueryResult, Database as DatabaseSchema } from '@/types';

interface SqlState {
  sqlJsInstance: SqlJsStatic | null;
  databases: Map<string, Database>;
  currentDatabaseId: string;
  currentDatabaseSchema: DatabaseSchema | null;
  isInitializing: boolean;
  initError: string | null;
  initializeSqlEngine: () => Promise<void>;
  switchDatabase: (dbId: string) => void;
  executeQuery: (sql: string) => Promise<QueryResult>;
}

export const useSqlStore = create<SqlState>((set, get) => ({
  sqlJsInstance: null,
  databases: new Map(),
  currentDatabaseId: defaultDatabaseId,
  currentDatabaseSchema: null,
  isInitializing: true,
  initError: null,

  initializeSqlEngine: async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      const dbMap = new Map<string, Database>();

      for (const dbSchema of databases) {
        const db = new SQL.Database();
        db.run(dbSchema.sql);
        dbMap.set(dbSchema.id, db);
      }

      const currentSchema = databases.find((d) => d.id === defaultDatabaseId) || null;

      set({
        sqlJsInstance: SQL,
        databases: dbMap,
        currentDatabaseSchema: currentSchema,
        isInitializing: false,
      });
    } catch (error) {
      set({
        isInitializing: false,
        initError: error instanceof Error ? error.message : 'Failed to initialize SQL engine',
      });
    }
  },

  switchDatabase: (dbId: string) => {
    const schema = databases.find((d) => d.id === dbId);
    if (schema) {
      set({
        currentDatabaseId: dbId,
        currentDatabaseSchema: schema,
      });
    }
  },

  executeQuery: async (sql: string): Promise<QueryResult> => {
    const startTime = performance.now();
    const { databases, currentDatabaseId } = get();
    const db = databases.get(currentDatabaseId);

    if (!db) {
      return {
        columns: [],
        rows: [],
        error: 'Database not initialized',
        executionTime: 0,
      };
    }

    try {
      const results = db.exec(sql);
      const executionTime = performance.now() - startTime;

      if (results.length === 0) {
        const changes = db.getRowsModified();
        return {
          columns: [],
          rows: [],
          affectedRows: changes,
          executionTime,
        };
      }

      const lastResult = results[results.length - 1];
      return {
        columns: lastResult.columns,
        rows: lastResult.values,
        executionTime,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  },
}));
