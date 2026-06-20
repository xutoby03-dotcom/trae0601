import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import CounterList from '@/pages/counters/CounterList';
import CounterDetail from '@/pages/counters/CounterDetail';
import InventoryOverview from '@/pages/inventory/InventoryOverview';
import InspectionForm from '@/pages/inspection/InspectionForm';
import InspectionRecords from '@/pages/inspection/InspectionRecords';
import TaskBoard from '@/pages/tasks/TaskBoard';
import TaskDetail from '@/pages/tasks/TaskDetail';
import ActivityCalendar from '@/pages/activities/ActivityCalendar';
import ConsumptionAnalysis from '@/pages/statistics/ConsumptionAnalysis';
import ShortageAnalysis from '@/pages/statistics/ShortageAnalysis';
import PurchaseSuggestion from '@/pages/statistics/PurchaseSuggestion';
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'counters',
        element: <CounterList />,
      },
      {
        path: 'counters/:id',
        element: <CounterDetail />,
      },
      {
        path: 'inventory',
        element: <InventoryOverview />,
      },
      {
        path: 'inspection',
        element: <InspectionForm />,
      },
      {
        path: 'inspection/records',
        element: <InspectionRecords />,
      },
      {
        path: 'tasks',
        element: <TaskBoard />,
      },
      {
        path: 'tasks/board',
        element: <Navigate to="/tasks" replace />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetail />,
      },
      {
        path: 'activities',
        element: <ActivityCalendar />,
      },
      {
        path: 'statistics/consumption',
        element: <ConsumptionAnalysis />,
      },
      {
        path: 'statistics/shortage',
        element: <ShortageAnalysis />,
      },
      {
        path: 'statistics/purchase',
        element: <PurchaseSuggestion />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
