import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, User, Phone, MapPin, Calendar, ArrowRight, FileText, Users, Truck } from 'lucide-react';
import type { Friend, MovePlan } from '@/types';
import { useFriendStore } from '@/store/useFriendStore';
import { useMovePlanStore } from '@/store/useMovePlanStore';
import { formatDateCN } from '@/utils/date';
import Drawer from '@/components/ui/Drawer';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

type TabType = 'friends' | 'plans';

const tabs: Array<{ value: TabType; label: string; icon: typeof User }> = [
  { value: 'friends', label: '朋友清单', icon: Users },
  { value: 'plans', label: '搬家计划', icon: Truck },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface FriendFormProps {
  friend?: Friend;
  onSubmit: (data: Omit<Friend, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function FriendForm({ friend, onSubmit, onCancel }: FriendFormProps) {
  const [formData, setFormData] = useState({
    name: friend?.name || '',
    avatar: friend?.avatar || '',
    community: friend?.community || '',
    phone: friend?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入姓名';
    if (!formData.community.trim()) newErrors.community = '请输入小区';
    if (!formData.phone.trim()) newErrors.phone = '请输入电话';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="姓名"
          placeholder="请输入姓名"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
        />
        <Input
          label="头像 (可选)"
          placeholder="输入头像emoji或图片链接"
          value={formData.avatar}
          onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="小区"
          placeholder="请输入小区名称"
          value={formData.community}
          onChange={(e) => setFormData((prev) => ({ ...prev, community: e.target.value }))}
          error={errors.community}
        />
        <Input
          label="电话"
          placeholder="请输入联系电话"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          error={errors.phone}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          {friend ? '保存修改' : '添加朋友'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
}

interface MovePlanFormProps {
  plan?: MovePlan;
  friends: Friend[];
  onSubmit: (data: Omit<MovePlan, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function MovePlanForm({ plan, friends, onSubmit, onCancel }: MovePlanFormProps) {
  const [formData, setFormData] = useState({
    friendId: plan?.friendId || '',
    moveDate: plan?.moveDate || new Date().toISOString().split('T')[0],
    fromCommunity: plan?.fromCommunity || '',
    toCommunity: plan?.toCommunity || '',
    notes: plan?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const friendOptions = useMemo(() => {
    return friends.map((f) => ({
      value: f.id,
      label: f.name,
    }));
  }, [friends]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.friendId) newErrors.friendId = '请选择朋友';
    if (!formData.moveDate) newErrors.moveDate = '请选择日期';
    if (!formData.fromCommunity.trim()) newErrors.fromCommunity = '请输入搬出小区';
    if (!formData.toCommunity.trim()) newErrors.toCommunity = '请输入搬入小区';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="朋友"
            options={[{ value: '', label: '请选择朋友' }, ...friendOptions]}
            value={formData.friendId}
            onChange={(value) => setFormData((prev) => ({ ...prev, friendId: value }))}
          />
          {errors.friendId && (
            <p className="text-sm text-red-500 mt-1">{errors.friendId}</p>
          )}
        </div>
        <Input
          label="搬家日期"
          type="date"
          value={formData.moveDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, moveDate: e.target.value }))}
          error={errors.moveDate}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="搬出小区"
          placeholder="请输入搬出小区名称"
          value={formData.fromCommunity}
          onChange={(e) => setFormData((prev) => ({ ...prev, fromCommunity: e.target.value }))}
          error={errors.fromCommunity}
        />
        <Input
          label="搬入小区"
          placeholder="请输入搬入小区名称"
          value={formData.toCommunity}
          onChange={(e) => setFormData((prev) => ({ ...prev, toCommunity: e.target.value }))}
          error={errors.toCommunity}
        />
      </div>
      <Textarea
        label="备注 (可选)"
        rows={3}
        placeholder="输入备注信息..."
        value={formData.notes}
        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          {plan ? '保存修改' : '添加计划'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
}

export default function Friends() {
  const { friends, addFriend, updateFriend, deleteFriend } = useFriendStore();
  const { movePlans, addMovePlan, updateMovePlan, deleteMovePlan } = useMovePlanStore();

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [showFriendDrawer, setShowFriendDrawer] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | undefined>();
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MovePlan | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: 'friend' | 'plan';
    id: string;
  } | null>(null);

  const handleAddFriend = () => {
    setEditingFriend(undefined);
    setShowFriendDrawer(true);
  };

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setShowFriendDrawer(true);
  };

  const handleFriendSubmit = (data: Omit<Friend, 'id' | 'createdAt'>) => {
    if (editingFriend) {
      updateFriend(editingFriend.id, data);
    } else {
      addFriend(data);
    }
    setShowFriendDrawer(false);
    setEditingFriend(undefined);
  };

  const handleDeleteFriend = (id: string) => {
    setShowDeleteConfirm({ type: 'friend', id });
  };

  const handleAddPlan = () => {
    setEditingPlan(undefined);
    setShowPlanDrawer(true);
  };

  const handleEditPlan = (plan: MovePlan) => {
    setEditingPlan(plan);
    setShowPlanDrawer(true);
  };

  const handlePlanSubmit = (data: Omit<MovePlan, 'id' | 'createdAt'>) => {
    if (editingPlan) {
      updateMovePlan(editingPlan.id, data);
    } else {
      addMovePlan(data);
    }
    setShowPlanDrawer(false);
    setEditingPlan(undefined);
  };

  const handleDeletePlan = (id: string) => {
    setShowDeleteConfirm({ type: 'plan', id });
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;
    if (showDeleteConfirm.type === 'friend') {
      deleteFriend(showDeleteConfirm.id);
    } else {
      deleteMovePlan(showDeleteConfirm.id);
    }
    setShowDeleteConfirm(null);
  };

  const getFriendById = (id: string) => friends.find((f) => f.id === id);

  const sortedPlans = useMemo(() => {
    return [...movePlans].sort(
      (a, b) => new Date(a.moveDate).getTime() - new Date(b.moveDate).getTime()
    );
  }, [movePlans]);

  const tabCounts = useMemo(() => ({
    friends: friends.length,
    plans: movePlans.length,
  }), [friends.length, movePlans.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">👥 朋友管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的朋友和搬家计划
          </p>
        </div>
        {activeTab === 'friends' ? (
          <Button onClick={handleAddFriend} className="flex items-center gap-2">
            <Plus size={18} />
            添加朋友
          </Button>
        ) : (
          <Button onClick={handleAddPlan} className="flex items-center gap-2">
            <Plus size={18} />
            添加搬家计划
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={16} />
              {tab.label}
              <Badge variant={activeTab === tab.value ? 'default' : 'default'}>
                {tabCounts[tab.value]}
              </Badge>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'friends' ? (
          <motion.div
            key="friends"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {friends.length > 0 ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {friends.map((friend) => (
                  <motion.div key={friend.id} variants={item}>
                    <Card hoverable>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                            {friend.avatar ? (
                              <span className="text-3xl">{friend.avatar}</span>
                            ) : (
                              <User size={24} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {friend.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin size={12} />
                              <span>{friend.community}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone size={14} />
                          <span>{friend.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditFriend(friend)}
                          className="flex-1 flex items-center gap-1"
                        >
                          <Edit2 size={14} />
                          编辑
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteFriend(friend.id)}
                          className="flex-1 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          删除
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Empty
                icon={<Users size={32} className="text-muted-foreground" />}
                title="暂无朋友"
                description="点击右上角添加按钮添加您的第一位朋友"
                action={
                  <Button onClick={handleAddFriend} className="flex items-center gap-2">
                    <Plus size={16} />
                    添加朋友
                  </Button>
                }
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="plans"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {sortedPlans.length > 0 ? (
              <div className="space-y-4">
                {sortedPlans.map((plan, index) => {
                  const friend = getFriendById(plan.friendId);
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card hoverable>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                              {friend?.avatar ? (
                                <span className="text-2xl">{friend.avatar}</span>
                              ) : (
                                <Calendar size={20} className="text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Calendar size={14} className="text-primary" />
                                <span className="font-semibold text-foreground">
                                  {formatDateCN(plan.moveDate)}
                                </span>
                                <Badge variant="info">{friend?.name || '未知朋友'}</Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin size={14} className="text-green-500 flex-shrink-0" />
                                <span className="truncate">{plan.fromCommunity}</span>
                                <ArrowRight size={14} className="flex-shrink-0" />
                                <MapPin size={14} className="text-red-500 flex-shrink-0" />
                                <span className="truncate">{plan.toCommunity}</span>
                              </div>
                              {plan.notes && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{plan.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 md:flex-shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditPlan(plan)}
                              className="flex items-center gap-1"
                            >
                              <Edit2 size={14} />
                              编辑
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              删除
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Empty
                icon={<Truck size={32} className="text-muted-foreground" />}
                title="暂无搬家计划"
                description="点击右上角添加按钮创建您的第一个搬家计划"
                action={
                  <Button onClick={handleAddPlan} className="flex items-center gap-2">
                    <Plus size={16} />
                    添加搬家计划
                  </Button>
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer
        isOpen={showFriendDrawer}
        onClose={() => {
          setShowFriendDrawer(false);
          setEditingFriend(undefined);
        }}
        title={editingFriend ? '编辑朋友' : '添加朋友'}
        placement="right"
      >
        <FriendForm
          friend={editingFriend}
          onSubmit={handleFriendSubmit}
          onCancel={() => {
            setShowFriendDrawer(false);
            setEditingFriend(undefined);
          }}
        />
      </Drawer>

      <Drawer
        isOpen={showPlanDrawer}
        onClose={() => {
          setShowPlanDrawer(false);
          setEditingPlan(undefined);
        }}
        title={editingPlan ? '编辑搬家计划' : '添加搬家计划'}
        placement="right"
      >
        <MovePlanForm
          plan={editingPlan}
          friends={friends}
          onSubmit={handlePlanSubmit}
          onCancel={() => {
            setShowPlanDrawer(false);
            setEditingPlan(undefined);
          }}
        />
      </Drawer>

      <Modal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            确定要删除这个{showDeleteConfirm?.type === 'friend' ? '朋友' : '搬家计划'}吗？此操作不可撤销。
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={confirmDelete} className="flex-1">
              确认删除
            </Button>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
