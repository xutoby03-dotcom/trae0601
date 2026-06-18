import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import { useSupplyStore } from '../../store/useSupplyStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';

export function AppLayout() {
  const initCoffee = useCoffeeStore((state) => state.initData);
  const initSupply = useSupplyStore((state) => state.initData);
  const initPurchase = usePurchaseStore((state) => state.initData);
  const logs = useCoffeeStore((state) => state.logs);

  useEffect(() => {
    initCoffee();
    initSupply();
    initPurchase();
  }, [initCoffee, initSupply, initPurchase]);

  useEffect(() => {
    const today = new Date().toDateString();
    const todayConsumption = logs
      .filter((log) => new Date(log.consumedAt).toDateString() === today)
      .reduce((sum, log) => sum + log.quantity, 0);
    
    const el = document.getElementById('today-consumption');
    if (el) {
      el.textContent = String(todayConsumption);
    }
  }, [logs]);

  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
