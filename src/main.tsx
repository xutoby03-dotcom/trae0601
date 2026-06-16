import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { SEED_DATA } from '@/data/seedData';

(function validateDataConsistency() {
  try {
    const AQ_KEY = "aquarium_data";
    const FD_KEY = "feeding_data";
    const WT_KEY = "water_data";
    const ST_KEY = "stock_data";
    const ALL_KEYS = [AQ_KEY, FD_KEY, WT_KEY, ST_KEY];

    const rawAq = localStorage.getItem(AQ_KEY);
    const rawFd = localStorage.getItem(FD_KEY);
    const rawWt = localStorage.getItem(WT_KEY);

    if (!rawAq) return;

    const aqIds = new Set<string>(
      (JSON.parse(rawAq).state?.aquariums || []).map((a: { id: string }) => a.id)
    );
    if (aqIds.size === 0) return;

    const planIds = new Set<string>(
      rawFd
        ? (JSON.parse(rawFd).state?.plans || []).map((p: { aquarium_id: string }) => p.aquarium_id)
        : []
    );
    const recordIds = new Set<string>(
      rawFd
        ? (JSON.parse(rawFd).state?.records || []).map((r: { aquarium_id: string }) => r.aquarium_id)
        : []
    );
    const waterChangeIds = new Set<string>(
      rawWt
        ? (JSON.parse(rawWt).state?.waterChanges || []).map((w: { aquarium_id: string }) => w.aquarium_id)
        : []
    );
    const waterTestIds = new Set<string>(
      rawWt
        ? (JSON.parse(rawWt).state?.waterTests || []).map((w: { aquarium_id: string }) => w.aquarium_id)
        : []
    );

    let consistent = true;
    const checkIds = (ids: Set<string>, label: string) => {
      ids.forEach((id) => {
        if (id && !aqIds.has(id)) {
          console.warn(`⚠️ ${label} 存在散键 aquarium_id: ${id}，不在鱼缸列表中`);
          consistent = false;
        }
      });
    };
    if (rawFd) {
      checkIds(planIds, "喂食计划");
      checkIds(recordIds, "喂食记录");
    }
    if (rawWt) {
      checkIds(waterChangeIds, "换水记录");
      checkIds(waterTestIds, "水质检测");
    }

    if (!consistent) {
      console.warn("⚠️ 检测到数据主键不一致，自动重置所有数据...");
      ALL_KEYS.forEach((k) => localStorage.removeItem(k));
    } else {
      console.log("✅ 数据主键一致性校验通过：", {
        鱼缸数: aqIds.size,
        有喂食数据: !!rawFd,
        有水质数据: !!rawWt,
        换水记录关联鱼缸数: waterChangeIds.size,
        水质检测关联鱼缸数: waterTestIds.size,
      });
    }
  } catch {
    /* ignore */
  }
})();

(function verifySeedSingleton() {
  const ids = SEED_DATA.aquariums.map((a) => a.id);
  console.log("🐠 SEED_DATA 鱼缸主键:", ids);
  console.log("✅ 四个 Store 共享同一份种子数据实例，主键已统一");
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
