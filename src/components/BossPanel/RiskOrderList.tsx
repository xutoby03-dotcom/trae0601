import { useState } from 'react';
import { AlertTriangle, Phone, Check, Clock, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { ContactStatus, CONTACT_STATUS_LABELS } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';
import { isOrderRisk, formatPickupTime, getComplexityStars } from '@/utils/orderUtils';

export default function RiskOrderList() {
  const orders = useOrderStore((s) => s.orders);
  const chefs = useOrderStore((s) => s.chefs);
  const toggleContactStatus = useOrderStore((s) => s.toggleContactStatus);
  const updateContactNote = useOrderStore((s) => s.updateContactNote);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const riskOrders = orders
    .filter((o) => isOrderRisk(o))
    .sort((a, b) => {
      if (a.contactStatus !== b.contactStatus) {
        return a.contactStatus === ContactStatus.PENDING ? -1 : 1;
      }
      return new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime();
    });

  const pendingCount = riskOrders.filter((o) => o.contactStatus === ContactStatus.PENDING).length;
  const contactedCount = riskOrders.filter((o) => o.contactStatus === ContactStatus.CONTACTED).length;

  const formatContactTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggleContact = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleContactStatus(orderId);
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
      <div className="text-xs font-bold text-coffee-900 mb-2.5 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
        <span>需沟通改款订单</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-danger-500/10 text-danger-500 font-medium">
            待联系 {pendingCount}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-matcha-500/10 text-matcha-600 font-medium">
            已联系 {contactedCount}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin -mr-1 pr-1">
        {riskOrders.map((order) => {
          const chef = chefs.find((c) => c.id === order.chefId);
          const isPending = order.contactStatus === ContactStatus.PENDING;
          const isExpanded = expandedId === order.id;
          const currentNote = draftNotes[order.id] ?? order.contactNote ?? '';

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
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono ${isPending ? 'text-danger-500/70' : 'text-matcha-600/70'}`}>
                      #{order.orderNo}
                    </span>
                    <span className="text-sm font-bold text-coffee-900">{order.customerName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      isPending
                        ? 'bg-danger-500 text-white'
                        : 'bg-matcha-500 text-white'
                    }`}>
                      {CONTACT_STATUS_LABELS[order.contactStatus]}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-danger-500">
                    {formatPickupTime(order.pickupTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-coffee-800/70">{order.size}</span>
                    <span className="text-amber-500">{getComplexityStars(order.complexity)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {chef ? (
                      <span className="text-[11px] text-coffee-800/70 flex items-center gap-1">
                        <span>{chef.avatar}</span>
                        {chef.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-danger-500">未分配</span>
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
                    <div className="flex items-center gap-1.5 mt-2 mb-2 text-[10px] text-coffee-800/60">
                      <Clock className="w-3 h-3" />
                      <span>联系时间：{formatContactTime(order.contactTime)}</span>
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
        })}
      </div>
    </div>
  );
}
