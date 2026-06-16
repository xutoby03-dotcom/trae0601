import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { FoodFormModal } from '@/components/food/FoodFormModal';

export function AppLayout() {
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-slate-50">
      <Sidebar onAddClick={() => setShowAddModal(true)} />

      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>

      <FoodFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
