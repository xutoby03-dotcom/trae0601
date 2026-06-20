import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Building2, CreditCard, CalendarDays, CheckCircle, ScanLine } from 'lucide-react';
import { useStore } from '../store';
import { productApi, employeeApi, transactionApi } from '../services/api';
import type { Product, Employee } from '../../shared/types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    products,
    employees,
    departments,
    cart,
    selectedEmployee,
    selectedDepartment,
    paymentType,
    setProducts,
    setEmployees,
    setDepartments,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setSelectedEmployee,
    setSelectedDepartment,
    setPaymentType,
    cartTotal,
    cartCount,
  } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        productApi.search(searchQuery).then(setSearchResults);
      } else {
        setSearchResults([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function loadData() {
    const [products, employees, departments] = await Promise.all([
      productApi.getAll('active'),
      employeeApi.getAll(),
      employeeApi.getDepartments(),
    ]);
    setProducts(products);
    setEmployees(employees);
    setDepartments(departments);
  }

  function handleSelectEmployee(emp: Employee) {
    setSelectedEmployee(emp);
    const dept = departments.find(d => d.id === emp.departmentId);
    setSelectedDepartment(dept || null);
    setShowEmployeeSelect(false);
  }

  async function handleSubmit() {
    if (!selectedEmployee || !selectedDepartment || cart.length === 0) return;

    const invalidItems = cart.filter(item => item.product.status !== 'active');
    if (invalidItems.length > 0) {
      const names = invalidItems.map(i => i.product.name).join('、');
      alert(`以下商品状态异常，无法取货：${names}`);
      return;
    }

    try {
      await transactionApi.create({
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        employeeId: selectedEmployee.id,
        departmentId: selectedDepartment.id,
        paymentType,
      });
      setShowSuccess(true);
      clearCart();
      setTimeout(() => setShowSuccess(false), 2000);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const displayProducts = (searchQuery.trim() ? searchResults : products).filter(
    p => p.status === 'active'
  );

  function getStockStatus(product: Product) {
    if (product.status === 'expired') return { text: '已过期', color: 'bg-gray-100 text-gray-500', disabled: true };
    if (product.status === 'damaged') return { text: '已破损', color: 'bg-gray-100 text-gray-500', disabled: true };
    if (product.status !== 'active') return { text: '已下架', color: 'bg-gray-100 text-gray-500', disabled: true };
    if (product.stock <= 0) return { text: '缺货', color: 'bg-gray-100 text-gray-500', disabled: true };
    if (product.stock < 5) return { text: `仅剩${product.stock}件`, color: 'bg-danger-100 text-danger-600', disabled: false };
    return { text: `库存${product.stock}件`, color: 'bg-success-100 text-success-600', disabled: false };
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce-soft">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h3 className="font-display text-2xl text-gray-800 mb-2">取货成功！</h3>
            <p className="text-gray-500">已记录本次取货</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-gray-800 mb-2">取货结算</h1>
          <p className="text-gray-500">扫码或搜索商品，记录取货信息</p>
        </div>

        <div className="flex gap-8">
          {/* Left - Product Selection */}
          <div className="flex-1">
            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <ScanLine className="w-5 h-5" />
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="扫码输入条码或搜索商品名称..."
                className="w-full pl-12 pr-4 py-4 text-lg bg-white border-2 border-orange-100 rounded-2xl focus:border-primary-400 focus:outline-none transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-primary-500" />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-4">
              {displayProducts.map((product, idx) => {
                const status = getStockStatus(product);
                const inCart = cart.find(item => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-up ${
                      status.disabled ? 'opacity-60' : 'hover:-translate-y-1 cursor-pointer'
                    }`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    onClick={() => !status.disabled && addToCart(product)}
                  >
                    <div className="relative mb-3">
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-xl bg-gray-100"
                      />
                      <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                      {inCart && (
                        <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          {inCart.quantity}件
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.spec} · {product.flavor}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl text-primary-600">¥{product.salePrice.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">{product.shelfPosition}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>未找到商品</p>
              </div>
            )}
          </div>

          {/* Right - Cart */}
          <div className="w-96">
            <div className="bg-white rounded-2xl shadow-lg sticky top-8 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="w-6 h-6" />
                  <h2 className="font-display text-xl">购物清单</h2>
                  <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    {cartCount()}件
                  </span>
                </div>
                <p className="text-primary-100 text-sm">请选择员工和付款方式</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Employee Select */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">选择员工</label>
                  <div
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-primary-300 transition-colors flex items-center gap-3"
                    onClick={() => setShowEmployeeSelect(!showEmployeeSelect)}
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    {selectedEmployee ? (
                      <span className="font-medium text-gray-800">{selectedEmployee.name}</span>
                    ) : (
                      <span className="text-gray-400">请选择取货人</span>
                    )}
                    {selectedDepartment && (
                      <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                        {selectedDepartment.name}
                      </span>
                    )}
                  </div>

                  {showEmployeeSelect && (
                    <div className="mt-2 bg-white border-2 border-gray-100 rounded-xl p-2 max-h-48 overflow-y-auto">
                      {employees.map(emp => (
                        <div
                          key={emp.id}
                          className={`px-3 py-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors ${
                            selectedEmployee?.id === emp.id ? 'bg-orange-50 text-primary-600' : ''
                          }`}
                          onClick={() => handleSelectEmployee(emp)}
                        >
                          {emp.name}
                          <span className="text-xs text-gray-400 ml-2">
                            {emp.department?.name || departments.find(d => d.id === emp.departmentId)?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Type */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">付款方式</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        paymentType === 'monthly'
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                      onClick={() => setPaymentType('monthly')}
                    >
                      <CalendarDays className="w-4 h-4" />
                      月底结算
                    </button>
                    <button
                      className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        paymentType === 'instant'
                          ? 'border-success-500 bg-success-50 text-success-600'
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                      onClick={() => setPaymentType('instant')}
                    >
                      <CreditCard className="w-4 h-4" />
                      即时付款
                    </button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm text-gray-600 mb-3">商品清单</h3>
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">购物车为空</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                          <img
                            src={item.product.photo}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800 truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{item.product.flavor}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateCartQuantity(item.product.id, item.quantity - 1); }}
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateCartQuantity(item.product.id, item.quantity + 1); }}
                              className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-200 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}
                            className="text-gray-400 hover:text-danger-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">合计金额</span>
                    <span className="font-display text-3xl text-primary-600">¥{cartTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedEmployee || cart.length === 0}
                    className={`w-full py-4 rounded-xl font-medium text-white transition-all ${
                      selectedEmployee && cart.length > 0
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg hover:shadow-primary-200 active:scale-98'
                        : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    确认取货
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
