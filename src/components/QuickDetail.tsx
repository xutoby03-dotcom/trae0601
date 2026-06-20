import type { Passenger } from "@/types"
import { X, Phone, Car, Copy, Check } from "lucide-react"
import { useState } from "react"

interface QuickDetailProps {
  passenger: Passenger
  onClose: () => void
}

export default function QuickDetail({ passenger, onClose }: QuickDetailProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative bg-[#0F2035] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fadeInScale_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-[#8B9CB6] text-sm mb-1">乘客信息</div>
          <h2 className="text-white text-3xl font-bold">{passenger.name}</h2>
          <div className="text-[#8B9CB6] text-base mt-1">
            {passenger.flightNumber} · {passenger.arrivalGate}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#FF6B2B]/20 text-[#FF6B2B]">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[#8B9CB6] text-sm">联系电话</span>
            </div>
            <div className="flex items-center justify-between">
              {passenger.phone ? (
                <a
                  href={`tel:${passenger.phone}`}
                  className="text-white text-2xl font-semibold hover:text-[#FF6B2B] transition-colors"
                >
                  {passenger.phone}
                </a>
              ) : (
                <span className="text-white/40 text-2xl font-semibold">暂无</span>
              )}
              {passenger.phone && (
                <button
                  onClick={() => copyToClipboard(passenger.phone, "phone")}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {copied === "phone" ? (
                    <Check className="w-4 h-4 text-[#00C48C]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#00C48C]/20 text-[#00C48C]">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-[#8B9CB6] text-sm">停车位置</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xl font-semibold ${passenger.parkingNote ? "text-white" : "text-white/40"}`}>
                {passenger.parkingNote || "暂无"}
              </span>
              {passenger.parkingNote && (
                <button
                  onClick={() => copyToClipboard(passenger.parkingNote, "parking")}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {copied === "parking" ? (
                    <Check className="w-4 h-4 text-[#00C48C]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {passenger.phone && (
          <a
            href={`tel:${passenger.phone}`}
            className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-[#00C48C] text-white rounded-2xl text-lg font-semibold hover:bg-[#00a878] transition-colors"
          >
            <Phone className="w-5 h-5" />
            拨打电话
          </a>
        )}
      </div>
    </div>
  )
}
