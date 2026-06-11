import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, EmptyState } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Modal, ModalActions } from '../components/Modal';
import { FormField, Input, TextArea, Select } from '../components/FormField';
import { useApp } from '../context/AppContext';
import { Page, CreditItem } from '../types';
import { formatMoney, formatDateTime, isOverdue, getOverdueDays } from '../utils/helpers';

interface RecordsPageProps {
  page: Page;
  onPageChange: (page: Page) => void;
}

export const RecordsPage: React.FC<RecordsPageProps> = ({ page, onPageChange }) => {
  const { creditRecords, customers, addCreditRecord, addPayment, getCustomerById } = useApp();
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payRecordId, setPayRecordId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerId: '', items: [{ productName: '', quantity: 1, unitPrice: 0 }] as CreditItem[],
    handler: '老板', remark: '', dueDays: 7
  });
  const [payForm, setPayForm] = useState({ amount: 0, handler: '老板', remark: '' });

  const updateItem = (idx: number, key: keyof CreditItem, value: string | number) => {
    const newItems = [...form.items];
    (newItems[idx] as any)[key] = value;
    setForm({ ...form, items: newItems });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, { productName: '', quantity: 1, unitPrice: 0 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const totalAmount = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const openCredit = () => {
    setForm({ customerId: customers[0]?.id || '', items: [{ productName: '', quantity: 1, unitPrice: 0 }], handler: '老板', remark: '', dueDays: 7 });
    setCreditModalOpen(true);
  };

  const submitCredit = () => {
    if (!form.customerId) return alert('请选择顾客');
    const validItems = form.items.filter(i => i.productName.trim() && i.quantity > 0 && i.unitPrice > 0);
    if (validItems.length === 0) return alert('请至少填写一项商品');
    const total = validItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    addCreditRecord({
      customerId: form.customerId,
      items: validItems,
      totalAmount: total,
      handler: form.handler.trim() || '老板',
      remark: form.remark.trim(),
      dueDays: Number(form.dueDays) || 7
    });
    setCreditModalOpen(false);
  };

  const openPay = (recordId: string) => {
    const r = creditRecords.find(x => x.id === recordId);
    if (!r) return;
    setPayRecordId(recordId);
    setPayForm({ amount: r.totalAmount - r.paidAmount, handler: '老板', remark: '' });
    setPayModalOpen(true);
  };

  const submitPay = () => {
    if (!payRecordId) return;
    const r = creditRecords.find(x => x.id === payRecordId);
    if (!r) return;
    const remaining = r.totalAmount - r.paidAmount;
    const amt = Number(payForm.amount);
    if (amt <= 0 || amt > remaining) return alert(`还款金额需在 0 ~ ${remaining.toFixed(2)} 之间`);
    addPayment(payRecordId, amt, payForm.handler.trim() || '老板', payForm.remark.trim());
    setPayModalOpen(false);
  };

  const sorted = [...creditRecords].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unpaidRecords = sorted.filter(r => !r.isPaid);
  const paidRecords = sorted.filter(r => r.isPaid);

  const RecordCard = ({ r }: { r: typeof creditRecords[0] }) => {
    const cust = getCustomerById(r.customerId);
    const overdue = isOverdue(r.createdAt, r.dueDays);
    const overdueDays = getOverdueDays(r.createdAt, r.dueDays);
    const remaining = r.totalAmount - r.paidAmount;
    return (
      <Card key={r.id} padding={16} style={overdue && !r.isPaid ? { borderLeft: '4px solid #ef4444' } : {}}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {cust && <Avatar name={cust.name} avatar={cust.avatar} size={40} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>{cust?.name || '未知顾客'}</span>
              {r.isPaid ? (
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>已结清</span>
              ) : overdue ? (
                <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>逾期{overdueDays}天</span>
              ) : (
                <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>{r.dueDays}天内</span>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#334155' }}>
              {r.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>{it.productName} × {it.quantity}</span>
                  <span>{formatMoney(it.quantity * it.unitPrice)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>共 {formatMoney(r.totalAmount)}{r.paidAmount > 0 && ` · 已还${formatMoney(r.paidAmount)}`}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>经手人：{r.handler} · {formatDateTime(r.createdAt)}</div>
                {r.remark && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>备注：{r.remark}</div>}
              </div>
              {!r.isPaid && (
                <Button size="sm" variant="success" onClick={() => openPay(r.id)}>还款</Button>
              )}
            </div>
            {!r.isPaid && remaining > 0 && (
              <div style={{ marginTop: 6, fontSize: 13, color: '#dc2626', fontWeight: 600, textAlign: 'right' }}>
                还欠 {formatMoney(remaining)}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout
      page={page}
      onPageChange={onPageChange}
      title="赊账记录"
      rightAction={<Button size="sm" onClick={openCredit}>+ 记赊账</Button>}
    >
      {sorted.length === 0 ? (
        <EmptyState text="还没有赊账记录" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {unpaidRecords.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
                未结清 <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 500 }}>({unpaidRecords.length}笔)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {unpaidRecords.map(r => <RecordCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
          {paidRecords.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>
                已结清 ({paidRecords.length}笔)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.85 }}>
                {paidRecords.map(r => <RecordCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={creditModalOpen} title="记一笔赊账" onClose={() => setCreditModalOpen(false)} width={520}>
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
          <TextArea placeholder="选填" value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
        </FormField>
        <ModalActions>
          <Button variant="secondary" onClick={() => setCreditModalOpen(false)}>取消</Button>
          <Button onClick={submitCredit}>保存</Button>
        </ModalActions>
      </Modal>

      <Modal open={payModalOpen} title="还款" onClose={() => setPayModalOpen(false)} width={400}>
        {payRecordId && (() => {
          const r = creditRecords.find(x => x.id === payRecordId);
          if (!r) return null;
          return (
            <>
              <Card padding={12} style={{ backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>待还金额</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                  {formatMoney(r.totalAmount - r.paidAmount)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  总额 {formatMoney(r.totalAmount)} · 已还 {formatMoney(r.paidAmount)}
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
          <Button variant="secondary" onClick={() => setPayModalOpen(false)}>取消</Button>
          <Button variant="success" onClick={submitPay}>确认还款</Button>
        </ModalActions>
      </Modal>
    </Layout>
  );
};
