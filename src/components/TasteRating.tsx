interface TasteRatingProps {
  value: number
  onChange: (value: number) => void
}

export default function TasteRating({ value, onChange }: TasteRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`text-2xl transition-all duration-200 ${
            rating <= value
              ? 'scale-110 opacity-100'
              : 'scale-90 opacity-30 grayscale'
          } hover:scale-125 active:scale-95`}
        >
          🍅
        </button>
      ))}
      <span className="text-sm font-serif text-earth-500 ml-2">
        {value > 0 ? ['', '一般', '还行', '好吃', '很棒', '绝了！'][value] : '点击评分'}
      </span>
    </div>
  )
}
