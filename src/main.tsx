import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SEED_DATA } from '@/data/seedData';

const AQ_KEY = "aquarium_data";
const FD_KEY = "feeding_data";
const WT_KEY = "water_data";
const ST_KEY = "stock_data";
const ALL_KEYS = [AQ_KEY, FD_KEY, WT_KEY, ST_KEY];

function validateAndPurge(): boolean {
  try {
    const rawAq = localStorage.getItem(AQ_KEY);
    const rawWt = localStorage.getItem(WT_KEY);

    if (!rawAq) {
      console.log("🧹 未找到鱼缸数据，跳过预清场");
      return true;
    }

    const aqIds = new Set<string>(
      (JSON.parse(rawAq).state?.aquariums || []).map((a: { id: string }) => a.id)
    );
    if (aqIds.size === 0) {
      console.log("🧹 鱼缸数据为空，清空所有缓存");
      ALL_KEYS.forEach((k) => localStorage.removeItem(k));
      return true;
    }

    let purged = false;

    if (rawWt) {
      const wtState = JSON.parse(rawWt).state || {};
      const waterChanges: Array<{ aquarium_id: string }> = wtState.waterChanges || [];
      const waterTests: Array<{ aquarium_id: string }> = wtState.waterTests || [];

      const orphanChanges = waterChanges.filter((w) => w.aquarium_id && !aqIds.has(w.aquarium_id));
      const orphanTests = waterTests.filter((w) => w.aquarium_id && !aqIds.has(w.aquarium_id));

      if (orphanChanges.length > 0 || orphanTests.length > 0) {
        console.warn("⚠️ 检测到孤立水质条目:", {
          换水记录: orphanChanges.map((w) => w.aquarium_id),
          水质检测: orphanTests.map((w) => w.aquarium_id),
          鱼缸列表: Array.from(aqIds),
        });
        console.warn("🧹 清空所有缓存桶，重建一致数据...");
        ALL_KEYS.forEach((k) => localStorage.removeItem(k));
        purged = true;
      }
    }

    const rawFd = localStorage.getItem(FD_KEY);
    if (!purged && rawFd) {
      const fdState = JSON.parse(rawFd).state || {};
      const plans: Array<{ aquarium_id: string }> = fdState.plans || [];
      const records: Array<{ aquarium_id: string }> = fdState.records || [];

      const orphanPlans = plans.filter((p) => p.aquarium_id && !aqIds.has(p.aquarium_id));
      const orphanRecords = records.filter((r) => r.aquarium_id && !aqIds.has(r.aquarium_id));

      if (orphanPlans.length > 0 || orphanRecords.length > 0) {
        console.warn("⚠️ 检测到孤立喂食条目:", {
          喂食计划: orphanPlans.map((p) => p.aquarium_id),
          喂食记录: orphanRecords.map((r) => r.aquarium_id),
          鱼缸列表: Array.from(aqIds),
        });
        console.warn("🧹 清空所有缓存桶，重建一致数据...");
        ALL_KEYS.forEach((k) => localStorage.removeItem(k));
        purged = true;
      }
    }

    if (!purged) {
      console.log("✅ 预清场校验通过：", {
        鱼缸数: aqIds.size,
        有喂食数据: !!rawFd,
        有水质数据: !!rawWt,
      });
    }

    return true;
  } catch (e) {
    console.error("❌ 预清场校验异常，重置所有缓存:", e);
    ALL_KEYS.forEach((k) => localStorage.removeItem(k));
    return true;
  }
}

(function boot() {
  validateAndPurge();

  const ids = SEED_DATA.aquariums.map((a) => a.id);
  console.log("🐠 SEED_DATA 鱼缸主键:", ids);
  console.log("✅ 四个 Store 共享同一份种子数据实例，主键已统一");

  import('./App').then(({ default: App }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
})();
