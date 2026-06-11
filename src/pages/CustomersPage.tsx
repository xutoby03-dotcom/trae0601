import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, EmptyState } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Modal, ModalActions } from '../components/Modal';
import { FormField, Input } from '../components/FormField';
import { useApp } from '../context/AppContext';
import { Page, Customer } from '../types';
import { formatMoney } from '../utils/helpers';

interface CustomersPageProps {
  page: Page;
  onPageChange: (page: Page) => void;
  onViewDetail: (customerId: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ page, onPageChange, onViewDetail }) => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, getCustomerDebt, getCustomerOverdueCount } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', frequentItems: '', creditLimit: 200, avatar: ''
  });

  const resetForm = () => setForm({ name: '', phone: '', frequentItems: '', creditLimit: 200, avatar: '' });

  const openAdd = () => { setEditing(null); resetForm(); setModalOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, frequentItems: c.frequentItems.join('、'), creditLimit: c.creditLimit, avatar: c.avatar });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      frequentItems: form.frequentItems.split(/[,，、\s]+/).filter(Boolean),
      creditLimit: Number(form.creditLimit) || 0,
      avatar: form.avatar.trim()
    };
    if (editing) updateCustomer(editing.id, data);
    else addCustomer(data);
    setModalOpen(false);
  };

  const filtered = customers.filter(c =>
    c.name.includes(search) || c.phone.includes(search)
  ).sort((a, b) => getCustomerDebt(b.id) - getCustomerDebt(a.id));

  return (
    <Layout
      page={page}
      onPageChange={onPageChange}
      title="顾客档案"
      rightAction={<Button size="sm" onClick={openAdd}>+ 新顾客</Button>}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索姓名或电话..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="还没有顾客，点右上角添加" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => {
            const debt = getCustomerDebt(c.id);
            const overdue = getCustomerOverdueCount(c.id);
            return (
              <Card key={c.id} hoverable onClick={() => onViewDetail(c.id)} padding={16}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar name={c.name} avatar={c.avatar} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>{c.name}</span>
                        {overdue > 0 && (
                          <span style={{
                            backgroundColor: '#fef2f2', color: '#dc2626',
                            padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500
                          }}>逾期{overdue}笔</span>
                        )}
                      </div>
                      <span style={{
                        fontWeight: 700, fontSize: 16,
                        color: debt > 0 ? '#dc2626' : '#10b981'
                      }}>{formatMoney(debt)}</span>
                    </div>
                    {c.phone && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>📞 {c.phone}</div>}
                    {c.frequentItems.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.frequentItems.slice(0, 4).map(item => (
                          <span key={item} style={{
                            backgroundColor: '#f1f5f9', color: '#475569',
                            padding: '3px 8px', borderRadius: 6, fontSize: 11
                          }}>{item}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
                      <span>额度 {formatMoney(c.creditLimit)}</span>
                      <span onClick={e => { e.stopPropagation(); openEdit(c); }} style={{ color: '#4f46e5', cursor: 'pointer' }}>编辑</span>
                      <span onClick={e => {
                        e.stopPropagation();
                        if (confirm(`确认删除 ${c.name}？所有赊账记录也将删除`)) deleteCustomer(c.id);
                      }} style={{ color: '#ef4444', cursor: 'pointer' }}>删除</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? '编辑顾客' : '新增顾客'} onClose={() => setModalOpen(false)}>
        <FormField label="姓名" required>
          <Input placeholder="请输入姓名" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="电话">
          <Input placeholder="选填" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </FormField>
        <FormField label="常买东西" hint="用逗号或顿号分隔">
          <Input placeholder="如：矿泉水、烟" value={form.frequentItems} onChange={e => setForm({ ...form, frequentItems: e.target.value })} />
        </FormField>
        <FormField label="信用额度（元）">
          <Input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: Number(e.target.value) })} />
        </FormField>
        <FormField label="头像URL" hint="选填，留空则用名字首字">
          <Input placeholder="https://..." value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
        </FormField>
        <ModalActions>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
          <Button onClick={handleSubmit}>{editing ? '保存' : '添加'}</Button>
        </ModalActions>
      </Modal>
    </Layout>
  );
};
