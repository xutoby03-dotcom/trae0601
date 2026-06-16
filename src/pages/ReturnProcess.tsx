import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ReturnForm } from '@/components/features/return/ReturnForm';
import { useAppStore } from '@/store/useAppStore';

export default function ReturnProcess() {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  return (
    <Layout>
      <ReturnForm />
    </Layout>
  );
}
