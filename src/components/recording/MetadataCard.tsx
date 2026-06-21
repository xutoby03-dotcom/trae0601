import {
  MapPin,
  Thermometer,
  Mic,
  Calendar,
  Tags,
  BarChart3,
  Lock,
  Unlock,
  StickyNote,
  Wind,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recording } from "@/types";
import {
  envColorMap,
  weatherInfoMap,
  micPatternInfoMap,
  licenseTypeLabelMap,
} from "@/lib/colors";
import { formatFileSize } from "@/utils/format";

interface Props {
  recording: Recording;
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 border bg-forest-800/50 border-forest-700/50 space-y-2",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  iconColor = "text-amber-400",
}: {
  icon: any;
  title: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn("w-3.5 h-3.5", iconColor)} strokeWidth={2} />
      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
        {title}
      </span>
    </div>
  );
}

export default function MetadataCard({ recording }: Props) {
  const envTags = recording.envTags ?? recording.environmentTags ?? [];
  const weather = weatherInfoMap[recording.weather];
  const micInfo = micPatternInfoMap[recording.polarPattern];
  const isLocked = recording.isLocked || recording.locked;
  const licenseInfo = recording.licenseInfo;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader icon={MapPin} title="坐标信息" />
        <div className="w-[120px] h-[80px] rounded-lg overflow-hidden border border-forest-700/60">
          <div
            className="w-full h-full relative"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(34, 197, 94, 0.3), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(6, 182, 212, 0.25), transparent 60%), linear-gradient(135deg, #1d352e 0%, #163d2d 50%, #0f1e19 100%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse" />
                <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400/40 animate-ping" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-0.5 text-[11px] font-mono text-slate-300 tabular-nums leading-tight">
          <div>
            N {recording.latitude?.toFixed(4)}°
          </div>
          <div>E {recording.longitude?.toFixed(4)}°</div>
          <div className="text-slate-500">海拔 {recording.altitude} m</div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Thermometer} title="环境条件" />
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl leading-none">{weather.emoji}</span>
          <span className="text-sm text-slate-200 font-medium">{weather.label}</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-orange-400" strokeWidth={2} />
            <span className="tabular-nums">{recording.temperature?.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3 h-3 text-sky-400" strokeWidth={2} />
            <span className="tabular-nums">湿度 {recording.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3 h-3 text-teal-400" strokeWidth={2} />
            <span className="tabular-nums">风速 {recording.windSpeed?.toFixed(1)} m/s</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Mic} title="录音设备" />
        <div className="space-y-1 text-[11px]">
          <div className="text-slate-200 font-medium">
            {recording.device ?? recording.recorderModel}
          </div>
          <div className="text-slate-500 truncate">{recording.microphoneModel}</div>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-forest-700/60 text-slate-300 text-[10px]">
              <span>{micInfo.icon}</span>
              <span>{micInfo.label}</span>
            </span>
            <span className="text-slate-500 font-mono tabular-nums">
              +{recording.gainDb?.toFixed(0)} dB
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Calendar} title="录制时间" />
        <div className="space-y-1 text-[11px]">
          <div className="text-slate-200 font-medium tabular-nums">{recording.recordedAt}</div>
          <div className="text-slate-500 tabular-nums">
            {recording.timezone ?? "Asia/Shanghai"}
          </div>
          <div className="text-slate-500 pt-0.5">
            采集地点：<span className="text-slate-300">{recording.locationName}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={Tags} title="环境标签" />
        <div className="flex flex-wrap gap-1">
          {envTags.length === 0 && (
            <span className="text-[11px] text-slate-500 italic">未标注标签</span>
          )}
          {envTags.map((t) => {
            const info = envColorMap[t];
            return (
              <span
                key={t}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                  info.bg,
                  info.text,
                  info.border
                )}
              >
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </span>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader icon={BarChart3} title="规格参数" />
        <div className="space-y-0.5 text-[11px] font-mono tabular-nums text-slate-400 leading-tight">
          <div>
            采样率：
            <span className="text-slate-200">
              {(recording.sampleRate / 1000).toFixed(0)} kHz
            </span>
          </div>
          <div>
            位深：<span className="text-slate-200">{recording.bitDepth} bit</span>
          </div>
          <div>
            声道：
            <span className="text-slate-200">
              {recording.channels === 2 ? "立体声" : "单声道"}
            </span>
          </div>
          <div>
            文件：<span className="text-slate-200">{formatFileSize(recording.fileSize)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={isLocked ? Lock : Unlock}
          title="授权状态"
          iconColor={isLocked ? "text-amber-400" : "text-moss-400"}
        />
        {isLocked && licenseInfo ? (
          <div className="space-y-1 text-[11px]">
            <div className="text-amber-300 font-semibold">{licenseInfo.projectName}</div>
            <div className="text-slate-500">
              {licenseTypeLabelMap[licenseInfo.licenseType] ?? licenseInfo.licenseType}
            </div>
            {licenseInfo.expiresAt && (
              <div className="text-slate-500 tabular-nums">
                有效期至 {licenseInfo.expiresAt}
              </div>
            )}
            {licenseInfo.notes && (
              <div className="text-slate-400 pt-0.5">{licenseInfo.notes}</div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-moss-400">
            <Unlock className="w-3 h-3" strokeWidth={2} />
            <span>空闲可授权</span>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader icon={StickyNote} title="备注说明" />
        {recording.notes || recording.description ? (
          <div className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-5">
            {recording.notes ?? recording.description}
          </div>
        ) : (
          <div className="text-[11px] text-slate-600 italic">暂无备注内容</div>
        )}
      </Card>
    </div>
  );
}
