import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Thermometer, Droplets, Ruler, AlertCircle } from "lucide-react"
import { useStore } from "@/store/useStore"
import Navbar from "@/components/Navbar"
import Timeline from "@/components/Timeline"
import IndicatorPanel from "@/components/IndicatorPanel"
import PhotoUploader from "@/components/PhotoUploader"
import { getCompletedDays } from "@/utils/observation"
import type { ObservationDay, IndicatorLevel, AdhesionLevel } from "@/types"
import { OBSERVATION_DAYS } from "@/types"

export default function SampleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { samples, observations, addObservation, getObservationsBySample } =
    useStore()

  const sample = samples.find((s) => s.id === id)
  const sampleObservations = id ? getObservationsBySample(id) : []
  const completedDays = getCompletedDays(sampleObservations)

  const firstIncompleteDay = OBSERVATION_DAYS.find(
    (d) => !completedDays.includes(d)
  )
  const [activeDay, setActiveDay] = useState<ObservationDay>(
    firstIncompleteDay ?? 7
  )

  const existingObservation = sampleObservations.find(
    (o) => o.day === activeDay
  )

  const [photos, setPhotos] = useState<string[]>([])
  const [shrinkage, setShrinkage] = useState<IndicatorLevel>("none")
  const [bubbles, setBubbles] = useState<IndicatorLevel>("none")
  const [yellowing, setYellowing] = useState<IndicatorLevel>("none")
  const [moldSpots, setMoldSpots] = useState<IndicatorLevel>("none")
  const [adhesion, setAdhesion] = useState<AdhesionLevel>("excellent")
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (existingObservation) {
      setPhotos(existingObservation.photos)
      setShrinkage(existingObservation.shrinkage)
      setBubbles(existingObservation.bubbles)
      setYellowing(existingObservation.yellowing)
      setMoldSpots(existingObservation.moldSpots)
      setAdhesion(existingObservation.adhesion)
      setNotes(existingObservation.notes)
    } else {
      setPhotos([])
      setShrinkage("none")
      setBubbles("none")
      setYellowing("none")
      setMoldSpots("none")
      setAdhesion("excellent")
      setNotes("")
    }
    setSaved(false)
  }, [activeDay, existingObservation])

  function handleIndicatorChange(field: string, value: string) {
    switch (field) {
      case "shrinkage":
        setShrinkage(value as IndicatorLevel)
        break
      case "bubbles":
        setBubbles(value as IndicatorLevel)
        break
      case "yellowing":
        setYellowing(value as IndicatorLevel)
        break
      case "moldSpots":
        setMoldSpots(value as IndicatorLevel)
        break
      case "adhesion":
        setAdhesion(value as AdhesionLevel)
        break
    }
  }

  const canSave = photos.length > 0

  function handleSave() {
    if (!id || !canSave) return
    addObservation(id, activeDay, {
      photos,
      shrinkage,
      bubbles,
      yellowing,
      moldSpots,
      adhesion,
      notes,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!sample) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#12122a]">
        <p className="text-[#6b8f9e]">样品不存在</p>
      </div>
    )
  }

  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(sample.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-[#12122a]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm text-[#6b8f9e] transition-colors hover:text-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回观察板
        </button>

        <div className="mb-8 flex items-start gap-5">
          {sample.initialPhoto && (
            <img
              src={sample.initialPhoto}
              alt={sample.brand}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
          )}
          {!sample.initialPhoto && (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#22223a]">
              <span className="text-2xl">🧪</span>
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#fafafa]">
              {sample.brand}
            </h1>
            {sample.model && (
              <p className="text-sm text-[#6b8f9e]">{sample.model}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#a0a0b8]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#e8a838]" />
                {sample.color}
              </span>
              <span>{sample.substrate}</span>
              <span>已观察 {daysSinceCreation} 天</span>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-[#22223a]/80 px-3 py-1.5 text-xs text-[#a0a0b8]">
            <Thermometer className="h-3.5 w-3.5 text-[#e8a838]" />
            {sample.temperature}°C
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#22223a]/80 px-3 py-1.5 text-xs text-[#a0a0b8]">
            <Droplets className="h-3.5 w-3.5 text-[#6b8f9e]" />
            {sample.humidity}%
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#22223a]/80 px-3 py-1.5 text-xs text-[#a0a0b8]">
            <Ruler className="h-3.5 w-3.5 text-[#a0a0b8]" />
            {sample.thickness}mm
          </div>
        </div>

        <div className="mb-12">
          <Timeline
            completedDays={completedDays}
            activeDay={activeDay}
            onDaySelect={setActiveDay}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-6">
            <PhotoUploader photos={photos} onChange={setPhotos} />
          </div>

          <IndicatorPanel
            shrinkage={shrinkage}
            bubbles={bubbles}
            yellowing={yellowing}
            moldSpots={moldSpots}
            adhesion={adhesion}
            onChange={handleIndicatorChange}
          />

          <div className="rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-6">
            <h3 className="mb-3 font-serif text-sm font-semibold text-[#fafafa]">
              观察备注
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录你观察到的细节..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-[#16162a] px-4 py-3 text-sm text-[#fafafa] placeholder-[#555570] outline-none transition-colors focus:border-[#e8a838]/40"
            />
          </div>

          {!canSave && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>请至少上传 1 张观察照片后再保存</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
              saved
                ? "bg-emerald-500/20 text-emerald-400"
                : canSave
                  ? "bg-[#e8a838] text-[#1a1a2e] hover:bg-[#d49530] hover:shadow-[0_4px_20px_rgba(232,168,56,0.3)]"
                  : "bg-white/5 text-[#555570] cursor-not-allowed"
            }`}
          >
            <Save className="h-4 w-4" />
            {saved ? "已保存" : "保存观察记录"}
          </button>
        </div>
      </main>
    </div>
  )
}
