import { useState } from 'react';
import { useEmailStore } from '@/store/useEmailStore';
import { X, Send, CheckCircle2, Mail } from 'lucide-react';

export default function SendModal() {
  const { showSendModal, setShowSendModal } = useEmailStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!showSendModal) return null;

  const handleSend = () => {
    if (!email) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmail('');
        setShowSendModal(false);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSendModal(false)}>
      <div className="bg-[#1a1d23] rounded-xl shadow-2xl w-[420px] border border-[#2a2d35] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d35]">
          <h3 className="text-sm font-semibold text-white">测试发送</h3>
          <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">发送成功！</h4>
              <p className="text-xs text-gray-400">邮件已发送至 {email}</p>
              <p className="text-[10px] text-gray-600 mt-2">（这是一次模拟发送）</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Mail size={24} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">发送测试邮件</h4>
                  <p className="text-xs text-gray-500">输入邮箱地址进行模拟发送测试</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1.5">收件人邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!email || sending}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  email && !sending
                    ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    发送测试邮件
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
