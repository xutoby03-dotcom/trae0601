import React from 'react';
import { Layout } from '../components/Layout';
import { Card, EmptyState } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Modal, ModalActions } from '../components/Modal';
import { FormField, Input, Select } from '../components/FormField';
import { useApp } from '../context/AppContext';
import { Page, CreditItem } from '../types';
import { formatMoney, formatDateTime, isOverdue, getOverdueDays, isToday } from '../utils/helpers';
import { useState } from 'react';

interface DashboardPageProps {
  page: Page;
  onPageChange: (page: Page) => void;
  onViewDetail: (customerId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ page, onPageChange, onViewDetail }) => {
  const { creditRecords, customers, addCreditRecord, addPayment, getCustomerById, getCustomerDebt } = useApp();
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const [payRecordId, setPayRecordId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: 0, handler: '老板', remark: '' });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: '', items: [{ productName: '', quantity: 1, unitPrice: 0 }] as CreditItem[],
    handler: '老板', remark: '', dueDays: 7
  });

  const updateItem = (idx: number, key: keyof CreditItem, value: string | number) => {
    const newItems = [...form.items];
    (newItems[idx] as any)[key] = value;
    setForm({ ...form, items: newItems });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, { productName: '', quantity: 1, unitPrice: 0 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const totalAmount = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const submitCredit = () => {
    if (!form.customerId) return alert('请选择顾客');
    const validItems = form.items.filter(i => i.productName.trim() && i.quantity > 0 && i.unitPrice > 0);
    if (validItems.length === 0) return alert('请至少填写一项商品');
    const total = validItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    addCreditRecord({ customerId: form.customerId, items: validItems, totalAmount: total, handler: form.handler.trim() || '老板', remark: form.remark.trim(), dueDays: Number(form.dueDays) || 7 });
    setAddModalOpen(false);
  };

  const openQuickPay = (recordId: string) => {
    const r = creditRecords.find(x => x.id === recordId);
    if (!r) return;
    setPayRecordId(recordId);
    setPayForm({ amount: r.totalAmount - r.paidAmount, handler: '老板', remark: '' });
    setQuickPayOpen(true);
  };

  const submitPay = () => {
    if (!payRecordId) return;
    const r = creditRecords.find(x => x.id === payRecordId);
    if (!r) return;
    const remaining = r.totalAmount - r.paidAmount;
    const amt = Number(payForm.amount);
    if (amt <= 0 || amt > remaining) return alert(`还款金额需在 0 ~ ${remaining.toFixed(2)} 之间`);
    addPayment(payRecordId, amt, payForm.handler.trim() || '老板', payForm.remark.trim());
    setQuickPayOpen(false);
  };

  const totalDebt = creditRecords.filter(r => !r.isPaid).reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const overdueRecords = creditRecords.filter(r => !r.isPaid && isOverdue(r.createdAt, r.dueDays));
  const overdueDebt = overdueRecords.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const todayRecords = creditRecords.filter(r => isToday(r.createdAt));

  const openAdd = () => {
    setForm({ customerId: customers[0]?.id || '', items: [{ productName: '', quantity: 1, unitPrice: 0 }], handler: '老板', remark: '', dueDays: 7 });
    setAddModalOpen(true);
  };

  const RecordItem = ({ r, showPay = false }: { r: typeof creditRecords[0]; showPay?: boolean }) => {
    const cust = getCustomerById(r.customerId);
    const overdue = isOverdue(r.createdAt, r.dueDays);
    const overdueDays = getOverdueDays(r.createdAt, r.dueDays);
    const remaining = r.totalAmount - r.paidAmount;
    return (
      <div onClick={() => cust && onViewDetail(cust.id)} style={{
        padding: 12, borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
        display: 'flex', gap: 10, alignItems: 'flex-start'
      }}>
        {cust && <Avatar name={cust.name} avatar={cust.avatar} size={36} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{cust?.name || '未知'}</span>
            <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>{formatMoney(remaining)}</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {r.items.map(i => i.productName).join('、')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDateTime(r.createdAt)}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {overdue && (
                <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: 8, fontSize: 10, fontWeight: 500 }}>逾期{overdueDays}天</span>
              )}
              {showPay && (
                <Button size="sm" variant="success" onClick={e => { e.stopPropagation(); openQuickPay(r.id); }}>催还</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout
      page={page}
      onPageChange={onPageChange}
      title="街边小店赊账本"
      rightAction={<Button size="sm" onClick={openAdd}>+ 快记账</Button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Card padding={16} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>未收总金额</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{formatMoney(totalDebt)}</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>共 {creditRecords.filter(r => !r.isPaid).length} 笔未结清</div>
        </Card>
        <Card padding={16} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>逾期金额</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{formatMoney(overdueDebt)}</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>共 {overdueRecords.length} 笔逾期</div>
        </Card>
      </div>

      {overdueRecords.length > 0 && (
        <Card padding={0} style={{ marginBottom: 16, border: '1px solid #fecaca', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px', backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#991b1b' }}>⚠️ 逾期提醒区</span>
            <span style={{ fontSize: 12, color: '#dc2626' }}>{overdueRecords.length}笔 · {formatMoney(overdueDebt)}</span>
          </div>
          <div>
            {overdueRecords.sort((a, b) => getOverdueDays(b.createdAt, b.dueDays) - getOverdueDays(a.createdAt, a.dueDays)).map(r => (
              <RecordItem key={r.id} r={r} showPay />
            ))}
          </div>
        </Card>
      )}

      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '12px 16px', backgroundColor: '#ecfdf5',
          borderBottom: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#065f46' }}>🆕 今日新账</span>
          <span style={{ fontSize: 12, color: '#059669' }}>{todayRecords.length}笔</span>
        </div>
        {todayRecords.length === 0 ? (
          <EmptyState text="今天还没有赊账记录" />
        ) : (
          <div>
            {todayRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(r => (
              <RecordItem key={r.id} r={r} />
            ))}
          </div>
        )}
      </Card>

      {customers.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>熟客欠款排行</div>
          <Card padding={0} style={{ overflow: 'hidden' }}>
            {[...customers].sort((a, b) => getCustomerDebt(b.id) - getCustomerDebt(a.id)).slice(0, 5).map((c, idx) => {
              const debt = getCustomerDebt(c.id);
              if (debt <= 0) return null;
              return (
                <div key={c.id} onClick={() => onViewDetail(c.id)} style={{
                  padding: 12, borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  display: 'flex', gap: 10, alignItems: 'center'
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    backgroundColor: idx < 3 ? '#fef3c7' : '#f1f5f9',
                    color: idx < 3 ? '#92400e' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700
                  }}>{idx + 1}</span>
                  <Avatar name={c.name} avatar={c.avatar} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.phone || '暂无电话'}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatMoney(debt)}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      <Modal open={addModalOpen} title="记一笔赊账" onClose={() => setAddModalOpen(false)} width={520}>
        <FormField label="顾客" required>
          <Select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
            <option value="">请选择</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </FormField>
        <FormField label="商品明细" required>
          {form.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <Input placeholder="商品名" value={item.productName} onChange={e => updateItem(idx, 'productName', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <Input type="number" placeholder="数量" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
              </div>
              <div style={{ flex: 1 }}>
                <Input type="number" placeholder="单价" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
              </div>
              <Button size="sm" variant="secondary" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>×</Button>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={addItem}>+ 添加商品</Button>
        </FormField>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px dashed #e2e8f0', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#475569' }}>合计</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}>{formatMoney(totalAmount)}</span>
        </div>
        <FormField label="约定还款天数">
          <Select value={form.dueDays} onChange={e => setForm({ ...form, dueDays: Number(e.target.value) })}>
            <option value={3}>3天</option>
            <option value={7}>7天</option>
            <option value={15}>15天</option>
            <option value={30}>30天</option>
          </Select>
        </FormField>
        <FormField label="经手人">
          <Input value={form.handler} onChange={e => setForm({ ...form, handler: e.target.value })} />
        </FormField>
        <FormField label="备注">
          <Input placeholder="选填" value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
        </FormField>
        <ModalActions>
          <Button variant="secondary" onClick={() => setAddModalOpen(false)}>取消</Button>
          <Button onClick={submitCredit}>保存</Button>
        </ModalActions>
      </Modal>

      <Modal open={quickPayOpen} title="催款/还款" onClose={() => setQuickPayOpen(false)} width={400}>
        {payRecordId && (() => {
          const r = creditRecords.find(x => x.id === payRecordId);
          const cust = r ? getCustomerById(r.customerId) : null;
          if (!r) return null;
          return (
            <>
              <Card padding={12} style={{ backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {cust && <Avatar name={cust.name} avatar={cust.avatar} size={40} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{cust?.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>电话：{cust?.phone || '暂无'}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>待还金额</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 2 }}>
                    {formatMoney(r.totalAmount - r.paidAmount)}
                  </div>
                </div>
              </Card>
              <FormField label="本次还款金额" required>
                <Input type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: Number(e.target.value) })} />
              </FormField>
              <FormField label="经手人">
                <Input value={payForm.handler} onChange={e => setPayForm({ ...payForm, handler: e.target.value })} />
              </FormField>
              <FormField label="备注">
                <Input placeholder="选填" value={payForm.remark} onChange={e => setPayForm({ ...payForm, remark: e.target.value })} />
              </FormField>
            </>
          );
        })()}
        <ModalActions>
          <Button variant="secondary" onClick={() => setQuickPayOpen(false)}>取消</Button>
          <Button variant="success" onClick={submitPay}>确认还款</Button>
        </ModalActions>
      </Modal>
    </Layout>
  );
};
