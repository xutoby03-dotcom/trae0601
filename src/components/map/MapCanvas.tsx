import { useMemo } from "react";
import { MapContainer, TileLayer, ScaleControl, ZoomControl } from "react-leaflet";
import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type Recording as UIRecording } from "@/store/uiStore";
import MapMarker from "./MapMarker";
import "leaflet/dist/leaflet.css";

const CLUSTER_THRESHOLD = 6;

interface ClusterItem {
  center: { lat: number; lng: number };
  items: UIRecording[];
}

function clusterRecordings(list: UIRecording[], zoom: number): ClusterItem[] {
  const threshold = Math.max(0.5, 20 / Math.pow(2, zoom));
  const sorted = [...list].sort((a, b) => a.latitude - b.latitude);
  const clusters: ClusterItem[] = [];
  for (const r of sorted) {
    const lat = r.latitude;
    const lng = r.longitude;
    let added = false;
    for (const c of clusters) {
      const dLat = c.center.lat - lat;
      const dLng = c.center.lng - lng;
      if (Math.abs(dLat) < threshold && Math.abs(dLng) < threshold && c.items.length < CLUSTER_THRESHOLD) {
        c.items.push(r);
        const n = c.items.length;
        c.center.lat = (c.center.lat * (n - 1) + lat) / n;
        c.center.lng = (c.center.lng * (n - 1) + lng) / n;
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push({ center: { lat, lng }, items: [r] });
    }
  }
  return clusters;
}

export default function MapCanvas() {
  const recordings = useUIStore((s) => s.recordings);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const filtered = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return recordings;
    const q = searchQuery.toLowerCase();
    return recordings.filter(
      (r) =>
        r.locationName.toLowerCase().includes(q) ||
        r.fileName.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [recordings, searchQuery]);

  const clusters = useMemo(() => clusterRecordings(filtered, 5), [filtered]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={[32.0, 105.0]}
        zoom={5}
        minZoom={3}
        maxZoom={16}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={["a", "b", "c"]}
          maxNativeZoom={19}
        />
        <ScaleControl imperial={false} metric={true} position="bottomleft" />
        <ZoomControl position="bottomright" zoomInTitle="放大" zoomOutTitle="缩小" />

        {clusters.map((c, idx) => {
          const primary = c.items[0];
          return (
            <MapMarker
              key={idx}
              recording={primary}
              clusterCount={c.items.length > 1 ? c.items.length : undefined}
            />
          );
        })}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="rounded-xl p-3 bg-forest-900/85 backdrop-blur-lg border border-forest-700/40 max-w-xs pointer-events-auto shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Navigation className="w-4 h-4 text-amber-400" strokeWidth={2} />
            <span className="text-sm font-semibold text-slate-100 font-display">
              声景采集点分布
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            显示 <span className="text-moss-400 font-mono font-medium">{filtered.length}</span> /
            <span className="font-mono"> {recordings.length}</span> 个采样点
            {searchQuery && searchQuery.trim() && (
              <>
                {" · "}
                <span className="text-amber-400">搜索: "{searchQuery.trim()}"</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[400]">
        <div className="rounded-xl p-3 bg-forest-900/85 backdrop-blur-lg border border-forest-700/40 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            图例
          </div>
          <div className="space-y-2">
            <LegendItem color="#4ade80" label="未锁定素材" />
            <LegendItem color="#f59e0b" label="已锁定素材" />
            <LegendItem color="#fbbf24" label="多段聚合" countBadge />
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-4 z-[400]">
        <div className="rounded-xl px-3 py-2 bg-forest-900/70 backdrop-blur-md border border-forest-700/30 text-[11px] text-slate-400 shadow-lg max-w-[220px]">
          💡 提示：点击发光点位查看声景详情，拖拽缩放地图浏览全国采样点
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  countBadge = false,
}: {
  color: string;
  label: string;
  countBadge?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full opacity-25"
          style={{ backgroundColor: color, animation: "sonar-ping 2s infinite" }}
        />
        <div
          className={cn(
            "relative w-2.5 h-2.5 rounded-full border border-forest-950",
            countBadge && "ring-1 ring-amber-400/60"
          )}
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] text-slate-300">{label}</span>
    </div>
  );
}
