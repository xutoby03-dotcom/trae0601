import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Download, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateCheckupList, generateCheckupSummary } from '../utils/checkup';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import AlertBanner from '../components/AlertBanner';
const CheckupList: React.FC = () => {
 const navigate = useNavigate();
 const { braces, records, reminders, inventories, init, initialized, updateInventory, setInventoryThreshold, addCheckupNote } = useStore();
 const [selectedBraces, setSelectedBraces] = useState<string>('');
 const [checkupDate, setCheckupDate] = useState('');
 useEffect(() => {
 if (!initialized) {
 init();
 }
 }, [init, initialized]);
 useEffect(() => {
 if (braces.length > 0 && !selectedBraces) {
 setSelectedBraces(braces[0].id);
 }
 }, [braces, selectedBraces]);
 const currentBraces = braces.find(b => b.id === selectedBraces);
 const currentInventory = inventories.find(i => i.bracesId === selectedBraces);
 const checkupIssues = currentBraces
 ? generateCheckupList(currentBraces, records, reminders)
 : [];
 const handleDownload = () => {
 if (!currentBraces)
 return;
 const summary = generateCheckupSummary(currentBraces, checkupIssues);
 const blob = new Blob([summary], { type: 'text/markdown' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${currentBraces.name}_复诊清单_${new Date().toISOString().split('T')[0]}.md`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 };
 const handleSaveCheckupNote = () => {
 if (!currentBraces || !checkupDate)
 return;
 const recentMissedRecords = JSON.stringify(records
 .filter(r => r.bracesId === selectedBraces && r.wearHours < 20)
 .slice(-5)
 .map(r => ({ date: r.recordDate, wearHours: r.wearHours })));
 addCheckupNote({
 bracesId: selectedBraces,
 checkupDate,
 hasPain: checkupIssues.some(i => i.category === 'pain'),
 painLocation: checkupIssues.find(i => i.category === 'pain')?.items[0]?.match(/（(.+?)）/)?.[1] || '',
 hasCrack: checkupIssues.some(i => i.category === 'crack'),
 isLoose: checkupIssues.some(i => i.category === 'loose'),
 recentMissedRecords,
 notes: checkupIssues.map(i => `${i.title}: ${i.items.join('; ')}`).join('\n'),
 });
 alert('复诊记录已保存！');
 setCheckupDate('');
 };
 const handleStockChange = (delta: number) => {
 if (!selectedBraces)
 return;
 updateInventory(selectedBraces, delta);
 };
 const getIssueIcon = (category: string) => {
 const icons: Record<string, string> = {
 pain: '😣',
 crack: '🔍',
 loose: '📏',
 missed: '⏰',
 clean: '🧼',
 };
 return icons[category] || '📋';
 };
 if (!initialized) {
 return (<div className="flex items-center justify-center min-h-96">
 <div className="animate-pulse text-primary text-xl">加载中...</div>
 </div>);
 }
 return (<div className="space-y-6 animate-fade-in">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-warm-gray transition-colors">
 <ArrowLeft size={24}/>
 </button>
 <div className="flex-1">
 <h1 className="text-2xl font-bold font-display text-warm-dark">复诊清单 📋</h1>
 <p className="text-gray-500 mt-1">生成复诊问题清单和管理清洁片库存</p>
 </div>
 {braces.length > 1 && (<select value={selectedBraces} onChange={(e) => setSelectedBraces(e.target.value)} className="input-base w-auto">
 {braces.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
 </select>)}
 </div>

 {currentInventory && currentInventory.currentStock <= currentInventory.lowStockThreshold && (<AlertBanner type="warning" title={`清洁片库存不足！仅剩 ${currentInventory.currentStock} 片`} description="请及时购买补充，避免影响清洁"/>)}

 <Card>
 <CardHeader>
 <CardTitle>清洁片库存 💊</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {inventories.filter(i => i.bracesId === selectedBraces).map(inventory => (<div key={inventory.id}>
 <div className="flex items-center justify-between mb-4">
 <div>
 <div className="text-sm text-gray-500">当前库存</div>
 <div className={`text-4xl font-bold font-display ${
 inventory.currentStock <= inventory.lowStockThreshold
 ? 'text-accent-coral'
 : 'text-primary'
 }`}>
 {inventory.currentStock}
 <span className="text-lg font-normal text-gray-400 ml-1">片</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={() => handleStockChange(-1)} className="w-12 h-12 rounded-xl bg-warm-gray flex items-center justify-center hover:bg-gray-200 transition-colors">
 <Minus size={20}/>
 </button>
 <button onClick={() => handleStockChange(10)} className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors">
 <Plus size={20}/>
 </button>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div className="p-3 rounded-xl bg-warm-gray/50">
 <div className="text-gray-500">低库存阈值</div>
 <div className="flex items-center gap-2 mt-1">
 <input type="number" min="1" max="20" value={inventory.lowStockThreshold} onChange={(e) => setInventoryThreshold(selectedBraces, Number(e.target.value))} className="w-16 input-base py-1 px-2 text-center"/>
 <span className="text-gray-500">片</span>
 </div>
 </div>
 <div className="p-3 rounded-xl bg-warm-gray/50">
 <div className="text-gray-500">上次补货</div>
 <div className="font-medium mt-1">{inventory.lastRestockDate}</div>
 </div>
 </div>
 </div>))}
 </CardContent>
 </Card>

 {currentBraces && (<Card>
 <CardHeader className="flex items-center justify-between">
 <div>
 <CardTitle>复诊问题清单</CardTitle>
 <p className="text-sm text-gray-500">{currentBraces.name}</p>
 </div>
 <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
 <Download size={16}/>
 导出
 </button>
 </CardHeader>
 <CardContent className="space-y-4">
 {checkupIssues.length === 0 ? (<div className="text-center py-8">
 <div className="text-4xl mb-2">✅</div>
 <p className="text-gray-500">最近状况良好，无特殊问题需要向医生说明</p>
 </div>) : (<div className="space-y-4">
 {checkupIssues.map(issue => (<div key={issue.category} className="p-4 rounded-xl bg-warm-gray/30">
 <h4 className="font-bold text-warm-dark mb-2 flex items-center gap-2">
 <span>{getIssueIcon(issue.category)}</span>
 {issue.title}
 </h4>
 <ul className="space-y-2">
 {issue.items.map((item, index) => (<li key={index} className="flex items-start gap-2 text-sm text-gray-600">
 <span className="text-primary mt-0.5">•</span>
 <span>{item}</span>
 </li>))}
 </ul>
 </div>))}
 </div>)}

 <div className="pt-4 border-t border-warm-gray">
 <label className="label-base">下次复诊日期</label>
 <div className="flex gap-2">
 <input type="date" value={checkupDate} onChange={(e) => setCheckupDate(e.target.value)} className="input-base flex-1"/>
 <button onClick={handleSaveCheckupNote} disabled={!checkupDate} className="btn-primary flex items-center gap-2">
 <FileText size={18}/>
 保存记录
 </button>
 </div>
 </div>
 </CardContent>
 </Card>)}

 <Card>
 <CardHeader>
 <CardTitle>温馨提示 💡</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-3 text-sm text-gray-600">
 <li className="flex items-start gap-2">
 <span className="text-primary mt-0.5">✓</span>
 <span>复诊前请仔细检查牙套是否有裂纹、磨损等情况</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-primary mt-0.5">✓</span>
 <span>记录最近30天内的佩戴情况和任何不适症状</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-primary mt-0.5">✓</span>
 <span>确保清洁片库存充足，复诊前可提前清洁牙套</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-primary mt-0.5">✓</span>
 <span>导出问题清单并打印，方便就诊时与医生沟通</span>
 </li>
 </ul>
 </CardContent>
 </Card>
 </div>);
};
export default CheckupList;
