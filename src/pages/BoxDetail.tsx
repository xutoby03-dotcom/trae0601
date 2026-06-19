import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { BoxDetail as BoxDetailComponent } from '@/components/Box';
import Button from '@/components/ui/Button';

export default function BoxDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getBoxById = useBoxStore((state) => state.getBoxById);

  const box = getBoxById(id || '');

  if (!box) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        <Info size={64} className="mb-4 opacity-30" />
        <p className="text-lg mb-4">纸箱不存在</p>
        <Button onClick={() => navigate('/boxes')} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          返回列表
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <BoxDetailComponent boxId={id} />
      <div className="flex justify-start">
        <Button variant="secondary" onClick={() => navigate('/boxes')} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          返回列表
        </Button>
      </div>
    </div>
  );
}
