import { divIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { type Recording as UIRecording } from "@/store/uiStore";
import MarkerPopup from "./MarkerPopup";
import "leaflet/dist/leaflet.css";

interface Props {
  recording: UIRecording;
  clusterCount?: number;
}

const tagColorMap: Record<string, string> = {
  雨林: "#059669",
  森林: "#10b981",
  山脉: "#6366f1",
  高原: "#8b5cf6",
  海岸: "#0ea5e9",
  海洋: "#0284c7",
  瀑布: "#06b6d4",
  河流: "#14b8a6",
  湿地: "#84cc16",
  乡村: "#a3e635",
  城市: "#64748b",
  沙漠: "#f59e0b",
};

function buildIconHtml(recording: UIRecording, clusterCount?: number): string {
  const primaryTag = recording.tags[0] ?? "森林";
  const dotColor = tagColorMap[primaryTag] ?? "#22c55e";
  const isLocked = recording.isLocked;
  const lockRing = isLocked ? "box-shadow: 0 0 0 3px #f59e0b, 0 0 12px rgba(245,158,11,0.5);" : "";
  const lockBadge = isLocked
    ? `<span style="position:absolute;top:-7px;right:-7px;width:16px;height:16px;border-radius:9999px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0f1e19;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4),0 0 0 2px #1a2e26;z-index:20;">🔒</span>`
    : "";
  const clusterBadge =
    clusterCount && clusterCount > 1
      ? `<span style="position:absolute;top:-9px;right:-9px;min-width:20px;height:20px;padding:0 6px;border-radius:9999px;background:linear-gradient(135deg,#fde68a,#f59e0b);color:#0f1e19;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4),0 0 0 2px #1a2e26;z-index:25;font-family:JetBrains Mono,monospace;">${clusterCount}</span>`
      : "";

  return `
    <div class="marker-wrap" style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;transform:translate(-16px,-16px);">
      <div class="sonar-ping" style="position:absolute;width:20px;height:20px;border-radius:9999px;background:${dotColor};opacity:0.25;"></div>
      <div style="position:absolute;width:14px;height:14px;border-radius:9999px;background:${dotColor};opacity:0.2;animation:sonar-ping 2.5s infinite 0.6s;"></div>
      <div class="marker-dot" style="position:relative;width:12px;height:12px;border-radius:9999px;background:radial-gradient(circle at 30% 30%,${dotColor}ee,${dotColor}aa);${lockRing}transition:all 0.25s cubic-bezier(0.4,0,0.2,1);z-index:10;border:1.5px solid rgba(255,255,255,0.85);"></div>
      ${lockBadge}
      ${clusterBadge}
      <style>
        .marker-wrap:hover .marker-dot { width:18px;height:18px;transform:scale(1.2); }
        .marker-wrap:hover .sonar-ping { animation-duration: 0.6s; }
        @keyframes sonar-ping {
          0% { transform:scale(1); opacity:0.35; }
          80%, 100% { transform:scale(3.2); opacity:0; }
        }
      </style>
    </div>
  `;
}

export default function MapMarker({ recording, clusterCount }: Props) {
  const lat = recording.latitude;
  const lng = recording.longitude;
  if (lat == null || lng == null) return null;

  const icon = divIcon({
    className: "custom-marker-icon",
    html: buildIconHtml(recording, clusterCount),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup
        closeButton={true}
        autoPan={true}
        maxWidth={320}
        minWidth={280}
        className="custom-leaflet-popup"
      >
        <MarkerPopup recording={recording} />
      </Popup>
    </Marker>
  );
}
