import PageHeader from '@/components/layout/PageHeader';
import RecordTimeline from '@/components/records/RecordTimeline';

export default function Records() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="操作记录" 
        subtitle="所有预留操作的完整日志"
      />
      
      <div className="flex-1 p-8 bg-cream-50">
        <RecordTimeline />
      </div>
    </div>
  );
}
