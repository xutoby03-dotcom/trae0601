import { Link } from 'react-router-dom';
import { useReimbursementStore } from '../store/useReimbursementStore';
import { AmountCard } from '../components/AmountCard';
import { StatusTag } from '../components/StatusTag';
import { formatDate, formatCurrency } from '../utils/format';
import { Empty } from '../components/Empty';

const Home = () => {
  const { items } = useReimbursementStore();

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const pendingItems = items.filter((i) => i.status === 'pending').length;
  const approvedItems = items.filter((i) => i.status === 'approved');
  const approvedAmount = approvedItems.reduce((sum, item) => sum + item.amount, 0);
  const recentItems = items.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来 👋</h2>
        <p className="text-gray-500">管理合租生活的各项事务</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AmountCard amount={totalAmount} label="报销总额" />
        <AmountCard amount={approvedAmount} label="已通过金额" className="bg-primary-50" />
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">待审核</p>
          <p className="text-3xl font-bold text-warning-600">{pendingItems} 条</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/submit"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">提交报销</h3>
              <p className="text-sm text-gray-500">添加新的报销申请</p>
            </div>
          </div>
        </Link>

        <Link
          to="/community-items"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center group-hover:bg-info-200 transition-colors">
              <svg className="w-6 h-6 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">公共物品公约</h3>
              <p className="text-sm text-gray-500">管理客厅投影仪、空气炸锅等</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">最近报销</h3>
          <Link to="/review" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            查看全部 →
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <Empty
            title="暂无报销记录"
            description="点击提交报销添加第一条记录"
            action={
              <Link to="/submit" className="btn btn-primary">
                提交报销
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-900 truncate">{item.description}</p>
                    <StatusTag status={item.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {item.applicant} · {formatDate(item.date)}
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900 ml-4">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
