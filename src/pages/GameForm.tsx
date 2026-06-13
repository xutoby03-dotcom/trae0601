import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ImagePlus } from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, SectionTitle } from "@/components/UI";
import { ComponentIcon } from "@/components/ComponentIcon";
import type { BoxCondition, ComponentType } from "@/types";

const boxConditions: BoxCondition[] = [
  "全新",
  "轻微使用",
  "正常使用",
  "明显磨损",
  "损坏",
];

const componentTypes: ComponentType[] = [
  "卡牌",
  "骰子",
  "说明书",
  "计分板",
  "棋子",
  "标记物",
  "其他",
];

interface ComponentEntry {
  name: string;
  quantity: number;
  type: ComponentType;
}

export default function GameForm() {
  const navigate = useNavigate();
  const store = useBoardGameStore();

  const [name, setName] = useState("");
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [duration, setDuration] = useState(60);
  const [boxCondition, setBoxCondition] = useState<BoxCondition>("正常使用");
  const [coverImage, setCoverImage] = useState("");
  const [wantToPlay, setWantToPlay] = useState(false);
  const [components, setComponents] = useState<ComponentEntry[]>([
    { name: "", quantity: 1, type: "卡牌" },
  ]);

  const addComponentEntry = () => {
    setComponents([
      ...components,
      { name: "", quantity: 1, type: "其他" },
    ]);
  };

  const removeComponentEntry = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponentEntry = (
    index: number,
    field: keyof ComponentEntry,
    value: string | number
  ) => {
    setComponents(
      components.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const gameId = store.addGame({
      name: name.trim(),
      minPlayers,
      maxPlayers,
      duration,
      boxCondition,
      coverImage,
      wantToPlay,
    });

    components
      .filter((c) => c.name.trim())
      .forEach((c) => {
        store.addComponent({
          gameId,
          name: c.name.trim(),
          quantity: c.quantity,
          type: c.type,
        });
      });

    navigate(`/games/${gameId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-[#FAF3E0]/50 transition-colors hover:bg-[#3E2723]/40 hover:text-[#FAF3E0]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-2xl font-bold text-[#D4A84B]">
          新建游戏档案
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GameCard>
          <SectionTitle icon={<span>📋</span>}>基本信息</SectionTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                游戏名称 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：卡坦岛"
                className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] placeholder:text-[#FAF3E0]/20 focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                  最少人数
                </label>
                <input
                  type="number"
                  min={1}
                  value={minPlayers}
                  onChange={(e) => setMinPlayers(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                  最多人数
                </label>
                <input
                  type="number"
                  min={minPlayers}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                  时长(分钟)
                </label>
                <input
                  type="number"
                  min={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                盒况评级
              </label>
              <div className="flex flex-wrap gap-2">
                {boxConditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => setBoxCondition(condition)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      boxCondition === condition
                        ? "border-[#D4A84B]/50 bg-[#D4A84B]/15 text-[#D4A84B]"
                        : "border-[#3E2723]/50 bg-[#1e150d] text-[#FAF3E0]/40 hover:border-[#3E2723]"
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#FAF3E0]/60">想玩标记</label>
              <button
                type="button"
                onClick={() => setWantToPlay(!wantToPlay)}
                className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                  wantToPlay
                    ? "border-[#B5544A]/50 bg-[#B5544A]/15 text-[#B5544A]"
                    : "border-[#3E2723]/50 text-[#FAF3E0]/30"
                }`}
              >
                {wantToPlay ? "❤️ 想玩" : "标记想玩"}
              </button>
            </div>
          </div>
        </GameCard>

        <GameCard>
          <SectionTitle icon={<span>📸</span>}>封面照片</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-[#3E2723]/50 bg-[#1e150d]">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="封面预览"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-[#FAF3E0]/20">
                  <ImagePlus size={24} />
                  <span className="mt-1 text-[10px]">上传封面</span>
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-4 py-2 text-sm text-[#FAF3E0]/50 transition-colors hover:border-[#D4A84B]/30 hover:text-[#D4A84B]">
                选择图片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="ml-2 text-xs text-[#B5544A]/60 hover:text-[#B5544A]"
                >
                  移除
                </button>
              )}
            </div>
          </div>
        </GameCard>

        <GameCard>
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle icon={<span>🧩</span>}>配件清单</SectionTitle>
            <button
              type="button"
              onClick={addComponentEntry}
              className="flex items-center gap-1 rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-1.5 text-xs text-[#D4A84B] transition-colors hover:border-[#D4A84B]/30"
            >
              <Plus size={14} />
              添加配件
            </button>
          </div>
          <div className="space-y-3">
            {components.map((comp, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-[#3E2723]/30 bg-[#1e150d]/50 p-2.5"
              >
                <div className="flex-shrink-0">
                  <select
                    value={comp.type}
                    onChange={(e) =>
                      updateComponentEntry(
                        index,
                        "type",
                        e.target.value as ComponentType
                      )
                    }
                    className="rounded border border-[#3E2723]/50 bg-[#2a1f14] px-2 py-1.5 text-xs text-[#FAF3E0] focus:outline-none"
                  >
                    {componentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) =>
                      updateComponentEntry(index, "name", e.target.value)
                    }
                    placeholder="配件名称"
                    className="w-full rounded border border-[#3E2723]/30 bg-transparent px-2 py-1.5 text-sm text-[#FAF3E0] placeholder:text-[#FAF3E0]/20 focus:border-[#D4A84B]/30 focus:outline-none"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min={1}
                    value={comp.quantity}
                    onChange={(e) =>
                      updateComponentEntry(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded border border-[#3E2723]/30 bg-transparent px-2 py-1.5 text-sm text-[#FAF3E0] focus:border-[#D4A84B]/30 focus:outline-none"
                  />
                </div>
                <ComponentIcon type={comp.type} />
                {components.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeComponentEntry(index)}
                    className="flex-shrink-0 rounded p-1 text-[#FAF3E0]/20 transition-colors hover:text-[#B5544A]"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </GameCard>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-[#3E2723]/50 px-6 py-2.5 text-sm text-[#FAF3E0]/50 transition-colors hover:border-[#3E2723] hover:text-[#FAF3E0]"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-[#D4A84B] to-[#b8862d] px-6 py-2.5 text-sm font-medium text-[#1a1209] shadow-lg shadow-[#D4A84B]/20 transition-all hover:shadow-xl hover:shadow-[#D4A84B]/30 active:translate-y-0.5"
          >
            创建档案
          </button>
        </div>
      </form>
    </div>
  );
}
