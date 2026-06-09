import { useEffect, useState, useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Recycle, CheckCircle, Clock, Star, Leaf, Droplets, CloudOff, Shirt } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { ClothingType, Project } from '@/types'

const CLOTHING_TYPE_COLORS: Record<ClothingType, string> = {
  '衬衫': 'bg-terra-400',
  '牛仔裤': 'bg-sage-500',
  '毛衣': 'bg-terra-300',
  'T恤': 'bg-sage-400',
  '裙子': 'bg-terra-500',
  '外套': 'bg-sage-600',
}

const CLOTHING_TYPE_TEXT_COLORS: Record<ClothingType, string> = {
  '衬衫': 'text-terra-600',
  '牛仔裤': 'text-sage-600',
  '毛衣': 'text-terra-500',
  'T恤': 'text-sage-500',
  '裙子': 'text-terra-700',
  '外套': 'text-sage-700',
}

const ALL_TYPES: ClothingType[] = ['衬衫', '牛仔裤', '毛衣', 'T恤', '裙子', '外套']

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const spring = useSpring(0, { duration: 1200, bounce: 0 })
  const display = useTransform(spring, (latest) => Math.round(latest))

  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v))
    return unsubscribe
  }, [display])

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [spring, value, delay])

  return <span>{displayValue}</span>
}

function StatCard({
  icon: Icon,
  value,
  label,
  colorClass,
  bgClass,
  iconBgClass,
  delay = 0,
}: {
  icon: React.ElementType
  value: number
  label: string
  colorClass: string
  bgClass: string
  iconBgClass: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 shadow-card',
        bgClass
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 bg-current" />
      <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full opacity-5 bg-current" />
      <div className={cn('mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full', iconBgClass)}>
        <Icon className={cn('h-6 w-6', colorClass)} />
      </div>
      <div className={cn('font-display text-5xl font-bold', colorClass)}>
        <AnimatedNumber value={value} delay={delay + 200} />
      </div>
      <div className={cn('mt-2 font-body text-sm', colorClass, 'opacity-70')}>
        {label}
      </div>
    </motion.div>
  )
}

function TypeBarChart({ typeCount, bestType }: { typeCount: Record<ClothingType, number>; bestType: ClothingType | null }) {
  const maxCount = Math.max(...ALL_TYPES.map((t) => typeCount[t] || 0), 1)

  return (
    <div className="space-y-3">
      {ALL_TYPES.map((type, index) => {
        const count = typeCount[type] || 0
        const widthPercent = (count / maxCount) * 100
        const isBest = bestType === type

        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="flex items-center gap-3"
          >
            <div className={cn('w-14 font-body text-sm text-right shrink-0', CLOTHING_TYPE_TEXT_COLORS[type])}>
              {type}
            </div>
            <div className="relative flex-1 h-8 rounded-full bg-cream-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.8, delay: 0.2 + 0.1 * index, ease: 'easeOut' }}
                className={cn('h-full rounded-full flex items-center', count > 0 ? CLOTHING_TYPE_COLORS[type] : 'bg-transparent', count > 0 ? 'opacity-80' : '')}
              >
                {count > 0 && widthPercent > 15 && (
                  <span className="ml-2 text-xs text-white font-body font-medium">{count}</span>
                )}
              </motion.div>
              {count > 0 && widthPercent <= 15 && (
                <span className={cn('absolute left-2 top-1/2 -translate-y-1/2 text-xs font-body font-medium', CLOTHING_TYPE_TEXT_COLORS[type])}>
                  {count}
                </span>
              )}
            </div>
            {isBest && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 15 }}
                className="shrink-0"
              >
                <Star className="h-5 w-5 fill-terra-400 text-terra-400" />
              </motion.div>
            )}
            {!isBest && <div className="w-5 shrink-0" />}
          </motion.div>
        )
      })}
    </div>
  )
}

function Timeline({ projects, clothing, ideas }: { projects: Project[]; clothing: { id: string; type: ClothingType }[]; ideas: { id: string; title: string }[] }) {
  const completedProjects = projects
    .filter((p) => p.status === 'completed' && p.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

  if (completedProjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <Shirt className="h-12 w-12 text-cream-400 mb-4" />
        <p className="font-body text-sage-600 text-sm">
          还没有完成的项目
        </p>
        <p className="font-body text-sage-400 text-xs mt-1">
          开始你的第一个改造吧，完成后会出现在这里 ✨
        </p>
      </motion.div>
    )
  }

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-cream-300" />
      {completedProjects.map((project, index) => {
        const clothingItem = clothing.find((c) => c.id === project.clothingId)
        const idea = ideas.find((i) => i.id === project.ideaId)
        const date = project.completedAt
          ? new Date(project.completedAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })
          : ''

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 * index }}
            className="relative mb-6 last:mb-0"
          >
            <div className="absolute -left-5 top-1.5 h-4 w-4 rounded-full border-2 border-sage-400 bg-cream-50" />
            <div className="rounded-2xl bg-cream-50 p-4 shadow-soft">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-body text-xs text-sage-400">{date}</span>
                {clothingItem && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-body',
                    'bg-sage-50 text-sage-600'
                  )}>
                    {clothingItem.type}
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-sage-800 font-medium">
                {idea?.title || '改造项目'}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function EcoFacts() {
  const facts = [
    { icon: CloudOff, text: '全球每年约9200万吨纺织废料', color: 'text-terra-500' },
    { icon: Droplets, text: '一件T恤需要2700升水来生产', color: 'text-sage-500' },
    { icon: Leaf, text: '改造一件旧衣可减少约5.5kg碳排放', color: 'text-sage-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-3xl bg-gradient-to-br from-sage-50 to-terra-50 p-6 shadow-card"
    >
      <h3 className="font-display text-lg text-sage-700 mb-4">环保小知识</h3>
      <div className="space-y-3">
        {facts.map((fact, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8 + 0.15 * index }}
            className="flex items-start gap-3"
          >
            <div className={cn('mt-0.5 shrink-0', fact.color)}>
              <fact.icon className="h-4 w-4" />
            </div>
            <p className="font-body text-sm text-sage-700">{fact.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const clothing = useStore((s) => s.clothing)
  const projects = useStore((s) => s.projects)
  const ideas = useStore((s) => s.ideas)
  const currentYear = new Date().getFullYear()

  const stats = useMemo(() => {
    const thisYearClothes = clothing.filter(
      c => new Date(c.createdAt).getFullYear() === currentYear
    )
    const thisYearProjects = projects.filter(
      p => p.completedAt && new Date(p.completedAt).getFullYear() === currentYear
    )
    const typeCount: Record<string, number> = {}
    clothing.forEach(c => {
      typeCount[c.type] = (typeCount[c.type] || 0) + 1
    })
    const typeEntries = Object.entries(typeCount) as [ClothingType, number][]
    const bestType = typeEntries.length > 0
      ? typeEntries.sort((a, b) => b[1] - a[1])[0][0]
      : null
    return {
      totalClothes: thisYearClothes.length,
      completedProjects: thisYearProjects.length,
      inProgressProjects: projects.filter(p => p.status === 'in_progress').length,
      savedFromTrash: thisYearClothes.length,
      bestType,
      typeCount: typeCount as Record<ClothingType, number>,
    }
  }, [clothing, projects, currentYear])

  const isEmpty = stats.totalClothes === 0 && stats.completedProjects === 0 && stats.inProgressProjects === 0

  if (isEmpty) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-terra-50">
            <Recycle className="h-10 w-10 text-terra-300" />
          </div>
          <h2 className="font-display text-2xl text-sage-700 mb-2">
            还没有数据
          </h2>
          <p className="font-body text-sm text-sage-400 max-w-xs mx-auto">
            开始添加旧衣物和改造项目，你的年度统计将在这里展示 🌿
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 font-body">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl text-sage-800">年度统计</h1>
        <p className="mt-1 text-sm text-sage-400">{currentYear}</p>
      </motion.div>

      <div className="mb-10 grid grid-cols-3 gap-4">
        <StatCard
          icon={Recycle}
          value={stats.savedFromTrash}
          label="少扔了几件衣服"
          colorClass="text-terra-600"
          bgClass="bg-terra-50"
          iconBgClass="bg-terra-100"
          delay={0}
        />
        <StatCard
          icon={CheckCircle}
          value={stats.completedProjects}
          label="完成改造"
          colorClass="text-sage-600"
          bgClass="bg-sage-50"
          iconBgClass="bg-sage-100"
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          value={stats.inProgressProjects}
          label="进行中"
          colorClass="text-cream-500"
          bgClass="bg-cream-100"
          iconBgClass="bg-cream-200"
          delay={0.2}
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="font-display text-xl text-sage-700 mb-5">
          哪类衣服最适合再利用
        </h2>
        <div className="rounded-3xl bg-cream-50 p-6 shadow-card">
          <TypeBarChart typeCount={stats.typeCount} bestType={stats.bestType} />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-10"
      >
        <h2 className="font-display text-xl text-sage-700 mb-5">
          改造时间线
        </h2>
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <Timeline projects={projects} clothing={clothing} ideas={ideas} />
        </div>
      </motion.section>

      <EcoFacts />
    </div>
  )
}
