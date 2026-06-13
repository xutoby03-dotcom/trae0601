import { useNavigate } from "react-router-dom";
import {
  Flower2,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/store";
import PlantCard from "@/components/plant/PlantCard";
import { formatDate } from "@/utils/date";

export default function Dashboard() {
  const navigate = useNavigate();
  const plants = useStore((s) => s.plants);
  const records = useStore((s) => s.serviceRecords);
  const issues = useStore((s) => s.issues);
  const reminders = useStore((s) => s.reminders);
  const suppliers = useStore((s) => s.suppliers);
  const getSupplierById = useStore((s) => s.getSupplierById);

  const healthyCount = plants.filter((p) => p.status === "healthy").length;
  const warningCount = plants.filter((p) => p.status === "warning").length;
  const problemCount = plants.filter((p) => p.status === "problem").length;
  const openIssues = issues.filter((i) => i.status !== "closed").length;
  const recentRecords = records.slice(0, 5);
  const problemPlants = plants.filter((p) => p.status !== "healthy").slice(0, 4);

  const stats = [
    {
      label: "绿植总数",
      value: plants.length,
      icon: Flower2,
      color: "from-forest-500 to-forest-700",
      sub: `健康 ${healthyCount}`,
    },
    {
      label: "本月服务",
      value: records.filter((r) => {
        const d = new Date(r.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth();
      }).length,
      icon: ClipboardCheck,
      color: "from-moss-400 to-moss-600",
      sub: "累计 " + records.length,
    },
    {
      label: "待处理问题",
      value: openIssues,
      icon: AlertTriangle,
      color: "from-amber-500 to-amber-warning",
      sub: `警告 ${warningCount} / 问题 ${problemCount}`,
    },
    {
      label: "未读提醒",
      value: reminders.filter((r) => !r.read).length,
      icon: Sparkles,
      color: "from-forest-400 to-forest-600",
      sub: suppliers.length + " 家供应商",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-card border border-forest-50 card-hover animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-forest-500">{stat.label}</p>
                  <p className="font-serif text-4xl font-bold text-forest-800 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-forest-400 mt-2">{stat.sub}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-card border border-forest-50 overflow-hidden">
          <div className="p-6 border-b border-forest-50 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-forest-800">
                最近养护记录
              </h3>
              <p className="text-sm text-forest-500 mt-0.5">
                最新的服务打卡记录
              </p>
            </div>
            <button
              onClick={() => navigate("/service")}
              className="text-sm text-forest-600 hover:text-forest-800 flex items-center gap-1 transition-colors"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-forest-50">
            {recentRecords.map((r, idx) => {
              const plant = plants.find((p) => p.id === r.plantId);
              const staff = useStore.getState().getStaffById(r.staffId);
              return (
                <div
                  key={r.id}
                  className="p-5 hover:bg-cream-50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                      {plant?.photoUrl && (
                        <img
                          src={plant.photoUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-forest-800">
                          {plant?.species || "未知绿植"}
                        </span>
                        <span className="text-xs text-forest-500 bg-forest-50 px-2 py-0.5 rounded-full">
                          {plant?.location}
                        </span>
                      </div>
                      <p className="text-sm text-forest-500 mt-1">
                        {staff?.name} · {formatDate(r.checkinAt)} ·{" "}
                        {r.operations.length} 项操作 · {r.photos.length} 张照片
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {r.operations.slice(0, 3).map((op) => (
                        <span
                          key={op}
                          className="text-xs px-2 py-1 bg-forest-50 text-forest-600 rounded-lg"
                        >
                          {
                            {
                              watering: "浇水",
                              pruning: "修剪",
                              fertilizing: "施肥",
                              repotting: "换盆",
                              pest_control: "病虫",
                            }[op]
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-forest-50 overflow-hidden">
          <div className="p-6 border-b border-forest-50">
            <h3 className="font-serif text-lg font-semibold text-forest-800">
              快捷入口
            </h3>
            <p className="text-sm text-forest-500 mt-0.5">常用功能快速访问</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: "新增绿植档案",
                desc: "录入新的绿植信息",
                path: "/plants/new",
                icon: Flower2,
              },
              {
                label: "打卡养护服务",
                desc: "记录本次养护操作",
                path: "/service",
                icon: ClipboardCheck,
              },
              {
                label: "问题追踪看板",
                desc: openIssues + " 个待处理问题",
                path: "/issues",
                icon: AlertTriangle,
              },
              {
                label: "查看统计报表",
                desc: "数据分析与汇总",
                path: "/stats",
                icon: TrendingUp,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full p-4 rounded-xl hover:bg-cream-50 transition-colors text-left flex items-center gap-4 group animate-slide-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-forest-50 group-hover:bg-forest-100 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-forest-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-forest-800">{item.label}</p>
                    <p className="text-xs text-forest-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-forest-400 group-hover:text-forest-600 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {problemPlants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-forest-800">
                需要关注的绿植
              </h3>
              <p className="text-sm text-forest-500 mt-0.5">
                状态异常的绿植，建议及时处理
              </p>
            </div>
            <button
              onClick={() => navigate("/plants")}
              className="text-sm text-forest-600 hover:text-forest-800 flex items-center gap-1 transition-colors"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {problemPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
