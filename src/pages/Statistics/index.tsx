import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie } from 'recharts';
import { Building2, AlertTriangle, Clock, MapPin, TrendingUp } from 'lucide-react';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useRecordStore } from '@/store/useRecordStore';
import { useCabinetStore } from '@/store/useCabinetStore';
import { BUILDING_NAMES, type BuildingType } from '@/types';
import { formatDate } from '@/utils/dateUtils';
const COLORS = ['#1E88E5', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];
export const Statistics: React.FC = () => {
 const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | 'all'>('all');
 const getBuildingStats = useMedicineStore(state => state.getBuildingStats);
 const getExpiringSoon = useMedicineStore(state => state.getExpiringSoon);
 const getInjuryHotspots = useRecordStore(state => state.getInjuryHotspots);
 const medicines = useMedicineStore(state => state.medicines);
 const cabinets = useCabinetStore(state => state.cabinets);
 const buildingStats = useMemo(() => getBuildingStats(), [getBuildingStats]);
 const expiringSoon = useMemo(() => getExpiringSoon(30), [getExpiringSoon]);
 const injuryHotspots = useMemo(() => getInjuryHotspots(7), [getInjuryHotspots]);
 const chartData = useMemo(() => {
 return buildingStats.map(stat => ({
 name: stat.buildingName,
 库存不足: stat.lowStockCount,
 已过期: stat.expiredCount,
 即将过期: stat.expiringSoonCount,
 }));
 }, [buildingStats]);
 const hotspotChartData = useMemo(() => {
 return injuryHotspots.map(h => ({
 name: h.location,
 外伤次数: h.count,
 }));
 }, [injuryHotspots]);
 const filteredExpiring = useMemo(() => {
 if (selectedBuilding === 'all')
 return expiringSoon;
 const buildingCabinets = cabinets.filter(c => c.building === selectedBuilding).map(c => c.id);
 return expiringSoon.filter(m => buildingCabinets.includes(m.cabinetId));
 }, [expiringSoon, selectedBuilding, cabinets]);
 const totalStats = useMemo(() => {
 const allExpired = medicines.filter(m => m.isExpired).length;
 const allLowStock = buildingStats.reduce((sum, s) => sum + s.lowStockCount, 0);
 const allExpiring = expiringSoon.length;
 return [
 { title: '库存不足药品', value: allLowStock, icon: <AlertTriangle className="w-6 h-6"/>, color: 'bg-red-500' },
 { title: '已过期药品', value: allExpired, icon: <Clock className="w-6 h-6"/>, color: 'bg-gray-600' },
 { title: '即将过期(30天)', value: allExpiring, icon: <TrendingUp className="w-6 h-6"/>, color: 'bg-amber-500' },
 { title: '外伤高发位置', value: injuryHotspots.length, icon: <MapPin className="w-6 h-6"/>, color: 'bg-purple-500' },
 ];
 }, [medicines, buildingStats, expiringSoon, injuryHotspots]);
 const getCabinetName = (cabinetId: string) => {
 return cabinets.find(c => c.id === cabinetId)?.name || cabinetId;
 };
 const getBuildingName = (cabinetId: string) => {
 const cabinet = cabinets.find(c => c.id === cabinetId);
 return cabinet ? BUILDING_NAMES[cabinet.building] : '';
 };
 const pieData = useMemo(() => {
 const data = [
 { name: '库存充足', value: medicines.length - buildingStats.reduce((sum, s) => sum + s.lowStockCount + s.expiredCount, 0) },
 { name: '库存不足', value: buildingStats.reduce((sum, s) => sum + s.lowStockCount, 0) },
 { name: '已过期', value: buildingStats.reduce((sum, s) => sum + s.expiredCount, 0) },
 ];
 return data.filter(d => d.value > 0);
 }, [medicines, buildingStats]);
 return (<div className="space-y-8 pb-8">
 <div className="animate-fade-in">
 <h2 className="text-2xl font-bold text-gray-900 mb-2">统计分析</h2>
 <p className="text-gray-500">按楼栋统计缺药箱、快过期药品和最近一周外伤高发位置</p>
 </div>
 
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {totalStats.map((stat, index) => (<div key={index} className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
 {stat.icon}
 </div>
 <div>
 <p className="text-gray-500 text-sm">{stat.title}</p>
 <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
 </div>
 </div>
 </div>))}
 </div>
 
 <div className="grid lg:grid-cols-2 gap-6">
 <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Building2 className="w-5 h-5 text-primary-600"/>
 各楼栋药品状态统计
 </h3>
 <div className="h-80">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
 <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
 <YAxis tick={{ fontSize: 12 }}/>
 <Tooltip />
 <Legend />
 <Bar dataKey="库存不足" fill="#F44336" radius={[4, 4, 0, 0]}/>
 <Bar dataKey="已过期" fill="#9E9E9E" radius={[4, 4, 0, 0]}/>
 <Bar dataKey="即将过期" fill="#FF9800" radius={[4, 4, 0, 0]}/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 
 <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <AlertTriangle className="w-5 h-5 text-amber-500"/>
 药品状态分布
 </h3>
 <div className="h-80">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
 {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 
 {injuryHotspots.length > 0 && (<div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.7s' }}>
 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <MapPin className="w-5 h-5 text-red-500"/>
 最近一周外伤高发位置
 </h3>
 <div className="grid md:grid-cols-2 gap-6">
 <div className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={hotspotChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
 <XAxis type="number" tick={{ fontSize: 12 }}/>
 <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100}/>
 <Tooltip />
 <Bar dataKey="外伤次数" radius={[0, 4, 4, 0]}>
 {hotspotChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 0 ? '#F44336' : index === 1 ? '#FF9800' : '#FFC107'}/>))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 
 <div className="space-y-3">
 <h4 className="font-medium text-gray-700 mb-3">热力排行</h4>
 {injuryHotspots.map((hotspot, index) => (<div key={hotspot.cabinetId} className={`flex items-center justify-between p-4 rounded-xl ${index === 0 ? 'bg-red-50 border border-red-200' :
 index === 1 ? 'bg-amber-50 border border-amber-200' :
 'bg-yellow-50 border border-yellow-200'}`}>
 <div className="flex items-center gap-3">
 <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-red-500' :
 index === 1 ? 'bg-amber-500' :
 'bg-yellow-500'}`}>
 {index + 1}
 </span>
 <div>
 <p className="font-medium text-gray-900">{hotspot.location}</p>
 <p className="text-sm text-gray-500">{getBuildingName(hotspot.cabinetId)}</p>
 </div>
 </div>
 <span className="text-lg font-bold text-gray-900">{hotspot.count} 次</span>
 </div>))}
 </div>
 </div>
 </div>)}
 
 <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.8s' }}>
 <div className="px-6 py-4 border-b border-gray-100">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
 <Clock className="w-5 h-5 text-amber-500"/>
 即将过期药品明细（30天内）
 </h3>
 <div className="flex gap-2">
 <button onClick={() => setSelectedBuilding('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedBuilding === 'all'
 ? 'bg-primary-500 text-white'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
 全部
 </button>
 {(['sports', 'lab', 'dormitory'] as BuildingType[]).map(building => (<button key={building} onClick={() => setSelectedBuilding(building)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedBuilding === building
 ? 'bg-primary-500 text-white'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
 {BUILDING_NAMES[building]}
 </button>))}
 </div>
 </div>
 </div>
 
 {filteredExpiring.length === 0 ? (<div className="p-12 text-center text-gray-500">
 暂无即将过期的药品
 </div>) : (<table className="w-full">
 <thead>
 <tr className="bg-gray-50 border-b border-gray-100">
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">药品名称</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所在楼栋</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">药箱</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批号</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前库存</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredExpiring.map(medicine => (<tr key={medicine.id} className="hover:bg-amber-50/30 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="font-medium text-gray-900">{medicine.name}</span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-gray-600">
 {getBuildingName(medicine.cabinetId)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-gray-600">
 {getCabinetName(medicine.cabinetId)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
 {medicine.batchNumber}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="text-amber-600 font-medium">{formatDate(medicine.expiryDate)}</span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-gray-600">
 {medicine.currentQuantity}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
 即将过期
 </span>
 </td>
 </tr>))}
 </tbody>
 </table>)}
 </div>
 </div>);
};

