import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Page } from './types';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { RecordsPage } from './pages/RecordsPage';
import { SummaryPage } from './pages/SummaryPage';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleViewDetail = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setPage('customer-detail');
  };

  const handleBack = () => {
    setPage('customers');
  };

  const handlePageChange = (newPage: Page) => {
    if (newPage === 'customer-detail') return;
    setSelectedCustomerId(null);
    setPage(newPage);
  };

  return (
    <AppProvider>
      {page === 'dashboard' && (
        <DashboardPage page="dashboard" onPageChange={handlePageChange} onViewDetail={handleViewDetail} />
      )}
      {page === 'customers' && (
        <CustomersPage page="customers" onPageChange={handlePageChange} onViewDetail={handleViewDetail} />
      )}
      {page === 'customer-detail' && selectedCustomerId && (
        <CustomerDetailPage
          customerId={selectedCustomerId}
          page="customer-detail"
          onPageChange={handlePageChange}
          onBack={handleBack}
        />
      )}
      {page === 'records' && (
        <RecordsPage page="records" onPageChange={handlePageChange} />
      )}
      {page === 'summary' && (
        <SummaryPage page="summary" onPageChange={handlePageChange} onViewDetail={handleViewDetail} />
      )}
    </AppProvider>
  );
};

export default App;
