import RecordForm from '@/components/Form/RecordForm';

export default function NewRecord() {
  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <RecordForm mode="create" />
    </div>
  );
}
