import { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { Guest } from '../types';
import GuestForm from './GuestForm';
import GuestCard from './GuestCard';

const GROUPS = [
  { key: 'all', label: '全部宾客' },
  { key: 'bride', label: '女方亲友' },
  { key: 'groom', label: '男方亲友' },
  { key: 'friend', label: '朋友' },
  { key: 'colleague', label: '同事' },
  { key: 'other', label: '其他' },
];

export default function GuestManagement() {
  const { guests, deleteGuest, toggleConfirmed } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuests = guests.filter(guest => {
    if (activeFilter !== 'all' && guest.group !== activeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        guest.name.toLowerCase().includes(query) ||
        guest.relation.toLowerCase().includes(query) ||
        guest.allergens.some(a => a.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleAdd = () => {
    setEditingGuest(null);
    setShowForm(true);
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingGuest(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-wedding-dark">宾客管理</h2>
        <p className="text-gray-500 text-sm mt-1">管理所有宾客的详细信息，包括饮食禁忌和过敏原</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="搜索宾客姓名、关系、过敏原..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {GROUPS.map(group => (
              <button
                key={group.key}
                onClick={() => setActiveFilter(group.key)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  activeFilter === group.key
                    ? 'bg-wedding-rose text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium"
          >
            + 添加宾客
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map(guest => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onEdit={handleEdit}
            onDelete={deleteGuest}
            onToggleConfirm={toggleConfirmed}
          />
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-4">👥</p>
          <p>暂无宾客数据</p>
        </div>
      )}

      {showForm && (
        <GuestForm
          guest={editingGuest}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
