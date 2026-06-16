import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import { EventTimeline } from '../components/records/EventTimeline';
import { EventForm } from '../components/records/EventForm';
import { ExpenseList } from '../components/records/ExpenseList';
import { ExpenseForm } from '../components/records/ExpenseForm';
import { useFleetStore } from '../store/fleetStore';
import { EventRecord, Expense } from '../types';
import { Plus, Trash2, AlertCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/helpers';

type TabType = 'events' | 'expenses';

export default function Records() {
  const events = useFleetStore((state) => state.events);
  const expenses = useFleetStore((state) => state.expenses);
  const vehicles = useFleetStore((state) => state.vehicles);
  const people = useFleetStore((state) => state.people);
  const addEvent = useFleetStore((state) => state.addEvent);
  const updateEvent = useFleetStore((state) => state.updateEvent);
  const removeEvent = useFleetStore((state) => state.removeEvent);
  const addExpense = useFleetStore((state) => state.addExpense);
  const updateExpense = useFleetStore((state) => state.updateExpense);
  const removeExpense = useFleetStore((state) => state.removeExpense);

  const [activeTab, setActiveTab] = useState<TabType>('events');

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [deleteEventTarget, setDeleteEventTarget] = useState<EventRecord | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null);

  const handleAddEventClick = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEventClick = (event: EventRecord) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEventClick = (event: EventRecord) => {
    setDeleteEventTarget(event);
  };

  const handleEventFormSubmit = (data: Omit<EventRecord, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventFormCancel = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleConfirmDeleteEvent = () => {
    if (deleteEventTarget) {
      removeEvent(deleteEventTarget.id);
      setDeleteEventTarget(null);
    }
  };

  const handleCancelDeleteEvent = () => {
    setDeleteEventTarget(null);
  };

  const handleAddExpenseClick = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpenseClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpenseClick = (expense: Expense) => {
    setDeleteExpenseTarget(expense);
  };

  const handleExpenseFormSubmit = (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleExpenseFormCancel = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleConfirmDeleteExpense = () => {
    if (deleteExpenseTarget) {
      removeExpense(deleteExpenseTarget.id);
      setDeleteExpenseTarget(null);
    }
  };

  const handleCancelDeleteExpense = () => {
    setDeleteExpenseTarget(null);
  };

  const tabs = [
    { key: 'events' as TabType, label: '事件记录', icon: AlertCircle, count: events.length },
    { key: 'expenses' as TabType, label: '费用记录', icon: DollarSign, count: expenses.length },
  ];

  return (
    <PageLayout
      title="路上记录"
      subtitle="记录旅途中的事件和费用"
      actions={
        activeTab === 'events' ? (
          <button
            onClick={handleAddEventClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors shadow"
          >
            <Plus className="w-5 h-5" />
            添加事件
          </button>
        ) : (
          <button
            onClick={handleAddExpenseClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors shadow"
          >
            <Plus className="w-5 h-5" />
            添加费用
          </button>
        )
      }
    >
      <div className="mb-6">
        <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border border-cream-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
                  isActive
                    ? 'bg-forest-600 text-white shadow'
                    : 'text-gray-600 hover:text-forest-700 hover:bg-cream-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  isActive ? 'bg-white/20 text-white' : 'bg-cream-100 text-gray-500'
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'events' ? (
          <EventTimeline
            events={events}
            vehicles={vehicles}
            onEdit={handleEditEventClick}
            onDelete={handleDeleteEventClick}
          />
        ) : (
          <ExpenseList
            expenses={expenses}
            vehicles={vehicles}
            people={people}
            onEdit={handleEditExpenseClick}
            onDelete={handleDeleteExpenseClick}
          />
        )}
      </motion.div>

      <Modal
        isOpen={isEventModalOpen}
        onClose={handleEventFormCancel}
        title={editingEvent ? '编辑事件' : '添加事件'}
        size="lg"
      >
        <EventForm
          event={editingEvent || undefined}
          onSubmit={handleEventFormSubmit}
          onCancel={handleEventFormCancel}
        />
      </Modal>

      <Modal
        isOpen={!!deleteEventTarget}
        onClose={handleCancelDeleteEvent}
        title="确认删除"
        size="sm"
        footer={
          <>
            <button
              onClick={handleCancelDeleteEvent}
              className="px-5 py-2.5 rounded-xl border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmDeleteEvent}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              确认删除
            </button>
          </>
        }
      >
        <Alert
          type="error"
          title="删除确认"
          message="确定要删除这条事件记录吗？此操作不可撤销。"
        />
      </Modal>

      <Modal
        isOpen={isExpenseModalOpen}
        onClose={handleExpenseFormCancel}
        title={editingExpense ? '编辑费用' : '添加费用'}
        size="lg"
      >
        <ExpenseForm
          expense={editingExpense || undefined}
          onSubmit={handleExpenseFormSubmit}
          onCancel={handleExpenseFormCancel}
        />
      </Modal>

      <Modal
        isOpen={!!deleteExpenseTarget}
        onClose={handleCancelDeleteExpense}
        title="确认删除"
        size="sm"
        footer={
          <>
            <button
              onClick={handleCancelDeleteExpense}
              className="px-5 py-2.5 rounded-xl border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmDeleteExpense}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              确认删除
            </button>
          </>
        }
      >
        <Alert
          type="error"
          title="删除确认"
          message="确定要删除这条费用记录吗？此操作不可撤销。"
        />
      </Modal>
    </PageLayout>
  );
}
