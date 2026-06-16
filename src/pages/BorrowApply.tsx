import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BorrowForm } from '@/components/features/borrow/BorrowForm';
import { useAppStore } from '@/store/useAppStore';

export default function BorrowApply() {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  return (
    <Layout>
      <BorrowForm />
    </Layout>
  );
}
