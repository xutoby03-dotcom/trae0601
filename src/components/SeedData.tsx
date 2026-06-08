import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Mood } from '@/lib/types'

const SEED_DATA = [
  {
    title: '小森林·夏秋篇',
    type: 'movie' as const,
    duration: 111,
    moods: ['tired', 'want-empty', 'happy'] as Mood[],
    intensity: 1,
    consumed: false,
    rating: 5,
    note: '每次看都觉得被治愈了',
  },
  {
    title: '百年孤独',
    type: 'book' as const,
    duration: 480,
    moods: ['insomnia', 'want-learn'] as Mood[],
    intensity: 4,
    consumed: false,
    rating: 5,
    note: '魔幻现实主义的巅峰',
  },
  {
    title: '职场求生指南',
    type: 'series' as const,
    duration: 30,
    moods: ['annoyed', 'happy'] as Mood[],
    intensity: 2,
    consumed: false,
    rating: 4,
    note: '打工人必看',
  },
  {
    title: '坂本龙一 - async',
    type: 'music' as const,
    duration: 55,
    moods: ['tired', 'insomnia', 'want-cry'] as Mood[],
    intensity: 3,
    consumed: false,
    rating: 5,
    note: '深夜独处时最适合的专辑',
  },
  {
    title: '寻梦环游记',
    type: 'movie' as const,
    duration: 105,
    moods: ['want-cry', 'happy'] as Mood[],
    intensity: 3,
    consumed: true,
    rating: 5,
    note: ' Remember me ',
  },
  {
    title: '人类简史',
    type: 'book' as const,
    duration: 360,
    moods: ['want-learn', 'happy'] as Mood[],
    intensity: 4,
    consumed: false,
    rating: 4,
    note: '换一个角度看世界',
  },
  {
    title: '午夜巴黎',
    type: 'movie' as const,
    duration: 94,
    moods: ['insomnia', 'want-empty', 'happy'] as Mood[],
    intensity: 2,
    consumed: false,
    rating: 4,
    note: '关于怀旧和黄金时代的浪漫',
  },
  {
    title: '孤独的美食家 S8',
    type: 'series' as const,
    duration: 25,
    moods: ['tired', 'want-empty', 'annoyed'] as Mood[],
    intensity: 1,
    consumed: false,
    rating: 4,
    note: '吃饭就是最好的治愈',
  },
  {
    title: 'Radiohead - OK Computer',
    type: 'music' as const,
    duration: 53,
    moods: ['annoyed', 'insomnia'] as Mood[],
    intensity: 4,
    consumed: false,
    rating: 5,
    note: '焦虑世代的完美配乐',
  },
  {
    title: '被讨厌的勇气',
    type: 'book' as const,
    duration: 180,
    moods: ['annoyed', 'want-learn', 'want-cry'] as Mood[],
    intensity: 3,
    consumed: false,
    rating: 4,
    note: '课题分离，让自己自由',
  },
  {
    title: '千与千寻',
    type: 'movie' as const,
    duration: 125,
    moods: ['want-cry', 'tired', 'want-empty'] as Mood[],
    intensity: 2,
    consumed: true,
    rating: 5,
    note: '不管看多少遍都会感动',
  },
  {
    title: '久石让 - 梦之歌',
    type: 'music' as const,
    duration: 45,
    moods: ['tired', 'want-cry', 'want-empty'] as Mood[],
    intensity: 2,
    consumed: false,
    rating: 4,
    note: '温柔的钢琴曲集',
  },
]

export default function SeedData() {
  const mediaItems = useAppStore((s) => s.mediaItems)
  const addMediaItem = useAppStore((s) => s.addMediaItem)
  const hasSeeded = useRef(false)

  useEffect(() => {
    if (mediaItems.length === 0 && !hasSeeded.current) {
      hasSeeded.current = true
      SEED_DATA.forEach((data) => {
        addMediaItem(data)
      })
    }
  }, [mediaItems.length, addMediaItem])

  return null
}
