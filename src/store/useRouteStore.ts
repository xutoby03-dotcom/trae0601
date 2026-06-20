import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Route, Grade, RouteStatus } from '@/types';
import { MOCK_ROUTES } from '@/data/mockData';

interface RouteState {
  routes: Route[];
  selectedRouteId: string | null;
  filterGrade: Grade | 'all';
  filterStatus: RouteStatus | 'all';
  searchQuery: string;
}

interface RouteActions {
  setSelectedRoute: (id: string | null) => void;
  setFilterGrade: (grade: Grade | 'all') => void;
  setFilterStatus: (status: RouteStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  updateRouteStatus: (id: string, status: RouteStatus) => void;
  getFilteredRoutes: () => Route[];
  getRouteById: (id: string) => Route | undefined;
}

export const useRouteStore = create<RouteState & RouteActions>()(
  persist(
    (set, get) => ({
      routes: MOCK_ROUTES,
      selectedRouteId: null,
      filterGrade: 'all',
      filterStatus: 'all',
      searchQuery: '',

      setSelectedRoute: (id) => set({ selectedRouteId: id }),
      setFilterGrade: (grade) => set({ filterGrade: grade }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      addRoute: (route) => {
        const newRoute: Route = {
          ...route,
          id: `route-${Date.now()}`,
        };
        set((state) => ({ routes: [...state.routes, newRoute] }));
      },

      updateRoute: (id, updates) => {
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRoute: (id) => {
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
          selectedRouteId: state.selectedRouteId === id ? null : state.selectedRouteId,
        }));
      },

      updateRouteStatus: (id, status) => {
        set((state) => ({
          routes: state.routes.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
      },

      getFilteredRoutes: () => {
        const { routes, filterGrade, filterStatus, searchQuery } = get();
        return routes.filter((route) => {
          const matchGrade = filterGrade === 'all' || route.grade === filterGrade;
          const matchStatus = filterStatus === 'all' || route.status === filterStatus;
          const matchSearch = searchQuery === '' ||
            route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.setter.toLowerCase().includes(searchQuery.toLowerCase());
          return matchGrade && matchStatus && matchSearch;
        });
      },

      getRouteById: (id) => {
        return get().routes.find((r) => r.id === id);
      },
    }),
    {
      name: 'climb-route-storage',
    }
  )
);
