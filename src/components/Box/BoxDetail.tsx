import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Ruler, Scale, Repeat, Calendar, Info } from 'lucide-react';
import type { Box } from '@/types';
import { useBoxStore } from '@/store/useBoxStore';
import { useBorrowStore } from '@/store/useBorrowStore';
import { formatDateCN } from '@/utils/date';
import { getCategoryLabel, getStatusLabel, getStatusColor } from '@/utils/condition';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import BorrowTimeline from './BorrowTimeline';
import BoxForm from './BoxForm';

interface BoxDetailProps {
  boxId?: string;
}

export default function BoxDetail({ boxId: propBoxId }: BoxDetailProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boxId = propBoxId || paramId || '';

  const { getBoxById, deleteBox } = useBoxStore();
  const { getRecordsByBoxId } = useBorrowStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const box = getBoxById(boxId);
  const borrowRecords = getRecordsByBoxId(boxId);

  if (!box) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        <Info size={64} className="mb-4 opacity-30" />
        <p className="text-lg mb-4">纸箱不存在</p>
        <Button onClick={() => navigate('/boxes')}>返回列表</Button>
      </motion.div>
    );
  }

  const canEdit = box.status !== 'in_use' && box.status !== 'scrapped';
  const canDelete = box.status !== 'in_use';

  const handleEditSubmit = (data: Omit<Box, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>) => {
    useBoxStore.getState().updateBox(boxId, data);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    deleteBox(boxId);
    setShowDeleteConfirm(false);
    navigate('/boxes');
  };

  const handleBack = () => {
    navigate('/boxes');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">纸箱详情</h1>
            <p className="text-sm text-muted-foreground">ID: {box.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => setShowEditModal(true)} className="flex items-center gap-2">
              <Edit size={16} />
              编辑
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2">
              <Trash2 size={16} />
              删除
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-6">
              <div className="relative h-64 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                {box.photo ? (
                  <img
                    src={box.photo}
                    alt={`纸箱 ${box.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-8xl ${box.photo ? 'hidden' : ''}`}>📦</div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="info">{getCategoryLabel(box.category)}</Badge>
                <Badge className={getStatusColor(box.status)}>
                  {getStatusLabel(box.status)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Ruler size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">尺寸</p>
                    <p className="font-medium">{box.length} × {box.width} × {box.height} cm</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Scale size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">承重</p>
                    <p className="font-medium">{box.loadCapacity} kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">使用次数</p>
                    <p className="font-medium">{box.usageCount} 次</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">创建时间</p>
                    <p className="font-medium">{formatDateCN(box.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">来源</p>
                <p className="font-medium">{box.source}</p>
              </div>

              {box.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">备注</p>
                  <p className="text-foreground">{box.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="借还记录">
            <BorrowTimeline borrowRecords={borrowRecords} />
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={box ? '编辑纸箱' : '添加纸箱'}
      >
        <BoxForm
          box={box}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            确定要删除这个纸箱吗？此操作不可撤销。
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              确认删除
            </Button>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
