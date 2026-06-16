import { useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CableForm } from '@/components/features/cable/CableForm';
import { useAppStore } from '@/store/useAppStore';

export default function CableEdit() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, getCableById } = useAppStore();

  if (!currentUser?.isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  const cable = id ? getCableById(id) : undefined;

  if (!cable) {
    return <Navigate to="/cables" />;
  }

  return (
    <Layout requireAdmin>
      <CableForm initialData={cable} />
    </Layout>
  );
}
