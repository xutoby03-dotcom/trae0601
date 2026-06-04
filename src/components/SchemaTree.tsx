import { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table, Key, Link2, Hash, Columns } from 'lucide-react';
import { useSqlStore } from '@/stores/useSqlStore';
import { databases } from '@/data/databases';
import type { Column } from '@/types';
import { cn } from '@/lib/utils';

export function SchemaTree() {
  const { currentDatabaseId, currentDatabaseSchema, switchDatabase } = useSqlStore();
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set(['northwind']));
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleDb = (dbId: string) => {
    setExpandedDbs((prev) => {
      const next = new Set(prev);
      if (next.has(dbId)) {
        next.delete(dbId);
      } else {
        next.add(dbId);
      }
      return next;
    });
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      const key = `${currentDatabaseId}-${tableName}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectDatabase = (dbId: string) => {
    switchDatabase(dbId);
    if (!expandedDbs.has(dbId)) {
      toggleDb(dbId);
    }
  };

  const getColumnIcon = (column: Column) => {
    if (column.isPrimaryKey) {
      return <Key className="w-3 h-3 text-yellow-500" />;
    }
    if (column.isForeignKey) {
      return <Link2 className="w-3 h-3 text-blue-500" />;
    }
    return <Columns className="w-3 h-3 text-gray-500" />;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">数据库</h2>
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm">
        {databases.map((db) => (
          <div key={db.id} className="mb-1">
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors',
                currentDatabaseId === db.id && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              )}
              onClick={() => selectDatabase(db.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDb(db.id);
                }}
                className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
              >
                {expandedDbs.has(db.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium truncate">{db.name}</span>
            </div>

            {expandedDbs.has(db.id) && (
              <div className="ml-6 mt-1">
                {db.tables.map((table) => (
                  <div key={table.name} className="mb-0.5">
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => toggleTable(table.name)}
                    >
                      {expandedTables.has(`${db.id}-${table.name}`) ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <Table className="w-3.5 h-3.5 text-purple-500" />
                      <span className="truncate text-gray-700 dark:text-gray-300">{table.name}</span>
                    </div>

                    {expandedTables.has(`${db.id}-${table.name}`) && (
                      <div className="ml-5 mt-0.5 space-y-0.5">
                        {table.columns.map((col) => (
                          <div
                            key={col.name}
                            className="flex items-center gap-2 px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-default group"
                            title={`${col.type}${col.isNullable ? ' NULL' : ' NOT NULL'}${col.hasIndex ? ' [INDEX]' : ''}`}
                          >
                            {getColumnIcon(col)}
                            <span className="flex-1 truncate text-gray-600 dark:text-gray-400">
                              {col.name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                              {col.type.toLowerCase()}
                            </span>
                            {col.hasIndex && (
                              <Hash className="w-3 h-3 text-cyan-500 opacity-60" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentDatabaseSchema && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <p>{currentDatabaseSchema.description}</p>
          <p className="mt-1">
            {currentDatabaseSchema.tables.length} 张表
          </p>
        </div>
      )}
    </div>
  );
}
