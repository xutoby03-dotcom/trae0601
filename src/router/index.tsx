import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Dashboard } from '../pages/Dashboard';
import { EquipmentList } from '../pages/Equipment/EquipmentList';
import { EquipmentDetail } from '../pages/Equipment/EquipmentDetail';
import { EquipmentForm } from '../pages/Equipment/EquipmentForm';
import { MissionList } from '../pages/Missions/MissionList';
import { MissionDetail } from '../pages/Missions/MissionDetail';
import { MissionForm } from '../pages/Missions/MissionForm';
import { PackCheck } from '../pages/PackCheck';
import { ShootingRecord } from '../pages/ShootingRecord';
import { ReturnCheck } from '../pages/ReturnCheck';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'equipment', element: <EquipmentList /> },
      { path: 'equipment/new', element: <EquipmentForm /> },
      { path: 'equipment/:id', element: <EquipmentDetail /> },
      { path: 'equipment/:id/edit', element: <EquipmentForm /> },
      { path: 'missions', element: <MissionList /> },
      { path: 'missions/new', element: <MissionForm /> },
      { path: 'missions/:id', element: <MissionDetail /> },
      { path: 'missions/:id/edit', element: <MissionForm /> },
      { path: 'missions/:id/pack', element: <PackCheck /> },
      { path: 'missions/:id/shooting', element: <ShootingRecord /> },
      { path: 'missions/:id/return', element: <ReturnCheck /> },
    ],
  },
]);
