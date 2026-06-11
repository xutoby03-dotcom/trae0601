import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { Page } from '../types';
import { formatMoney, isOverdue, getOverdueDays, formatDate } from '../utils/helpers';

interface SummaryPageProps {
  page: Page;
  onPageChange: (page: Page) => void;
  onViewDetail: (customerId: string) => void;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({ page, onPageChange, onViewDetail }) => {
  const { customers, creditRecords, paymentRecords, getCustomerDebt } = useApp();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === thisMonth;
  };

  const totalUnpaid = creditRecords.filter(r => !r.isPaid).reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const totalOverdue = creditRecords.filter(r => !r.isPaid && isOverdue(r.createdAt, r.dueDays))
    .reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const monthNewCredit = creditRecords.filter(r => isThisMonth(r.createdAt)).reduce((s, r) => s + r.totalAmount, 0);
  const monthReceived = paymentRecords.filter(p => isThisMonth(p.createdAt)).reduce((s, p) => s + p.amount, 0);

  const customerDebts = customers.map(c => ({ customer: c, debt: getCustomerDebt(c.id), overdueCount: creditRecords.filter(r => r.customerId === c.id && !r.isPaid && isOverdue(r.createdAt, r.dueDays)).length }));
  const mostOverdue = [...customerDebts].filter(x => x.overdueCount > 0).sort((a, b) => b.overdueCount - a.overdueCount || b.debt - a.debt).slice(0, 5);
  const mostDebt = [...customerDebts].filter(x => x.debt > 0).sort((a, b) => b.debt - a.debt).slice(0, 5);

  const productCount = new Map<string, { count: number; amount: number }>();
  creditRecords.filter(r => isThisMonth(r.createdAt) || !r.isPaid).forEach(r => {
    r.items.forEach(it => {
      const cur = productCount.get(it.productName) || { count: 0, amount: 0 };
      productCount.set(it.productName, { count: cur.count + it.quantity, amount: cur.amount + it.quantity * it.unitPrice });
    });
  });
  const topProducts = Array.from(productCount.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  return (
    <Layout page={page} onPageChange={onPageChange} title="月底汇总">
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        统计月份：{thisMonth} · {formatDate(now.toISOString())}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Card padding={16} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>未收总额</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{formatMoney(totalUnpaid)}</div>
        </Card>
        <Card padding={16} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>逾期金额</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{formatMoney(totalOverdue)}</div>
        </Card>
        <Card padding={16} style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>本月新增赊账</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{formatMoney(monthNewCredit)}</div>
        </Card>
        <Card padding={16} style={{ background: 'linear-gradient(135deg, #10b981, #84cc16)', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>本月已收款</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{formatMoney(monthReceived)}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
          ⚠️ 逾期最多的顾客
        </div>
        {mostOverdue.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>太棒了，暂无逾期！</div>
        ) : (
          <div>
            {mostOverdue.map(({ customer, debt, overdueCount }, idx) => (
              <div key={customer.id} onClick={() => onViewDetail(customer.id)} style={{
                padding: 12, borderBottom: idx < mostOverdue.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer'
              }}>
                <Avatar name={customer.name} avatar={customer.avatar} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{customer.name}</span>
                    <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: 8, fontSize: 10, fontWeight: 500 }}>
                      逾期{overdueCount}笔
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{customer.phone || '暂无电话'}</div>
                </div>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatMoney(debt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
          💰 欠款金额排行
        </div>
        {mostDebt.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>暂无欠款</div>
        ) : (
          <div>
            {mostDebt.map(({ customer, debt }, idx) => (
              <div key={customer.id} onClick={() => onViewDetail(customer.id)} style={{
                padding: 12, borderBottom: idx < mostDebt.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer'
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: idx < 3 ? '#fef3c7' : '#f1f5f9',
                  color: idx < 3 ? '#92400e' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700
                }}>{idx + 1}</span>
                <Avatar name={customer.name} avatar={customer.avatar} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>额度 {formatMoney(customer.creditLimit)}</div>
                </div>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatMoney(debt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>
          🛒 最常赊的商品
        </div>
        {topProducts.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>暂无数据</div>
        ) : (
          <div>
            {topProducts.map(([name, data], idx) => {
              const maxCount = topProducts[0][1].count;
              const percent = Math.round((data.count / maxCount) * 100);
              return (
                <div key={name} style={{
                  padding: 10, borderBottom: idx < topProducts.length - 1 ? '1px solid #f1f5f9' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        backgroundColor: '#eef2ff', color: '#4338ca',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700
                      }}>{idx + 1}</span>
                      <span style={{ fontWeight: 500, color: '#0f172a' }}>{name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {data.count}件 · <span style={{ color: '#4f46e5', fontWeight: 600 }}>{formatMoney(data.amount)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      borderRadius: 3
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout>
  );
};
