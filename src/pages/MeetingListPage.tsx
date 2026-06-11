import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import MeetingCard from '@/components/meeting/MeetingCard';
import MeetingForm from '@/components/meeting/MeetingForm';
import Empty from '@/components/Empty';
import Button from '@/components/common/Button';
import { useTodoStore } from '@/store/todoStore';
import { Meeting } from '@/types';

export default function MeetingListPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { meetings, todos, addMeeting } = useTodoStore();

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const getMeetingTodoStats = (meetingId: string) => {
    const meetingTodos = todos.filter((t) => t.meetingId === meetingId);
    const completed = meetingTodos.filter((t) => t.status === 'completed').length;
    return {
      todoCount: meetingTodos.length,
      completedTodoCount: completed,
    };
  };

  const handleViewMeeting = (meeting: Meeting) => {
    navigate(`/meetings/${meeting.id}`);
  };

  const handleCreateMeeting = (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMeeting(data);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会议管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {filteredMeetings.length} 场会议
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
          新建会议
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索会议标题..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => {
            const stats = getMeetingTodoStats(meeting.id);
            return (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                todoCount={stats.todoCount}
                completedTodoCount={stats.completedTodoCount}
                onView={handleViewMeeting}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-64">
          <Empty />
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative w-full max-w-xl">
            <MeetingForm
              onSubmit={handleCreateMeeting}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
