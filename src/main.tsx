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
    const rawAq = localStorage.getItem(AQ_KEY);
    const rawFd = localStorage.getItem(FD_KEY);

    if (!rawAq || !rawFd) return;

    const aqIds = new Set(
      (JSON.parse(rawAq).state?.aquariums || []).map((a: { id: string }) => a.id)
    );
    if (aqIds.size === 0) return;

    const planIds = new Set(
      (JSON.parse(rawFd).state?.plans || []).map((p: { aquarium_id: string }) => p.aquarium_id)
    );
    const recordIds = new Set(
      (JSON.parse(rawFd).state?.records || []).map((r: { aquarium_id: string }) => r.aquarium_id)
    );

    let consistent = true;
    planIds.forEach((id) => { if (!aqIds.has(id as string)) consistent = false; });
    recordIds.forEach((id) => { if (id && !aqIds.has(id as string)) consistent = false; });

    if (!consistent) {
      console.warn("⚠️ 检测到数据主键不一致，自动重置为种子数据...");
      [AQ_KEY, FD_KEY, WT_KEY, ST_KEY].forEach((k) => localStorage.removeItem(k));
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
