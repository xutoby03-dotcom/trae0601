import { useNavigate } from 'react-router-dom';
import { ACForm } from '@/components/air-conditioner/ACForm';
import { useAppStore } from '@/store/useAppStore';
import type { ACFormData } from '@/types';

export default function ACNew() {
  const navigate = useNavigate();
  const { addAirConditioner } = useAppStore();

  const handleSubmit = (data: ACFormData) => {
    addAirConditioner(data);
    navigate('/air-conditioners');
  };

  return <ACForm onSubmit={handleSubmit} />;
}
