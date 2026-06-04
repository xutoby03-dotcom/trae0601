import { northwindDatabase } from './northwind';
import { employeeDatabase } from './employee';
import { bookstoreDatabase } from './bookstore';
import type { Database } from '@/types';

export const databases: Database[] = [
  northwindDatabase,
  employeeDatabase,
  bookstoreDatabase,
];

export const getDatabaseById = (id: string): Database | undefined => {
  return databases.find((db) => db.id === id);
};

export const defaultDatabaseId = 'northwind';
