import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrderStore } from '@/store/useOrderStore';
import Header from '@/components/layout/Header';
import OrderCard from '@/components/order/OrderCard';
import NewOrderModal from '@/components/order/NewOrderModal';

export default function OrderList() {
  const navigate = useNavigate();
  const { orders, resetWithMockData } = useOrderStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);

  useEffect(() => {
    if (orders.length === 0) {
      setShowResetButton(true);
    }
  }, [orders]);

  const handleOrderCreated = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const handleResetWithMock = () => {
    resetWithMockData();
    setShowResetButton(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onNewOrder={() => setIsModalOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-3xl font-bold text-neutral-800"
            >
              我的订单
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-neutral-500 mt-1"
            >
              共 {orders.length} 个海淘包裹
            </motion.p>
          </div>

          {showResetButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={handleResetWithMock}
              className="btn-secondary flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              加载示例数据
            </motion.button>
          )}
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-neutral-800 mb-2">
              还没有订单
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              开始记录你的第一个海淘订单吧！录入平台、汇率、参与人，系统会自动帮你计算分摊费用。
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新建订单
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetWithMock}
                className="btn-secondary flex items-center gap-2"
              >
                <Database className="w-5 h-5" />
                查看示例
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </motion.div>
        )}
      </main>

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleOrderCreated}
      />
    </div>
  );
}
