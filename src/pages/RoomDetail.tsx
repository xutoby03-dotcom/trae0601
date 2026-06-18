import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, ClipboardCheck, Package, Users, PenTool, User } from 'lucide-react';
import { useAppStore } from '@/store';
import SupplyCard from '@/components/SupplyCard';
import { formatDate } from '@/utils/helpers';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rooms, supplies, inspections, tasks } = useAppStore();

  const room = rooms.find((r) => r.id === id);
  const roomSupplies = supplies.filter((s) => s.roomId === id);
  const roomInspections = inspections.filter((i) => i.roomId === id).slice(0, 5);
  const roomTasks = tasks.filter((t) => t.roomId === id).slice(0, 5);

  if (!room) {
    return (
      <div className="card p-16 text-center">
        <h3 className="text-lg font-medium text-slate-600 mb-2">会议室不存在</h3>
        <button onClick={() => navigate('/rooms')} className="btn btn-primary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rooms')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">{room.name}</h2>
        <button onClick={() => navigate(`/rooms/${id}/edit`)} className="btn btn-secondary btn-sm ml-auto">
          <Edit3 className="w-4 h-4" />
          编辑
        </button>
        <button onClick={() => navigate(`/inspection/${id}`)} className="btn btn-primary btn-sm">
          <ClipboardCheck className="w-4 h-4" />
          开始巡检
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="aspect-[21/9] relative">
              <img src={room.photoUrl} alt={room.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{room.name}</h2>
                    <p className="text-white/80 mt-1">
                      {room.floor} · 责任人：{room.responsiblePerson}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white font-mono">{room.capacity}</p>
                    <p className="text-white/70 text-sm">人容量</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-100">
              <div className="p-5 text-center">
                <Users className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-2xl font-bold text-slate-800 font-mono">{room.capacity}</p>
                <p className="text-sm text-slate-500">容纳人数</p>
              </div>
              <div className="p-5 text-center">
                <PenTool className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-2xl font-bold text-slate-800 font-mono">{room.whiteboardCount}</p>
                <p className="text-sm text-slate-500">白板数量</p>
              </div>
              <div className="p-5 text-center">
                <Package className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-2xl font-bold text-slate-800 font-mono">{roomSupplies.length}</p>
                <p className="text-sm text-slate-500">用品品类</p>
              </div>
              <div className="p-5 text-center">
                <ClipboardCheck className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-2xl font-bold text-slate-800 font-mono">{roomInspections.length}</p>
                <p className="text-sm text-slate-500">巡检记录</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">用品库存</h3>
              <button
                onClick={() => navigate(`/inventory/${id}`)}
                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
              >
                管理库存 →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomSupplies.map((supply) => (
                <SupplyCard key={supply.id} supply={supply} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              基本信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">创建时间</span>
                <span className="font-medium text-slate-700">{formatDate(room.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">所在楼层</span>
                <span className="font-medium text-slate-700">{room.floor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">责任人</span>
                <span className="font-medium text-slate-700">{room.responsiblePerson}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              最近巡检
            </h3>
            {roomInspections.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无巡检记录</p>
            ) : (
              <div className="space-y-3">
                {roomInspections.map((ins) => (
                  <div key={ins.id} className="p-3 rounded-lg bg-slate-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm text-slate-700">{ins.inspector}</span>
                      <span className="text-xs text-slate-400">{formatDate(ins.inspectionDate)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{ins.notes || '无备注'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              相关任务
            </h3>
            {roomTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无补给任务</p>
            ) : (
              <div className="space-y-2">
                {roomTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg bg-slate-50 text-sm">
                    <p className="font-medium text-slate-700 line-clamp-1">{task.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(task.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
