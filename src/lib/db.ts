import { openDB, type IDBPDatabase } from 'idb'
import type { TimeCapsule, Template } from '@/types'

const DB_NAME = 'time-capsule-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('capsules')) {
        const capsuleStore = db.createObjectStore('capsules', { keyPath: 'id' })
        capsuleStore.createIndex('openDate', 'openDate', { unique: false })
        capsuleStore.createIndex('isOpened', 'isOpened', { unique: false })
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

export async function getAllCapsules(): Promise<TimeCapsule[]> {
  const db = await getDB()
  const capsules = await db.getAll('capsules')
  return capsules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function addCapsule(capsule: TimeCapsule): Promise<void> {
  const db = await getDB()
  await db.put('capsules', capsule)
}

export async function updateCapsule(capsule: TimeCapsule): Promise<void> {
  const db = await getDB()
  await db.put('capsules', capsule)
}

export async function deleteCapsule(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('capsules', id)
}

export async function getCapsule(id: string): Promise<TimeCapsule | undefined> {
  const db = await getDB()
  return db.get('capsules', id)
}

export async function getAllTemplates(): Promise<Template[]> {
  const db = await getDB()
  const templates = await db.getAll('templates')
  if (templates.length === 0) {
    const defaults = getDefaultTemplates()
    const tx = db.transaction('templates', 'readwrite')
    for (const t of defaults) {
      await tx.store.put(t)
    }
    await tx.done
    return defaults
  }
  return templates
}

function getDefaultTemplates(): Template[] {
  return [
    {
      id: 'birthday',
      name: '生日快乐',
      icon: '🎂',
      prefix: '亲爱的未来的自己：\n\n今天是你的生日！祝自己生日快乐！在这个特别的日子里，我想对你说……',
      description: '给未来的生日写一封信',
      defaultMoodColor: '#FF6B6B',
      defaultDaysAhead: 365,
    },
    {
      id: 'graduation',
      name: '毕业纪念',
      icon: '🎓',
      prefix: '亲爱的未来的自己：\n\n毕业快乐！还记得当初入学时的憧憬吗？现在回头看，这段旅程一定很精彩吧……',
      description: '封存毕业时刻的心情',
      defaultMoodColor: '#9B59B6',
      defaultDaysAhead: 730,
    },
    {
      id: 'newjob',
      name: '入职纪念',
      icon: '💼',
      prefix: '亲爱的未来的自己：\n\n还记得刚入职那天的紧张和期待吗？现在的你一定已经驾轻就熟了吧……',
      description: '记录入职第一天的心情',
      defaultMoodColor: '#3498DB',
      defaultDaysAhead: 365,
    },
    {
      id: 'newyear',
      name: '新年愿望',
      icon: '🎆',
      prefix: '亲爱的未来的自己：\n\n新年好！新的一年，我希望……',
      description: '写给新年的愿望清单',
      defaultMoodColor: '#F39C12',
      defaultDaysAhead: 365,
    },
    {
      id: 'anniversary',
      name: '恋爱纪念日',
      icon: '💕',
      prefix: '亲爱的未来的自己：\n\n今天是一个特别的日子，还记得那个心动的瞬间吗……',
      description: '记录甜蜜时刻',
      defaultMoodColor: '#E91E63',
      defaultDaysAhead: 365,
    },
    {
      id: 'selfletter',
      name: '写给一年后',
      icon: '💌',
      prefix: '亲爱的未来的自己：\n\n你好呀，一年后的我。现在的我正在……',
      description: '给一年后的自己写封信',
      defaultMoodColor: '#2ECC71',
      defaultDaysAhead: 365,
    },
  ]
}
