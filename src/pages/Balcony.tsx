import BalconyCard from "@/components/BalconyCard";
import { useBalconyStore } from "@/store/balconyStore";
import { useDryingStore } from "@/store/dryingStore";
import { Umbrella, Wind, Sun } from "lucide-react";

export default function Balcony() {
  const { profile } = useBalconyStore();
  const { records } = useDryingStore();

  const drying = records.filter((r) => r.status === "drying").length;
  const hasRainProtection = profile.rainCover !== "无遮雨设施";
  const goodVent = profile.ventilation === "通风良好" || profile.ventilation === "南北通透";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <BalconyCard />

        <div className="card">
          <h2 className="font-display text-xl text-sky-800 mb-5 flex items-center gap-2">
            <Sun className="w-5 h-5 text-sun-500" />
            晾衣杆使用情况
          </h2>
          <div className="space-y-4">
            {Array.from({ length: profile.poleCount }).map((_, i) => {
              const idx = i;
              const isUsed = idx < drying;
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-4 border-2 transition-all ${
                    isUsed
                      ? "border-sky-200 bg-sky-50/60"
                      : "border-sky-100 bg-white/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          isUsed ? "bg-sky-400/20" : "bg-sky-100"
                        }`}
                      >
                        {isUsed ? "👕" : "➖"}
                      </div>
                      <div>
                        <div className="font-semibold text-sky-800">晾衣杆 #{i + 1}</div>
                        <div
                          className={`text-xs ${
                            isUsed ? "text-sky-600" : "text-sky-400"
                          }`}
                        >
                          {isUsed ? "已占用" : "空闲中"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        isUsed
                          ? "bg-sky-400/15 text-sky-700"
                          : "bg-warn-green/15 text-warn-green"
                      }`}
                    >
                      {isUsed ? "使用中" : "可用"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="font-display text-xl text-sky-800 mb-4 flex items-center gap-2">
            <Umbrella className="w-5 h-5 text-sky-500" />
            防雨能力评估
          </h2>
          <div className="space-y-3">
            <EvalItem
              title="遮雨设施"
              ok={hasRainProtection}
              okText={profile.rainCover}
              warnText={profile.rainCover}
              okScore={hasRainProtection ? 2 : 0}
              fullScore={2}
            />
            <EvalItem
              title="窗户状态"
              ok={profile.isSealed}
              okText={profile.isSealed ? "封窗防雨" : "开放式，直接暴露"}
              warnText={profile.isSealed ? "封窗防雨" : "开放式，直接暴露"}
              okScore={profile.isSealed ? 2 : 0}
              fullScore={2}
            />
            <EvalItem
              title="朝向优势"
              ok={profile.orientation.includes("南")}
              okText={`${profile.orientation}，采光好`}
              warnText={`${profile.orientation}，采光一般`}
              okScore={profile.orientation.includes("南") ? 1 : 0}
              fullScore={1}
            />

            <div className="pt-4 mt-3 border-t border-sky-100/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sky-700 font-medium">综合防雨指数</span>
                <span className="text-xs text-sky-500">满分5分</span>
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const total = (hasRainProtection ? 2 : 0) + (profile.isSealed ? 2 : 0) + (profile.orientation.includes("南") ? 1 : 0);
                  const on = i < total;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full ${
                        on
                          ? "bg-gradient-to-r from-sky-400 to-sun-400"
                          : "bg-sky-100"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-sky-600 leading-relaxed">
                {!hasRainProtection && !profile.isSealed
                  ? "无遮雨无封窗，下雨时需尽快收衣！"
                  : !hasRainProtection
                  ? "依赖封窗防雨，暴雨时仍需留意。"
                  : "防雨设施良好，可以安心晾晒。"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-xl text-sky-800 mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-warn-green" />
            晾晒小贴士
          </h2>
          <ul className="space-y-3">
            <TipItem
              icon="🌞"
              title={`${profile.orientation}最佳时段`}
              desc={
                profile.orientation.includes("南")
                  ? "上午10点到下午3点阳光最充足"
                  : profile.orientation.includes("东")
                  ? "上午阳光好，下午晒不到"
                  : profile.orientation.includes("西")
                  ? "下午到傍晚阳光强烈"
                  : "北向基本无直射，靠通风晾干"
              }
            />
            <TipItem
              icon="💨"
              title="通风建议"
              desc={
                goodVent
                  ? "通风条件好，衣物干得快，注意固定好防吹落"
                  : "通风一般，厚衣物建议用烘干辅助"
              }
            />
            <TipItem
              icon="☔"
              title="雨天应对"
              desc={
                profile.rainCover === "无遮雨设施"
                  ? "无遮雨设施，下雨请密切关注天气预报"
                  : "有遮雨设施，中到大雨仍建议收衣"
              }
            />
            <TipItem
              icon="⏰"
              title="最佳晾晒时长"
              desc="薄衣物3-4小时，厚衣物6-8小时，避免过夜建议收衣防返潮"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function EvalItem({
  title,
  ok,
  okText,
  warnText,
  okScore,
  fullScore,
}: {
  title: string;
  ok: boolean;
  okText: string;
  warnText: string;
  okScore: number;
  fullScore: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60">
      <div>
        <div className="text-sm text-sky-800 font-medium">{title}</div>
        <div className={`text-xs mt-0.5 ${ok ? "text-warn-green" : "text-sky-500"}`}>
          {ok ? okText : warnText}
        </div>
      </div>
      <div className="text-sm font-semibold" style={{ color: ok ? "#1DD1A1" : "#FECA57" }}>
        {okScore}/{fullScore}
      </div>
    </div>
  );
}

function TipItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <li className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-sky-50/80 to-transparent hover:from-sky-100/60 transition-colors">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
      <div className="font-medium text-sky-800 text-sm">{title}</div>
      <div className="text-xs text-sky-600 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </li>
  );
}
