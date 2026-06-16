import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CableForm } from '@/components/features/cable/CableForm';
import { useAppStore } from '@/store/useAppStore';

export default function CableNew() {
  const { currentUser } = useAppStore();

  if (!currentUser?.isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  return (
    <Layout requireAdmin>
      <CableForm />
    </Layout>
  );
}
