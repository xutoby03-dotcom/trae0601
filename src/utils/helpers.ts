import type { Trip, Day, Photo, Weather, StoryStyle } from '@/types'
import { TAG_CONFIG } from '@/types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function getWeatherEmoji(weather: Weather): string {
  const map: Record<Weather, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌧️',
    '大雨': '⛈️',
    '雪': '❄️',
    '雾': '🌫️',
  }
  return map[weather] || '🌤️'
}

export function getTagStyle(tagName: string): { color: string; bg: string } {
  const config = TAG_CONFIG[tagName as keyof typeof TAG_CONFIG]
  return config ? { color: config.color, bg: config.bg } : { color: '#666', bg: '#f0f0f0' }
}

export function getStyleEmoji(style: StoryStyle): string {
  const map: Record<StoryStyle, string> = {
    '轻松': '😎',
    '纪念': '💌',
    '攻略': '📝',
  }
  return map[style]
}

export function getStyleDescription(style: StoryStyle): string {
  const map: Record<StoryStyle, string> = {
    '轻松': '像跟朋友聊天一样分享旅途趣事，轻松幽默的语气',
    '纪念': '温柔细腻的文字，记录每一个值得铭记的瞬间',
    '攻略': '实用信息优先，交通住宿花费一目了然',
  }
  return map[style]
}

export function generateStoryText(
  trip: Trip,
  days: Day[],
  photos: Photo[],
  style: StoryStyle
): StorySection[] {
  const sections: StorySection[] = []

  sections.push({
    type: 'title',
    content: trip.title,
  })

  sections.push({
    type: 'intro',
    content: generateIntro(trip, days, style),
  })

  days.forEach((day, idx) => {
    const dayPhotos = photos.filter((p) => p.dayId === day.id)
    sections.push({
      type: 'day-header',
      content: `Day ${idx + 1} · ${formatDateFull(day.date)} · ${day.location}`,
    })

    if (dayPhotos.length > 0) {
      const coverPhoto = dayPhotos[0]
      sections.push({
        type: 'photo',
        content: coverPhoto.url,
        caption: coverPhoto.story,
      })
    }

    const stories = dayPhotos.filter((p) => p.story).map((p) => p.story)
    if (stories.length > 0) {
      sections.push({
        type: 'text',
        content: generateDayText(day, stories, style),
      })
    }

    const dayCost = dayPhotos.reduce((s, p) => s + p.cost, 0)
    if (dayCost > 0) {
      sections.push({
        type: 'cost',
        content: `当日花费：¥${dayCost.toFixed(0)}`,
      })
    }

    if (dayPhotos.length > 1) {
      dayPhotos.slice(1, 4).forEach((p) => {
        sections.push({
          type: 'photo',
          content: p.url,
          caption: p.story || p.location,
        })
      })
    }
  })

  const totalCost = photos.reduce((s, p) => s + p.cost, 0)
  sections.push({
    type: 'summary',
    content: generateSummary(trip, days, photos, totalCost, style),
  })

  return sections
}

function generateIntro(trip: Trip, days: Day[], style: StoryStyle): string {
  const duration = days.length
  const locations = [...new Set(days.map((d) => d.location))].join('→')
  if (style === '轻松') {
    return `说走就走！${duration}天的${trip.title}，一路${locations}，每一天都是新的惊喜 ✈️`
  }
  if (style === '纪念') {
    return `${formatDateFull(trip.startDate)}，我们踏上了${trip.title}的旅程。${duration}天的时光，${locations}，每一站都值得铭记。`
  }
  return `${trip.title} | ${duration}天 | ${locations} | 总预算参考：见文末详细攻略`
}

function generateDayText(day: Day, stories: string[], style: StoryStyle): string {
  const joined = stories.join('；')
  if (style === '轻松') {
    return `${day.location}的一天——${joined}，这就是旅行的味道！`
  }
  if (style === '纪念') {
    return `在${day.location}，${joined}。这些瞬间，画面依然清晰。`
  }
  return `【${day.location}】${joined}。`
}

function generateSummary(
  trip: Trip,
  _days: Day[],
  photos: Photo[],
  totalCost: number,
  style: StoryStyle
): string {
  if (style === '轻松') {
    return `${trip.title}完美收官！${photos.length}张照片记录了这段旅程，总共花了¥${totalCost.toFixed(0)}，每一分都值了！🌟`
  }
  if (style === '纪念') {
    return `旅途结束了，但回忆不会。${photos.length}个瞬间，¥${totalCost.toFixed(0)}的旅途，都是我们共同的故事。`
  }
  return `【攻略总结】行程${_days.length}天，拍摄${photos.length}张，总花费¥${totalCost.toFixed(0)}，人均约¥${(totalCost / 2).toFixed(0)}。`
}

export interface StorySection {
  type: 'title' | 'intro' | 'day-header' | 'text' | 'photo' | 'cost' | 'summary'
  content: string
  caption?: string
}

export function createDemoTrip(): { trip: Trip; days: Day[]; photos: Photo[] } {
  const tripId = generateId()
  const trip: Trip = {
    id: tripId,
    title: '云南·大理丽江之行',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20Dali%20old%20town%20with%20Cangshan%20mountain%20and%20Erhai%20lake%2C%20golden%20sunset%2C%20travel%20photography&image_size=landscape_16_9',
    startDate: '2025-04-10',
    endDate: '2025-04-15',
    description: '春日云南行，从大理到丽江，风花雪月与古城故事',
  }

  const day1Id = generateId()
  const day2Id = generateId()
  const day3Id = generateId()
  const day4Id = generateId()
  const day5Id = generateId()
  const day6Id = generateId()

  const days: Day[] = [
    { id: day1Id, tripId, date: '2025-04-10', location: '昆明', weather: '晴', totalCost: 0 },
    { id: day2Id, tripId, date: '2025-04-11', location: '大理', weather: '多云', totalCost: 0 },
    { id: day3Id, tripId, date: '2025-04-12', location: '大理', weather: '晴', totalCost: 0 },
    { id: day4Id, tripId, date: '2025-04-13', location: '丽江', weather: '小雨', totalCost: 0 },
    { id: day5Id, tripId, date: '2025-04-14', location: '丽江', weather: '多云', totalCost: 0 },
    { id: day6Id, tripId, date: '2025-04-15', location: '昆明', weather: '晴', totalCost: 0 },
  ]

  const photos: Photo[] = [
    {
      id: generateId(), dayId: day1Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunming%20airport%20arrival%20hall%2C%20warm%20sunlight%20streaming%20in%2C%20luggage%20cart%2C%20travel%20mood&image_size=landscape_16_9',
      location: '昆明长水机场', date: '2025-04-10', companions: '小明、小红',
      cost: 1200, weather: '晴', story: '落地昆明，阳光灿烂得像在欢迎我们！', tags: ['交通'],
    },
    {
      id: generateId(), dayId: day1Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunming%20Cross-bridge%20rice%20noodles%20soup%20with%20fresh%20ingredients%2C%20steam%20rising%2C%20wooden%20table&image_size=landscape_16_9',
      location: '昆明老街', date: '2025-04-10', companions: '小明、小红',
      cost: 85, weather: '晴', story: '第一顿必须过桥米线，汤底鲜美到哭！', tags: ['美食'],
    },
    {
      id: generateId(), dayId: day2Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dali%20ancient%20town%20morning%2C%20stone%20paved%20street%2C%20traditional%20Bai%20architecture%2C%20flowers%20on%20walls&image_size=landscape_16_9',
      location: '大理古城', date: '2025-04-11', companions: '小明、小红',
      cost: 380, weather: '多云', story: '古城的清晨太安静了，每条巷子都是风景。', tags: ['风景'],
    },
    {
      id: generateId(), dayId: day2Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Erhai%20lake%20view%20from%20Dali%2C%20blue%20water%20with%20boats%2C%20Cangshan%20mountains%20background%2C%20serene&image_size=landscape_16_9',
      location: '洱海边', date: '2025-04-11', companions: '小明',
      cost: 150, weather: '多云', story: '洱海的蓝，是那种让人不想走的蓝。', tags: ['风景', '惊喜'],
    },
    {
      id: generateId(), dayId: day3Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20BBQ%20skewers%20at%20night%20market%2C%20smoky%20grill%2C%20colorful%20lights%2C%20bustling%20atmosphere&image_size=landscape_16_9',
      location: '大理古城夜市', date: '2025-04-12', companions: '小明、小红',
      cost: 120, weather: '晴', story: '夜市的烤乳扇绝了，连续吃了三串！', tags: ['美食', '惊喜'],
    },
    {
      id: generateId(), dayId: day3Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Double%20deck%20sleeper%20bus%20interior%2C%20cozy%20beds%2C%20window%20view%20of%20mountains%2C%20travel&image_size=landscape_16_9',
      location: '大理→丽江', date: '2025-04-12', companions: '小明、小红',
      cost: 90, weather: '晴', story: '坐大巴去丽江，一路苍山洱海相送。', tags: ['交通'],
    },
    {
      id: generateId(), dayId: day4Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lijiang%20old%20town%20rainy%20day%2C%20cobblestone%20streets%20wet%2C%20red%20lanterns%2C%20misty%20atmosphere&image_size=landscape_16_9',
      location: '丽江古城', date: '2025-04-13', companions: '小明、小红',
      cost: 260, weather: '小雨', story: '雨天逛古城别有风味，只是石板路太滑差点摔了。', tags: ['风景', '踩坑'],
    },
    {
      id: generateId(), dayId: day4Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Naxi%20traditional%20hotpot%20with%20mushrooms%2C%20steam%20and%20aroma%2C%20warm%20restaurant%20interior&image_size=landscape_16_9',
      location: '丽江纳西餐厅', date: '2025-04-13', companions: '小明、小红',
      cost: 180, weather: '小雨', story: '纳西火锅暖胃又暖心，菌子鲜到眉毛掉。', tags: ['美食'],
    },
    {
      id: generateId(), dayId: day5Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jade%20Dragon%20Snow%20Mountain%20viewpoint%2C%20snow%20capped%20peaks%2C%20blue%20sky%2C%20tourists%20with%20oxygen%20cylinders&image_size=landscape_16_9',
      location: '玉龙雪山', date: '2025-04-14', companions: '小明、小红',
      cost: 680, weather: '多云', story: '登顶4680！高反让每一步都很艰难，但看到雪山的瞬间全值了。', tags: ['风景', '惊喜'],
    },
    {
      id: generateId(), dayId: day5Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Blue%20Moon%20Valley%20Jade%20Dragon%20Snow%20Mountain%2C%20turquoise%20lakes%2C%20waterfalls%2C%20stunning%20natural%20landscape&image_size=landscape_16_9',
      location: '蓝月谷', date: '2025-04-14', companions: '小明',
      cost: 50, weather: '多云', story: '蓝月谷的水真的蓝得不真实，像上帝打翻了调色盘。', tags: ['风景'],
    },
    {
      id: generateId(), dayId: day6Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunming%20flower%20market%2C%20colorful%20fresh%20flowers%2C%20vendors%2C%20morning%20light&image_size=landscape_16_9',
      location: '昆明斗南花市', date: '2025-04-15', companions: '小明、小红',
      cost: 45, weather: '晴', story: '临走前逛花市，5块钱一大束玫瑰，想搬回家！', tags: ['惊喜'],
    },
    {
      id: generateId(), dayId: day6Id,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Airport%20departure%20gate%2C%20sunset%20through%20window%2C%20silhouette%20of%20traveler%2C%20nostalgic%20mood&image_size=landscape_16_9',
      location: '昆明长水机场', date: '2025-04-15', companions: '小明、小红',
      cost: 980, weather: '晴', story: '回家啦，六天太短，下次还来！', tags: ['交通'],
    },
  ]

  return { trip, days, photos }
}
