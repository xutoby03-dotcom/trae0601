// @ts-nocheck
import type {
  Recording,
  Project,
  Annotation,
  WeatherCondition,
  EnvironmentTag,
  MicPolarPattern,
  DistanceSense,
  AnnotationType,
  LicenseType,
  LicenseInfo,
  LicenseEvent,
  ProjectLicense,
} from "@/types";
import { generateWaveform } from "@/utils/waveform";

const recorderModels = [
  "Sony PCM-D100",
  "Zoom F6",
  "Tascam DR-44WL",
  "Sound Devices MixPre-6 II",
  "Sound Devices MixPre-10T",
  "Zoom F8n Pro",
  "Sennheiser MKH 8040",
];

const micModels: Record<MicPolarPattern, string[]> = {
  cardioid: ["Sennheiser MKH 416", "Shure SM81", "AKG C414 B-ULS"],
  omnidirectional: ["Sennheiser MKH 8020", "DPA 4006", "Schoeps MK2"],
  figure8: ["Royer R-121", "AKG C414 B-ULS", "Shure SM7B"],
  shotgun: ["Sennheiser MKH 8060", "Rode NTG3", "Sennheiser MKH 416"],
  xy: ["Sennheiser MKH 30/40 MS", "Shure VP88", "Schoeps CMC6/MK4 XY"],
};

const weathers: WeatherCondition[] = [
  "sunny",
  "cloudy",
  "rainy",
  "foggy",
  "windy",
  "snowy",
  "stormy",
];

const allEnvs: EnvironmentTag[] = [
  "forest",
  "mountain",
  "ocean",
  "river",
  "city",
  "indoor",
  "desert",
  "wetland",
  "village",
  "cave",
];

const polarPatterns: MicPolarPattern[] = [
  "cardioid",
  "omnidirectional",
  "figure8",
  "shotgun",
  "xy",
];

const distances: DistanceSense[] = ["close", "medium", "far", "distant"];

const annotationTypes: AnnotationType[] = [
  "loop",
  "wind_noise",
  "traffic",
  "voice",
  "needs_editing",
];

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}
function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rand() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}
function randomDate(rand: () => number): string {
  const start = new Date(2024, 2, 1).getTime();
  const end = new Date(2025, 4, 31).getTime();
  const d = new Date(start + rand() * (end - start));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(Math.floor(rand() * 24)).padStart(2, "0");
  const mm = String(Math.floor(rand() * 60)).padStart(2, "0");
  const ss = String(Math.floor(rand() * 60)).padStart(2, "0");
  return `${year}-${month}-${day}T${hh}:${mm}:${ss}+08:00`;
}
function fileNameFromDate(iso: string): string {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return "20240101_000000.wav";
  return `${m[1]}${m[2]}${m[3]}_${m[4]}${m[5]}${m[6]}.wav`;
}
function shortDate(iso: string): string {
  return iso.slice(0, 10);
}
function generateAnnotations(duration: number, rand: () => number): Annotation[] {
  const count = 2 + Math.floor(rand() * 4);
  const result: Annotation[] = [];
  for (let i = 0; i < count; i++) {
    const start = rand() * Math.max(1, duration - 10);
    const end = Math.min(duration, start + 2 + rand() * 8);
    const type = pick(annotationTypes, rand);
    result.push({
      id: `ann-${Date.now()}-${i}-${Math.floor(rand() * 100000)}`,
      type,
      startTime: Number(start.toFixed(2)),
      endTime: Number(end.toFixed(2)),
      note: rand() > 0.5 ? `标注 #${i + 1}` : undefined,
      content:
        type === "loop"
          ? "适合无缝循环的段落"
          : type === "wind_noise"
          ? "存在风噪，需要处理"
          : type === "traffic"
          ? "远处交通噪声"
          : type === "voice"
          ? "偶发人声"
          : "需要编辑处理",
      createdAt: shortDate(randomDate(rand)),
    });
  }
  return result;
}

interface Loc {
  title: string;
  locationName: string;
  latitude: number;
  longitude: number;
  altitude: number;
  tags: EnvironmentTag[];
  description: string;
  notes?: string;
}

const locations: Loc[] = [
  { title: "云南-香格里拉-纳帕海湿地清晨", locationName: "云南香格里拉纳帕海", latitude: 27.8361, longitude: 99.6285, altitude: 3266, tags: ["wetland", "mountain", "forest"], description: "高原湿地清晨，黑颈鹤鸣叫伴随水草轻摇声。", notes: "录制于日出时分，微风。" },
  { title: "四川-稻城亚丁-仙乃日雪山", locationName: "四川稻城亚丁", latitude: 28.4489, longitude: 100.3356, altitude: 4600, tags: ["mountain", "forest"], description: "仙乃日雪峰下冰川融水声，远处山风呼啸。" },
  { title: "西藏-纳木错-湖畔黄昏", locationName: "西藏纳木错", latitude: 30.7128, longitude: 90.5718, altitude: 4718, tags: ["mountain", "wetland"], description: "圣湖岸边波浪拍岸，风经文幡的呼呼声。" },
  { title: "广西-漓江-竹筏漂流声", locationName: "广西阳朔漓江", latitude: 24.7815, longitude: 110.4984, altitude: 120, tags: ["river", "mountain", "village"], description: "竹篙破水、鸬鹚扑翅，喀斯特峰林间的江声。" },
  { title: "福建-霞浦-滩涂日出潮声", locationName: "福建霞浦", latitude: 26.8861, longitude: 119.9994, altitude: 5, tags: ["ocean", "wetland"], description: "东海滩涂涨潮，紫菜架在海风中的轻响。" },
  { title: "内蒙古-呼伦贝尔-草原深处", locationName: "内蒙古呼伦贝尔", latitude: 49.2024, longitude: 119.7518, altitude: 680, tags: ["wetland", "village"], description: "草原腹地的风声、蒙古包的牛铃声、远处马嘶。" },
  { title: "安徽-黄山-迎客松云海", locationName: "安徽黄山", latitude: 30.1333, longitude: 118.1667, altitude: 1864, tags: ["mountain", "forest"], description: "云海翻涌过山脊，松涛阵阵如天籁。" },
  { title: "浙江-莫干山-竹林听雨", locationName: "浙江湖州莫干山", latitude: 30.6078, longitude: 119.8889, altitude: 700, tags: ["forest", "mountain", "wetland"], description: "连绵竹海细雨，叶尖滴水声此起彼伏。" },
  { title: "北京-香山-秋林红叶声", locationName: "北京香山公园", latitude: 39.9925, longitude: 116.1883, altitude: 575, tags: ["forest", "mountain"], description: "深秋红叶林，松鼠跳跃、落叶纷飞的细碎声响。" },
  { title: "上海-外滩-江滩夜景声", locationName: "上海外滩", latitude: 31.2397, longitude: 121.4909, altitude: 8, tags: ["city", "river"], description: "黄浦江边的车流、轮船汽笛、观光客低语交织。" },
  { title: "青岛-八大关-海浪礁石", locationName: "山东青岛", latitude: 36.0526, longitude: 120.3709, altitude: 15, tags: ["ocean", "city"], description: "德式老别墅旁，海浪拍击礁石的澎湃声。" },
  { title: "张家界-金鞭溪-峡谷溪流", locationName: "湖南张家界", latitude: 29.3456, longitude: 110.4378, altitude: 580, tags: ["forest", "river", "mountain"], description: "石英砂岩峡谷间的清澈溪流，猕猴偶尔啼叫。" },
  { title: "敦煌-鸣沙山-沙漠风声", locationName: "甘肃敦煌鸣沙山", latitude: 40.0806, longitude: 94.6714, altitude: 1150, tags: ["desert", "mountain"], description: "沙丘脊线上的风鸣，罕见的'鸣沙'现象。" },
  { title: "贵州-荔波-喀斯特森林", locationName: "贵州荔波小七孔", latitude: 25.4415, longitude: 107.8817, altitude: 720, tags: ["forest", "wetland", "cave"], description: "喀斯特岩溶地貌的原始森林，瀑布在远处轰鸣。" },
  { title: "台湾-花莲-太鲁阁海岸", locationName: "台湾花莲太鲁阁", latitude: 24.1881, longitude: 121.6268, altitude: 200, tags: ["ocean", "mountain", "forest"], description: "太平洋海浪冲击大理石峡谷，震撼的混响效果。" },
  { title: "长白山-天池-风雪火山口", locationName: "吉林长白山天池", latitude: 42.0178, longitude: 128.0759, altitude: 2189, tags: ["mountain", "wetland"], description: "火山口湖边缘的暴风雪，零下30度的极寒环境声。" },
  { title: "重庆-武隆-天生三桥天坑", locationName: "重庆武隆天坑", latitude: 29.2514, longitude: 107.7984, altitude: 520, tags: ["cave", "mountain", "forest"], description: "世界最大天坑群的回音，峡谷底部溪流绕石声。" },
  { title: "新疆-喀纳斯-湖光秋色", locationName: "新疆阿勒泰喀纳斯", latitude: 48.6833, longitude: 87.0167, altitude: 1370, tags: ["forest", "mountain", "wetland"], description: "图瓦人木屋旁的金色桦林，湖水轻拍岸石。" },
  { title: "青海-茶卡盐湖-镜面星空", locationName: "青海茶卡盐湖", latitude: 36.7126, longitude: 99.0828, altitude: 3059, tags: ["desert", "wetland", "mountain"], description: "盐壳结晶的细碎爆裂声，深夜极静能听到自己心跳。" },
  { title: "海南-五指山-热带雨林", locationName: "海南五指山", latitude: 18.8934, longitude: 109.5064, altitude: 850, tags: ["forest", "wetland"], description: "北纬18度的热带雨林，昆虫大合唱震耳欲聋。" },
  { title: "黑龙江-雪乡-林海雪原", locationName: "黑龙江海林雪乡", latitude: 44.3333, longitude: 128.1534, altitude: 1200, tags: ["forest", "mountain", "village"], description: "积雪压弯的红松林，踩雪咯吱声，柴火噼啪。" },
  { title: "河北-坝上-乌兰布统草原", locationName: "河北承德坝上", latitude: 42.3833, longitude: 117.1833, altitude: 1480, tags: ["wetland", "village"], description: "金秋白桦林，马群奔腾四蹄扬尘的浩荡声。" },
  { title: "江西-婺源-篁岭晒秋村落", locationName: "江西上饶婺源", latitude: 29.2532, longitude: 117.8586, altitude: 320, tags: ["village", "forest", "mountain"], description: "徽派古村晨雾，村妇捣衣、鸡鸣犬吠的日常声音。" },
  { title: "湖北-神农架-原始森林", locationName: "湖北神农架", latitude: 31.7475, longitude: 110.6841, altitude: 1700, tags: ["forest", "mountain", "cave"], description: "华中屋脊原始冷杉林，金丝猴在高处嬉戏。" },
  { title: "甘肃-鸣沙山月牙泉-沙鸣", locationName: "甘肃敦煌月牙泉", latitude: 40.0908, longitude: 94.6644, altitude: 1158, tags: ["desert", "wetland"], description: "沙漠中的绿洲，月牙泉边的芦苇丛沙沙作响。" },
];

export function generateRecordings(): Recording[] {
  const result: Recording[] = [];
  let seed = 42;
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const rand = seededRand(seed++);
    const recordedAt = randomDate(rand);
    const polar: MicPolarPattern = pick(polarPatterns, rand);
    const duration = Number((30 + rand() * 300).toFixed(1));
    const fileSize = Number((duration * 0.015 + rand() * 5).toFixed(2));
    const ambience = 3 + Math.floor(rand() * 8);
    const peakDbfs = Number((-12 + rand() * 11).toFixed(1));
    const drange = Number((40 + rand() * 30).toFixed(1));
    const rms = Number((peakDbfs - 6 - rand() * 8).toFixed(1));
    const temperature = Number((-10 + rand() * 40).toFixed(1));
    const humidity = Math.floor(20 + rand() * 75);
    const windSpeed = Number((rand() * 45).toFixed(1));
    const weather: WeatherCondition = pick(weathers, rand);
    const tags = loc.tags.length > 0 ? loc.tags : pickN(allEnvs, 1 + Math.floor(rand() * 3), rand);
    const envTags = tags.length > 0 ? tags : ["forest"];
    const annotations = generateAnnotations(duration, rand);
    const hasIssues = annotations.some(
      (a) => a.type === "wind_noise" || a.type === "traffic" || a.type === "needs_editing"
    );
    const waveformSeed = seed++;
    const waveform = generateWaveform(duration, waveformSeed);
    const lat = Number((loc.latitude + (rand() - 0.5) * 0.05).toFixed(5));
    const lng = Number((loc.longitude + (rand() - 0.5) * 0.05).toFixed(5));
    result.push({
      id: `rec-${String(i + 1).padStart(4, "0")}`,
      fileName: fileNameFromDate(recordedAt),
      title: loc.title,
      duration,
      sampleRate: rand() > 0.5 ? 192000 : 96000,
      bitDepth: 24,
      channels: rand() > 0.5 ? 2 : 1,
      fileSize,
      latitude: lat,
      longitude: lng,
      altitude: loc.altitude + Math.floor((rand() - 0.5) * 50),
      locationName: loc.locationName,
      location: { lat, lng },
      recordedAt: shortDate(recordedAt),
      timezone: "Asia/Shanghai",
      weather,
      temperature,
      humidity,
      windSpeed,
      environmentTags: envTags,
      recorderModel: pick(recorderModels, rand),
      microphoneModel: pick(micModels[polar], rand),
      polarPattern: polar,
      gainDb: Number((10 + rand() * 30).toFixed(1)),
      sampleFormat: "WAV 24bit",
      ambienceScore: ambience,
      distanceSense: pick(distances, rand),
      peakDbfs,
      rmsDbfs: rms,
      dynamicRange: drange,
      hasIssues,
      waveformData: waveform,
      waveform: waveform,
      annotations,
      isLocked: false,
      lockedByProjectId: null,
      licenseInfo: null,
      notes: loc.notes,
      description: loc.description,
      format: "WAV",
      createdAt: shortDate(recordedAt),
      updatedAt: shortDate(recordedAt),
    });
  }
  return result;
}

interface PSet {
  id: string;
  name: string;
  client: string;
  description: string;
  gradient: string;
  recCount: number;
  status: "active" | "planning" | "completed";
  licenseType: LicenseType;
  permanent: boolean;
}

const projectPresets: PSet[] = [
  { id: "proj-001", name: "《山河之声》自然纪录片", client: "中央电视台纪录频道", description: "大型自然纪录片，展现中国多样地貌与自然之声。", gradient: "from-emerald-600 via-teal-700 to-forest-900", recCount: 6, status: "active", licenseType: "exclusive", permanent: false },
  { id: "proj-002", name: "《山海奇缘》游戏音效库", client: "山海互动娱乐", description: "开放世界RPG游戏环境音效库，覆盖多样场景。", gradient: "from-violet-600 via-indigo-700 to-blue-900", recCount: 5, status: "active", licenseType: "non_exclusive", permanent: true },
  { id: "proj-003", name: "「向野而行」品牌广告", client: "远景广告创意", description: "旅行品牌电视广告片，高端自然场景氛围音。", gradient: "from-amber-500 via-orange-600 to-rose-800", recCount: 4, status: "completed", licenseType: "non_exclusive", permanent: false },
  { id: "proj-004", name: "短片《山那边》", client: "青年导演扶持计划", description: "独立电影短片，文艺片风格，强调环境叙事。", gradient: "from-sky-500 via-blue-700 to-indigo-900", recCount: 5, status: "planning", licenseType: "exclusive", permanent: false },
  { id: "proj-005", name: "《夜之呼吸》播客系列", client: "喜马拉雅FM", description: "深度睡眠播客系列，精选自然白噪音素材。", gradient: "from-rose-500 via-pink-700 to-fuchsia-900", recCount: 5, status: "active", licenseType: "non_exclusive", permanent: true },
];

function buildTimeline(
  pid: string, pname: string, status: "active" | "planning" | "completed",
  lt: LicenseType, rand: () => number, startD: string, rids: string[]
): LicenseEvent[] {
  const events: LicenseEvent[] = [];
  events.push({
    id: `evt-${pid}-1`, projectId: pid, recordingId: rids[0],
    title: `${lt === "exclusive" ? "独家" : "非独家"}授权创建`,
    date: startD, description: `${pname} · 项目初始授权创建`,
    tone: "success", label: "授权创建", operator: "授权管理员", licenseType: lt,
  });
  if (status === "active" && rids.length > 1) {
    events.push({
      id: `evt-${pid}-2`, projectId: pid, recordingId: rids[1],
      title: "新增素材入库", date: shortDate(randomDate(rand)),
      description: `新增 ${rids.length - 1} 条素材，授权范围同步更新`,
      tone: "info", label: "内容更新", operator: "素材编辑",
    });
  }
  if (status === "completed") {
    events.push({
      id: `evt-${pid}-3`, projectId: pid,
      title: "项目结项", date: shortDate(randomDate(rand)),
      description: `完成所有 ${rids.length} 条素材采集归档`,
      tone: "success", label: "已结项", operator: "项目经理",
    });
  }
  return events;
}

export function generateProjects(recs: Recording[]): Project[] {
  const projects: Project[] = [];
  let seed = 1001;
  let recIdx = 0;
  for (const preset of projectPresets) {
    const rand = seededRand(seed++);
    const created = randomDate(rand);
    const pRecIds: string[] = [];
    const pRecRefs: Recording[] = [];
    for (let r = 0; r < preset.recCount && recIdx < recs.length; r++) {
      const src = recs[recIdx++];
      pRecIds.push(src.id);
      pRecRefs.push(src);
    }
    const startD = shortDate(created);
    const expiresAt = preset.permanent
      ? null
      : shortDate(
          new Date(new Date(created).getTime() + 365 * 24 * 3600 * 1000).toISOString()
        );
    const pLicense: ProjectLicense = {
      isLicensed: true, type: preset.licenseType, startedAt: startD,
      expiresAt, permanent: preset.permanent, note: preset.description,
    };
    const timeline = buildTimeline(
      preset.id, preset.name, preset.status,
      preset.licenseType, rand, startD, pRecIds
    );
    for (const rec of pRecRefs) {
      const info: LicenseInfo = {
        projectId: preset.id, projectName: preset.name, licenseType: preset.licenseType,
        licensedAt: startD, expiresAt: expiresAt ?? undefined,
        notes: preset.permanent ? "永久授权" : `授权至 ${expiresAt}`,
      };
      const idx = recs.findIndex((x) => x.id === rec.id);
      if (idx >= 0) {
        recs[idx] = { ...recs[idx], isLocked: true, lockedByProjectId: preset.id, licenseInfo: info };
      }
    }
    projects.push({
      id: preset.id, name: preset.name, client: preset.client, clientName: preset.client,
      description: preset.description, coverGradient: preset.gradient, coverImage: preset.gradient,
      recordingIds: pRecIds, status: preset.status, usedRecordingCount: pRecIds.length,
      targetRecordingCount: preset.recCount + 3 + Math.floor(rand() * 10),
      license: pLicense, licenseTimeline: timeline,
      createdAt: startD, updatedAt: shortDate(new Date().toISOString()),
    });
  }
  return projects;
}

export const recordings: Recording[] = generateRecordings();
export const projects: Project[] = generateProjects(recordings);
