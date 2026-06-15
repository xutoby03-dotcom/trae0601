import { useParams, Navigate } from 'react-router-dom';
import { useCoffeeStore } from '@/store/coffeeStore';
import ReviseForm from '@/components/Form/ReviseForm';

export default function ReviseRecord() {
  const { id } = useParams<{ id: string }>();
  const getRecordById = useCoffeeStore((s) => s.getRecordById);
  const parentRecord = id ? getRecordById(id) : undefined;

  if (!parentRecord) {
    return <Navigate to="/records" replace />;
  }

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <ReviseForm parentRecord={parentRecord} />
    </div>
  );
}
