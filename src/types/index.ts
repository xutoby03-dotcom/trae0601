import type {
  Member as SharedMember,
  Dish as SharedDish,
  Plan as SharedPlan,
  Table as SharedTable,
  Seating as SharedSeating,
  Conflict as SharedConflict,
  DashboardStats as SharedDashboardStats,
} from '../../shared/types';

declare global {
  type Member = SharedMember;
  type Dish = SharedDish;
  type Plan = SharedPlan;
  type Table = SharedTable;
  type Seating = SharedSeating;
  type Conflict = SharedConflict;
  type DashboardStats = SharedDashboardStats;
}

export {};
