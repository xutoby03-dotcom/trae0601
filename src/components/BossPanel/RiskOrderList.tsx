import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Check, Clock, Edit3, ChevronDown, ChevronUp, Copy, CheckCheck } from 'lucide-react';
import { ContactStatus, CONTACT_STATUS_LABELS } from '@/types';
import type { Order } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';
import { isOrderRisk, formatPickupTime, getComplexityStars } from '@/utils/orderUtils';

type Filter = 'all' | 'pending' | 'contacted';

export default function RiskOrderList() {
  const orders = useOrderStore((s) => s.orders);
  const chefs = useOrderStore((s) => s.chefs);
  const toggleContactStatus = useOrderStore((s) => s.toggleContactStatus);
  const updateContactNote = useOrderStore((s) => s.updateContactNote);

  const [filter, setFilter] = useState<Filter>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    if (copiedPhone) {
      const t = setTimeout(() => setCopiedPhone(null), 1500);
      return () => clearTimeout(t);
    }
  }, [copiedPhone]);

  const riskOrders = orders.filter((o) => isOrderRisk(o));

  const filteredOrders = [...riskOrders].sort((a, b) => {
    if (filter === 'pending') {
      return new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime();
    }
    if (filter === 'contacted') {
      const timeA = a.contactTime ? new Date(a.contactTime).getTime() : 0;
      const timeB = b.contactTime ? new Date(b.contactTime).getTime() : 0;
      return timeB - timeA;
    }
    if (a.contactStatus !== b.contactStatus) {
      return a.contactStatus === ContactStatus.PENDING ? -1 : 1;
    }
    const timeA = a.contactStatus === ContactStatus.CONTACTED && a.contactTime
      ? -new Date(a.contactTime).getTime()
      : new Date(a.pickupTime).getTime();
    const timeB = b.contactStatus === ContactStatus.CONTACTED && b.contactTime
      ? -new Date(b.contactTime).getTime()
      : new Date(b.pickupTime).getTime();
    return timeA - timeB;
  }).filter((o) => {
    if (filter === 'pending') return o.contactStatus === ContactStatus.PENDING;
    if (filter === 'contacted') return o.contactStatus === ContactStatus.CONTACTED;
    return true;
  });

  const formatContactTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getPhoneTail = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-4);
  };

  const handleToggleContact = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleContactStatus(orderId);
  };

  const handleCopyPhone = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.phone);
      setCopiedPhone(order.id);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = order.phone;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedPhone(order.id);
    }
  };

  const handleNoteChange = (orderId: string, value: string) => {
    setDraftNotes((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleNoteBlur = (orderId: string) => {
    const note = draftNotes[orderId];
    if (note !== undefined) {
      updateContactNote(orderId, note);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待联系' },
    { key: 'contacted', label: '已联系' },
  ];

  if (riskOrders.length === 0) {
    return (
      <div className="bg-cream-50 rounded-xl p-3 border border-cream-200 h-full flex flex-col">
        <div className="text-xs font-bold text-coffee-900 mb-2.5 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>需沟通改款订单</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
          <div className="text-2xl mb-1.5">✅</div>
          <p className="text-xs text-coffee-800/50">暂无风险订单</p>
          <p className="text-[10px] text-coffee-800/40 mt-0.5">所有订单进展顺利</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-xl p-3 border border-cream-200 h-full flex flex-col">
      <div className="text-xs font-bold text-coffee-900 mb-2 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
        <span>需沟通改款订单</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-coffee-900/5 text-coffee-900/60">
          共 {riskOrders.length} 单
        </span>
      </div>

      <div className="flex items-center gap-1 mb-2.5">
        {filters.map((f) => {
          const isActive = filter === f.key;
          const count =
            f.key === 'all'
              ? riskOrders.length
              : f.key === 'pending'
                ? riskOrders.filter((o) => o.contactStatus === ContactStatus.PENDING).length
                : riskOrders.filter((o) => o.contactStatus === ContactStatus.CONTACTED).length;
          const isDanger = isActive && f.key === 'pending' && count > 0;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200
                flex items-center justify-center gap-1
                ${isActive
                  ? isDanger
                    ? 'bg-danger-500 text-white shadow-sm'
                    : 'bg-coffee-900 text-white shadow-sm'
                  : 'bg-cream-100 text-coffee-800/70 hover:bg-cream-200'
                }
              `}
            >
              <span>{f.label}</span>
              <span className={`
                text-[9px] px-1 py-0.5 rounded-full
                ${isActive ? 'bg-white/20 text-white' : 'bg-white text-coffee-800/50'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin -mr-1 pr-1">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-xl mb-1">📭</div>
            <p className="text-xs text-coffee-800/40">该筛选下暂无订单</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const chef = chefs.find((c) => c.id === order.chefId);
            const isPending = order.contactStatus === ContactStatus.PENDING;
            const isExpanded = expandedId === order.id;
            const currentNote = draftNotes[order.id] ?? order.contactNote ?? '';
            const isCopied = copiedPhone === order.id;

            return (
              <div
                key={order.id}
                className={`
                  rounded-lg border transition-all duration-200 overflow-hidden
                  ${isPending
                    ? 'bg-warning-500/5 border-warning-500/20 hover:bg-warning-500/10'
                    : 'bg-matcha-500/5 border-matcha-500/20 hover:bg-matcha-500/10'
                  }
                `}
              >
                <div
                  className="p-2 cursor-pointer"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[10px] font-mono shrink-0 ${isPending ? 'text-danger-500/70' : 'text-matcha-600/70'}`}>
                        #{order.orderNo}
                      </span>
                      <span className="text-sm font-bold text-coffee-900 truncate">{order.customerName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        isPending
                          ? 'bg-danger-500 text-white'
                          : 'bg-matcha-500 text-white'
                      }`}>
                        {CONTACT_STATUS_LABELS[order.contactStatus]}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-danger-500 shrink-0">
                      {formatPickupTime(order.pickupTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] min-w-0">
                      <span className="text-coffee-800/70 shrink-0">{order.size}</span>
                      <span className="text-amber-500 shrink-0">{getComplexityStars(order.complexity)}</span>
                      {chef ? (
                        <span className="text-[11px] text-coffee-800/70 flex items-center gap-0.5 shrink-0">
                          <span>{chef.avatar}</span>
                          <span className="truncate max-w-[50px]">{chef.name}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-danger-500 shrink-0">未分配</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isPending && (
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cream-100 border border-cream-300">
                          <span className="text-[10px] font-mono text-coffee-800/70">
                            …{getPhoneTail(order.phone)}
                          </span>
                          <button
                            onClick={(e) => handleCopyPhone(order, e)}
                            className={`p-0.5 rounded transition-all duration-200 ${
                              isCopied
                                ? 'text-matcha-600'
                                : 'text-coffee-800/40 hover:text-coffee-900 hover:bg-cream-200'
                            }`}
                            title={isCopied ? '已复制' : '复制电话'}
                          >
                            {isCopied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                          {isCopied && (
                            <span className="text-[9px] text-matcha-600 font-medium animate-fade-in">
                              已复制
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={(e) => handleToggleContact(order.id, e)}
                        className={`
                          p-1 rounded-md transition-all duration-200
                          ${isPending
                            ? 'bg-warning-500/10 text-warning-500 hover:bg-warning-500/20 hover:scale-105'
                            : 'bg-matcha-500/15 text-matcha-600 hover:bg-matcha-500/25 hover:scale-105'
                          }
                        `}
                        title={isPending ? '标记为已联系' : '标记为待联系'}
                      >
                        {isPending ? <Phone className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                      </button>

                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-coffee-800/40" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-coffee-800/40" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-2 pb-2 border-t border-coffee-800/5 animate-fade-in">
                    {order.contactTime && (
                      <div className="flex items-center justify-between mt-2 mb-2 text-[10px]">
                        <div className="flex items-center gap-1.5 text-coffee-800/60">
                          <Clock className="w-3 h-3" />
                          <span>联系时间：{formatContactTime(order.contactTime)}</span>
                        </div>
                        <button
                          onClick={(e) => handleCopyPhone(order, e)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cream-100 hover:bg-cream-200 text-coffee-800/70 transition-colors"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>{isCopied ? '已复制' : order.phone}</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-start gap-1.5">
                      <Edit3 className="w-3 h-3 text-coffee-800/40 mt-1.5 shrink-0" />
                      <textarea
                        value={currentNote}
                        onChange={(e) => handleNoteChange(order.id, e.target.value)}
                        onBlur={() => handleNoteBlur(order.id)}
                        placeholder="点击输入沟通备注，失焦自动保存..."
                        className="flex-1 text-[11px] px-2 py-1.5 rounded-md bg-white border border-cream-300 text-coffee-900 placeholder:text-coffee-800/30 focus:outline-none focus:border-matcha-500/50 focus:ring-1 focus:ring-matcha-500/20 resize-none min-h-[60px] scrollbar-thin"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
