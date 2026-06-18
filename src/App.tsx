import { useWedding } from './context/WeddingContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GuestManagement from './components/GuestManagement';
import SeatingArrangement from './components/SeatingArrangement';
import TableCards from './components/TableCards';
import KitchenOrders from './components/KitchenOrders';

function App() {
  const { activeTab } = useWedding();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'guests':
        return <GuestManagement />;
      case 'seating':
        return <SeatingArrangement />;
      case 'tableCards':
        return <TableCards />;
      case 'kitchen':
        return <KitchenOrders />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-wedding-cream">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
