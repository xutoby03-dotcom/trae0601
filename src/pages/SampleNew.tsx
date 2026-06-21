import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Camera, X, Thermometer, Droplets } from "lucide-react"
import { useStore } from "@/store/useStore"
import Navbar from "@/components/Navbar"
import { SUBSTRATE_OPTIONS, COLOR_OPTIONS } from "@/types"

export default function SampleNew() {
  const navigate = useNavigate()
  const { addSample } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [color, setColor] = useState("")
  const [substrate, setSubstrate] = useState("")
  const [thickness, setThickness] = useState(3)
  const [temperature, setTemperature] = useState(25)
  const [humidity, setHumidity] = useState(60)
  const [initialPhoto, setInitialPhoto] = useState("")

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (result) setInitialPhoto(result)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    if (!brand.trim() || !color || !substrate) return

    const id = addSample({
      brand: brand.trim(),
      model: model.trim(),
      color,
      substrate,
      thickness,
      temperature,
      humidity,
      initialPhoto,
    })

    navigate(`/sample/${id}`)
  }

  const isValid = brand.trim() && color && substrate

  return (
    <div className="min-h-screen bg-[#12122a]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-[#6b8f9e] transition-colors hover:text-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        <h1 className="mb-8 font-serif text-2xl font-bold text-[#fafafa]">
          新增胶样
        </h1>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-6">
            <h2 className="mb-5 font-serif text-base font-semibold text-[#fafafa]">
              基础信息
            </h2>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-[#a0a0b8]">
                    品牌名称 *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="如：道康宁"
                    className="w-full rounded-xl border border-white/[0.06] bg-[#16162a] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#555570] outline-none transition-colors focus:border-[#e8a838]/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-[#a0a0b8]">
                    型号
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="如：GP-895"
                    className="w-full rounded-xl border border-white/[0.06] bg-[#16162a] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#555570] outline-none transition-colors focus:border-[#e8a838]/40"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-[#a0a0b8]">
                    颜色 *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          color === c
                            ? "bg-[#e8a838]/20 text-[#e8a838] border border-[#e8a838]/40"
                            : "bg-white/5 text-[#a0a0b8] border border-transparent hover:bg-white/10"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-[#a0a0b8]">
                    基材类型 *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBSTRATE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSubstrate(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          substrate === s
                            ? "bg-[#e8a838]/20 text-[#e8a838] border border-[#e8a838]/40"
                            : "bg-white/5 text-[#a0a0b8] border border-transparent hover:bg-white/10"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#a0a0b8]">
                  打胶厚度：{thickness} mm
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={thickness}
                  onChange={(e) => setThickness(parseFloat(e.target.value))}
                  className="w-full accent-[#e8a838]"
                />
                <div className="mt-1 flex justify-between text-xs text-[#555570]">
                  <span>1mm</span>
                  <span>10mm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-6">
            <h2 className="mb-5 font-serif text-base font-semibold text-[#fafafa]">
              环境条件
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs text-[#a0a0b8]">
                  <Thermometer className="h-3.5 w-3.5" />
                  环境温度：{temperature}°C
                </label>
                <input
                  type="range"
                  min="-10"
                  max="50"
                  step="1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value))}
                  className="w-full accent-[#e8a838]"
                />
                <div className="mt-1 flex justify-between text-xs text-[#555570]">
                  <span>-10°C</span>
                  <span>50°C</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs text-[#a0a0b8]">
                  <Droplets className="h-3.5 w-3.5" />
                  环境湿度：{humidity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={humidity}
                  onChange={(e) => setHumidity(parseInt(e.target.value))}
                  className="w-full accent-[#e8a838]"
                />
                <div className="mt-1 flex justify-between text-xs text-[#555570]">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-6">
            <h2 className="mb-5 font-serif text-base font-semibold text-[#fafafa]">
              初始照片
            </h2>

            {initialPhoto ? (
              <div className="relative inline-block">
                <img
                  src={initialPhoto}
                  alt="初始照片"
                  className="h-40 rounded-xl object-cover"
                />
                <button
                  onClick={() => setInitialPhoto("")}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#3a3a55] bg-[#16162a]/50 text-[#6b8f9e] transition-all hover:border-[#e8a838]/40 hover:text-[#e8a838]"
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm">上传打胶当天照片</span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
              isValid
                ? "bg-[#e8a838] text-[#1a1a2e] hover:bg-[#d49530] hover:shadow-[0_4px_20px_rgba(232,168,56,0.3)]"
                : "bg-white/5 text-[#555570] cursor-not-allowed"
            }`}
          >
            保存并开始观察
          </button>
        </div>
      </main>
    </div>
  )
}
