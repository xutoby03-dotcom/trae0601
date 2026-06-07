import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { THEME_COLORS } from '@/lib/utils'
import type { Template } from '@/types'

interface Props {
  templates: Template[]
}

export default function TemplateCards({ templates }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {templates.map((t, i) => (
        <motion.button
          key={t.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/create/${t.id}`)}
          className="flex-shrink-0 rounded-xl px-4 py-3 text-left transition-shadow hover:shadow-lg"
          style={{
            background: `linear-gradient(145deg, ${THEME_COLORS.cream}F0, ${THEME_COLORS.paperTexture}F0)`,
            borderLeft: `3px solid ${t.defaultMoodColor}`,
            minWidth: 140,
          }}
        >
          <div className="mb-1 text-xl">{t.icon}</div>
          <div className="text-xs font-bold" style={{ color: THEME_COLORS.darkBrown }}>
            {t.name}
          </div>
          <div className="mt-0.5 text-[10px] text-[#8B7355]/60 line-clamp-2">
            {t.description}
          </div>
        </motion.button>
      ))}
    </div>
  )
}
