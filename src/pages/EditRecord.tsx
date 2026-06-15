import { useParams, Navigate } from 'react-router-dom';
import { useCoffeeStore } from '@/store/coffeeStore';
import RecordForm from '@/components/Form/RecordForm';

export default function EditRecord() {
  const { id } = useParams<{ id: string }>();
  const getRecordById = useCoffeeStore((s) => s.getRecordById);
  const record = id ? getRecordById(id) : undefined;

  if (!record) {
    return <Navigate to="/records" replace />;
  }

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <RecordForm mode="edit" initialData={record} />
    </div>
  );
}
