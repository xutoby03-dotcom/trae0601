import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayerSelectorProps {
  layers: number
  value: number
  onChange: (layer: number) => void
}

export default function LayerSelector({ layers, value, onChange }: LayerSelectorProps) {
  const layerNumbers = Array.from({ length: layers }, (_, i) => layers - i)

  return (
    <div className="flex flex-col gap-2">
      {layerNumbers.map((layer) => (
        <button
          key={layer}
          onClick={() => onChange(layer)}
          className={cn(
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all',
            value === layer
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <span>第{layer}层</span>
          {value === layer && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  )
}
