import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingAddButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/medicines/new')}
      className="fixed bottom-24 md:bottom-8 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      style={{ animation: 'bounceSubtle 2s infinite' }}
    >
      <Plus className="w-7 h-7" />
    </button>
  );
}
