import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card, EmptyState } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Modal, ModalActions } from '../components/Modal';
import { FormField, Input } from '../components/FormField';
import { useApp } from '../context/AppContext';
import { Page, CreditItem } from '../types';
import { formatMoney, formatDateTime, formatDate, isOverdue, getOverdueDays } from '../utils/helpers';

interface FlowEntry {
  id: string;
  createdAt: string;
  type: 'credit' | 'payment';
  amount: number;
  balance: number;
  handler?: string;
  remark?: string;
  items?: CreditItem[];
  creditRecordId?: string;
  remaining?: number;
  isPaid?: boolean;
  overdue?: boolean;
  overdueDays?: number;
  relatedItemsText?: string;
  paidAt?: string;
  dueDays?: number;
}

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
  const [flowFilter, setFlowFilter] = useState<'all' | 'credit' | 'payment' | 'unpaid'>('all');

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

  const flow: FlowEntry[] = useMemo(() => {
    const list: FlowEntry[] = [];

    records.forEach(r => {
      list.push({
        id: `credit-${r.id}`,
        createdAt: r.createdAt,
        type: 'credit',
        amount: r.totalAmount,
        balance: 0,
        handler: r.handler,
        remark: r.remark,
        items: r.items,
        creditRecordId: r.id,
        remaining: r.totalAmount - r.paidAmount,
        isPaid: r.isPaid,
        overdue: !r.isPaid && isOverdue(r.createdAt, r.dueDays),
        overdueDays: !r.isPaid ? getOverdueDays(r.createdAt, r.dueDays) : 0,
        paidAt: r.paidAt,
        dueDays: r.dueDays
      });
    });

    payments.forEach(p => {
      const r = records.find(x => x.id === p.creditRecordId);
      list.push({
        id: `payment-${p.id}`,
        createdAt: p.createdAt,
        type: 'payment',
        amount: p.amount,
        balance: 0,
        handler: p.handler,
        remark: p.remark,
        relatedItemsText: r ? r.items.map(i => i.productName).join('、') : undefined
      });
    });

    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let running = 0;
    list.forEach(entry => {
      if (entry.type === 'credit') running += entry.amount;
      else running -= entry.amount;
      if (running < 0) running = 0;
      entry.balance = running;
    });

    list.reverse();
    return list;
  }, [records, payments]);

  const lastPaymentEntry = flow.find(e => e.type === 'payment');

  const { filteredFlow, summary } = useMemo(() => {
    let list: FlowEntry[] = [];
    switch (flowFilter) {
      case 'all':
        list = flow;
        break;
      case 'credit':
        list = flow.filter(e => e.type === 'credit');
        break;
      case 'payment':
        list = flow.filter(e => e.type === 'payment');
        break;
      case 'unpaid':
        list = flow.filter(e => e.type === 'credit' && !e.isPaid);
        break;
    }

    let sumLabel = '';
    switch (flowFilter) {
      case 'all': {
        const creditCount = flow.filter(e => e.type === 'credit').length;
        const payCount = flow.filter(e => e.type === 'payment').length;
        sumLabel = `共 ${list.length} 笔（赊账${creditCount} · 还款${payCount}）· 当前欠款 ${formatMoney(list.length ? list[0].balance : 0)}`;
        break;
      }
      case 'credit': {
        const total = list.reduce((s, e) => s + e.amount, 0);
        sumLabel = `共 ${list.length} 笔赊账 · 累计 ${formatMoney(total)}`;
        break;
      }
      case 'payment': {
        const total = list.reduce((s, e) => s + e.amount, 0);
        sumLabel = `共 ${list.length} 笔还款 · 累计还款 ${formatMoney(total)}`;
        break;
      }
      case 'unpaid': {
        const remainSum = list.reduce((s, e) => s + (e.remaining ?? 0), 0);
        const overdueCount = list.filter(e => e.overdue).length;
        sumLabel = `共 ${list.length} 笔未结清${overdueCount ? `（逾期${overdueCount}笔）` : ''} · 还欠 ${formatMoney(remainSum)}`;
        break;
      }
    }

    return { filteredFlow: list, summary: sumLabel };
  }, [flow, flowFilter]);

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
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, opacity: 0.9, flexWrap: 'wrap' }}>
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
            {lastPaymentEntry ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                  <span style={{ color: '#86efac' }}>-{formatMoney(lastPaymentEntry.amount)}</span>
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{formatDateTime(lastPaymentEntry.createdAt)}{lastPaymentEntry.relatedItemsText && ` · ${lastPaymentEntry.relatedItemsText}`}</div>
              </>
            ) : (
              <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>暂无</div>
            )}
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

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, gap: 10
      }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#0f172a',
          flexShrink: 0, whiteSpace: 'nowrap'
        }}>
          💰 欠款变化流水
        </div>
        <div style={{
          display: 'flex', gap: 4, padding: 3,
          backgroundColor: '#f1f5f9', borderRadius: 9,
          overflowX: 'auto', overflowY: 'hidden',
          flexShrink: 1, minWidth: 0,
          scrollbarWidth: 'none'
        }}>
          {([
            { k: 'all', label: '全部' },
            { k: 'credit', label: '赊账' },
            { k: 'payment', label: '还款' },
            { k: 'unpaid', label: '未结清' }
          ] as const).map(tab => {
            const active = flowFilter === tab.k;
            return (
              <button
                key={tab.k}
                onClick={() => setFlowFilter(tab.k)}
                title={tab.k === 'all' ? '赊账记+，还款记-' : undefined}
                style={{
                  border: 'none', cursor: 'pointer', fontSize: 12, padding: '6px 12px',
                  borderRadius: 7, fontWeight: active ? 600 : 400,
                  backgroundColor: active ? 'white' : 'transparent',
                  color: active ? '#4f46e5' : '#64748b',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <Card padding={14} style={{
        marginBottom: 12,
        backgroundColor: flowFilter === 'unpaid' ? '#fef2f2' : flowFilter === 'payment' ? '#f0fdf4' : flowFilter === 'credit' ? '#fff7ed' : '#eef2ff',
        border: '1px solid transparent'
      }}>
        <div style={{ fontSize: 13, color: flowFilter === 'unpaid' ? '#991b1b' : flowFilter === 'payment' ? '#047857' : flowFilter === 'credit' ? '#92400e' : '#4338ca', fontWeight: 600 }}>
          {summary}
        </div>
      </Card>

      <Card padding={0} style={{ overflow: 'hidden', marginBottom: 16 }}>
        {filteredFlow.length === 0 ? (
          <EmptyState text={
            flowFilter === 'unpaid' ? '👍 太棒了，没有未结清的账单'
              : flowFilter === 'credit' ? '暂无赊账记录'
              : flowFilter === 'payment' ? '暂无还款记录'
              : '还没有任何赊账或还款记录'
          } />
        ) : (
          <div>
            {filteredFlow.map((entry, idx) => {
              const isLast = idx === filteredFlow.length - 1;
              const timelineDot = entry.type === 'credit'
                ? { bg: '#ef4444', icon: '➕' }
                : { bg: '#10b981', icon: '➖' };
              const amountColor = entry.type === 'credit' ? '#dc2626' : '#059669';
              const amountPrefix = entry.type === 'credit' ? '+' : '-';
              return (
                <div key={entry.id} style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    paddingTop: 14
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      backgroundColor: timelineDot.bg, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, zIndex: 1
                    }}>
                      {timelineDot.icon}
                    </div>
                    {!isLast && <div style={{
                      flex: 1, width: 2, backgroundColor: '#e2e8f0',
                      margin: '4px 0'
                    }} />}
                  </div>

                  <div style={{ flex: 1, padding: '12px 16px 12px 0', minWidth: 0, borderBottom: !isLast ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11,
                            backgroundColor: entry.type === 'credit' ? '#fef2f2' : '#f0fdf4',
                            color: entry.type === 'credit' ? '#b91c1c' : '#047857',
                            padding: '2px 8px', borderRadius: 8, fontWeight: 600
                          }}>
                            {entry.type === 'credit' ? '赊账' : '还款'}
                          </span>
                          {entry.type === 'credit' && entry.overdue && !entry.isPaid && (
                            <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: 8, fontSize: 10, fontWeight: 500 }}>
                              逾期{entry.overdueDays}天
                            </span>
                          )}
                          {entry.type === 'credit' && entry.isPaid && (
                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 8, fontSize: 10, fontWeight: 500 }}>
                              已结清
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                          {formatDateTime(entry.createdAt)}{entry.handler ? ` · ${entry.handler}` : ''}
                        </div>

                        {entry.type === 'credit' && entry.items && (
                          <div style={{ fontSize: 12, color: '#334155', marginTop: 6 }}>
                            {entry.items.map((it, i) => (
                              <span key={i} style={{ marginRight: 10 }}>
                                {it.productName}×{it.quantity}
                                <span style={{ color: '#94a3b8', marginLeft: 2 }}>({formatMoney(it.unitPrice)}/件)</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.type === 'payment' && entry.relatedItemsText && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                            对应账单：{entry.relatedItemsText}
                          </div>
                        )}
                        {entry.remark && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                            备注：{entry.remark}
                          </div>
                        )}
                        {entry.type === 'credit' && entry.dueDays && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                            约定 {entry.dueDays} 天内还清{entry.isPaid && entry.paidAt ? ` · 实际结清于 ${formatDate(entry.paidAt)}` : ''}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: amountColor }}>
                          {amountPrefix}{formatMoney(entry.amount)}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                          余额 <span style={{ color: '#475569', fontWeight: 600 }}>{formatMoney(entry.balance)}</span>
                        </div>
                        {entry.type === 'credit' && !entry.isPaid && (entry.remaining ?? 0) > 0 && (
                          <div style={{ marginTop: 6 }}>
                            <Button size="sm" variant="success" onClick={() => entry.creditRecordId && openPay(entry.creditRecordId)}>
                              还这笔
                            </Button>
                          </div>
                        )}
                        {entry.type === 'credit' && !entry.isPaid && (entry.remaining ?? 0) < entry.amount && (entry.remaining ?? 0) > 0 && (
                          <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>
                            本笔还欠 {formatMoney(entry.remaining ?? 0)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={payModalOpen} title="还款" onClose={() => setPayModalOpen(false)} width={400}>
        {payRecordId && (() => {
          const r = records.find(x => x.id === payRecordId);
          if (!r) return null;
          return (
            <>
              <Card padding={12} style={{ backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>待还金额（本笔）</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                  {formatMoney(r.totalAmount - r.paidAmount)}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  本笔共 {formatMoney(r.totalAmount)}，累计已还 {formatMoney(r.paidAmount)}
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
