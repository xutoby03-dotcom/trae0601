import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, EmptyState } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Modal, ModalActions } from '../components/Modal';
import { FormField, Input } from '../components/FormField';
import { useApp } from '../context/AppContext';
import { Page } from '../types';
import { formatMoney, formatDateTime, formatDate, isOverdue, getOverdueDays } from '../utils/helpers';

interface CustomerDetailPageProps {
  customerId: string;
  page: Page;
  onPageChange: (page: Page) => void;
  onBack: () => void;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, page, onPageChange, onBack }) => {
  const {
    getCustomerById, getCustomerDebt, getCustomerOverdueCount,
    getCustomerPayments, getCustomerRecords, addPayment
  } = useApp();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payRecordId, setPayRecordId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: 0, handler: '老板', remark: '' });

  const customer = getCustomerById(customerId);
  if (!customer) return (
    <Layout page={page} onPageChange={onPageChange} title="顾客不存在" showBack onBack={onBack}>
      <EmptyState text="找不到该顾客" />
    </Layout>
  );

  const debt = getCustomerDebt(customerId);
  const overdueCount = getCustomerOverdueCount(customerId);
  const payments = getCustomerPayments(customerId);
  const records = getCustomerRecords(customerId);

  const openPay = (recordId: string) => {
    const r = records.find(x => x.id === recordId);
    if (!r) return;
    setPayRecordId(recordId);
    setPayForm({ amount: r.totalAmount - r.paidAmount, handler: '老板', remark: '' });
    setPayModalOpen(true);
  };

  const submitPay = () => {
    if (!payRecordId) return;
    const r = records.find(x => x.id === payRecordId);
    if (!r) return;
    const remaining = r.totalAmount - r.paidAmount;
    const amt = Number(payForm.amount);
    if (amt <= 0 || amt > remaining) return alert(`还款金额需在 0 ~ ${remaining.toFixed(2)} 之间`);
    addPayment(payRecordId, amt, payForm.handler.trim() || '老板', payForm.remark.trim());
    setPayModalOpen(false);
  };

  const lastPayment = payments[0];

  const unpaidRecords = records.filter(r => !r.isPaid);
  const paidRecords = records.filter(r => r.isPaid);

  return (
    <Layout
      page={page}
      onPageChange={onPageChange}
      title={customer.name}
      showBack
      onBack={onBack}
    >
      <Card padding={20} style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar name={customer.name} avatar={customer.avatar} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{customer.name}</div>
            {customer.phone && <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>📞 {customer.phone}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, opacity: 0.9 }}>
              <span>额度 {formatMoney(customer.creditLimit)}</span>
              {overdueCount > 0 && <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8 }}>逾期{overdueCount}笔</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>当前欠款</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{formatMoney(debt)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>最近还款</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              {lastPayment ? formatMoney(lastPayment.amount) : '暂无'}
            </div>
            {lastPayment && <div style={{ fontSize: 11, opacity: 0.8 }}>{formatDateTime(lastPayment.createdAt)}</div>}
          </div>
        </div>
      </Card>

      {customer.frequentItems.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>常买东西</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {customer.frequentItems.map(item => (
              <span key={item} style={{
                backgroundColor: '#eef2ff', color: '#4338ca',
                padding: '4px 10px', borderRadius: 6, fontSize: 12
              }}>{item}</span>
            ))}
          </div>
        </Card>
      )}

      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
        还款记录
      </div>
      <Card padding={0} style={{ marginBottom: 16, overflow: 'hidden' }}>
        {payments.length === 0 ? (
          <EmptyState text="暂无还款记录" />
        ) : (
          <div>
            {payments.map(p => {
              const r = records.find(x => x.id === p.creditRecordId);
              return (
                <div key={p.id} style={{ padding: 12, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>+ {formatMoney(p.amount)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {formatDateTime(p.createdAt)} · {p.handler}
                    </div>
                    {r && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>对应账单：{r.items.map(i => i.productName).join('、')}</div>}
                    {p.remark && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>备注：{p.remark}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
        赊账明细
      </div>

      {unpaidRecords.length > 0 && (
        <Card padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', backgroundColor: '#fef2f2', fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
            未结清 ({unpaidRecords.length}笔)
          </div>
          {unpaidRecords.map(r => {
            const overdue = isOverdue(r.createdAt, r.dueDays);
            const overdueDays = getOverdueDays(r.createdAt, r.dueDays);
            const remaining = r.totalAmount - r.paidAmount;
            return (
              <div key={r.id} style={overdue ? { padding: 12, borderBottom: '1px solid #f1f5f9', borderLeft: '3px solid #ef4444' } : { padding: 12, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#0f172a' }}>{formatDate(r.createdAt)}</span>
                    {overdue && (
                      <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: 8, fontSize: 10 }}>逾期{overdueDays}天</span>
                    )}
                  </div>
                  <Button size="sm" variant="success" onClick={() => openPay(r.id)}>还款</Button>
                </div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 6 }}>
                  {r.items.map((it, i) => (
                    <span key={i} style={{ marginRight: 8 }}>{it.productName}×{it.quantity}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                  <span style={{ color: '#64748b' }}>共{formatMoney(r.totalAmount)}{r.paidAmount > 0 && ` · 已还${formatMoney(r.paidAmount)}`}</span>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>还欠 {formatMoney(remaining)}</span>
                </div>
                {r.remark && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>备注：{r.remark}</div>}
              </div>
            );
          })}
        </Card>
      )}

      {paidRecords.length > 0 && (
        <Card padding={0} style={{ overflow: 'hidden', opacity: 0.85 }}>
          <div style={{ padding: '10px 16px', backgroundColor: '#f0fdf4', fontSize: 12, fontWeight: 600, color: '#166534' }}>
            已结清 ({paidRecords.length}笔)
          </div>
          {paidRecords.map(r => (
            <div key={r.id} style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#0f172a' }}>{formatDate(r.createdAt)}</span>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 500 }}>已结清</span>
              </div>
              <div style={{ fontSize: 12, color: '#334155', marginTop: 6 }}>
                {r.items.map((it, i) => (
                  <span key={i} style={{ marginRight: 8 }}>{it.productName}×{it.quantity}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                共 {formatMoney(r.totalAmount)} · 结清于 {r.paidAt && formatDate(r.paidAt)}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={payModalOpen} title="还款" onClose={() => setPayModalOpen(false)} width={400}>
        {payRecordId && (() => {
          const r = records.find(x => x.id === payRecordId);
          if (!r) return null;
          return (
            <>
              <Card padding={12} style={{ backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>待还金额</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                  {formatMoney(r.totalAmount - r.paidAmount)}
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
