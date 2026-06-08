import { create } from 'zustand'
import { Guest, Table, Conflict, RelationshipGroup, generateId, createDefaultTables, RELATIONSHIP_ZONES } from './types'

interface WeddingStore {
  guests: Guest[]
  tables: Table[]
  conflicts: Conflict[]
  selectedGuestId: string | null
  hallWidth: number
  hallHeight: number

  addGuest: (guest: Omit<Guest, 'id' | 'tableId'>) => void
  updateGuest: (id: string, data: Partial<Guest>) => void
  removeGuest: (id: string) => void
  importGuests: (guests: Omit<Guest, 'id' | 'tableId'>[]) => void
  importGuestsWithNames: (rawData: { name: string; relationship: RelationshipGroup; partySize: number; isChild: boolean; isElderly: boolean; dietaryRestrictions: string; cannotSitWithNames: string[]; preferSitWithNames: string[] }[]) => void
  setSelectedGuestId: (id: string | null) => void

  addTable: () => void
  updateTable: (id: string, data: Partial<Table>) => void
  removeTable: (id: string) => void
  moveTable: (id: string, x: number, y: number) => void

  assignGuestToTable: (guestId: string, tableId: string) => void
  unassignGuest: (guestId: string) => void

  autoGroup: () => void
  checkConflicts: () => void
}

function createDemoGuests(): Guest[] {
  const raw: Omit<Guest, 'id' | 'tableId' | 'cannotSitWith' | 'preferSitWith'>[] = [
    { name: '张爷爷', relationship: '亲戚', partySize: 2, isChild: false, isElderly: true, dietaryRestrictions: '清淡' },
    { name: '张奶奶', relationship: '亲戚', partySize: 1, isChild: false, isElderly: true, dietaryRestrictions: '无糖' },
    { name: '王叔叔', relationship: '亲戚', partySize: 3, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '李阿姨', relationship: '亲戚', partySize: 2, isChild: false, isElderly: false, dietaryRestrictions: '海鲜过敏' },
    { name: '赵表哥', relationship: '亲戚', partySize: 2, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '小明', relationship: '亲戚', partySize: 1, isChild: true, isElderly: false, dietaryRestrictions: '' },
    { name: '刘同学', relationship: '同学', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '陈同学', relationship: '同学', partySize: 2, isChild: false, isElderly: false, dietaryRestrictions: '素食' },
    { name: '周同学', relationship: '同学', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '吴同学', relationship: '同学', partySize: 3, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '孙经理', relationship: '同事', partySize: 2, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '钱主管', relationship: '同事', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '辣' },
    { name: '郑同事', relationship: '同事', partySize: 2, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '何同事', relationship: '同事', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '林好友', relationship: '朋友', partySize: 2, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '黄好友', relationship: '朋友', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '杨好友', relationship: '朋友', partySize: 3, isChild: false, isElderly: false, dietaryRestrictions: '花生过敏' },
    { name: '徐闺蜜', relationship: '朋友', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '马伴郎', relationship: '朋友', partySize: 1, isChild: false, isElderly: false, dietaryRestrictions: '' },
    { name: '小豆', relationship: '朋友', partySize: 1, isChild: true, isElderly: false, dietaryRestrictions: '' },
  ]
  const result: Guest[] = raw.map((g) => ({ ...g, id: generateId(), tableId: null, cannotSitWith: [], preferSitWith: [] }))
  const byName = (name: string) => result.find((g) => g.name === name)?.id || ''
  result.find((g) => g.name === '张爷爷')!.preferSitWith = [byName('张奶奶')]
  result.find((g) => g.name === '张奶奶')!.preferSitWith = [byName('张爷爷')]
  result.find((g) => g.name === '王叔叔')!.cannotSitWith = [byName('李阿姨')]
  result.find((g) => g.name === '李阿姨')!.cannotSitWith = [byName('王叔叔')]
  result.find((g) => g.name === '刘同学')!.preferSitWith = [byName('陈同学')]
  result.find((g) => g.name === '陈同学')!.preferSitWith = [byName('刘同学')]
  return result
}

export const useWeddingStore = create<WeddingStore>((set, get) => ({
  guests: createDemoGuests(),
  tables: createDefaultTables(),
  conflicts: [],
  selectedGuestId: null,
  hallWidth: 700,
  hallHeight: 600,

  addGuest: (guestData) => {
    const guest: Guest = { ...guestData, id: generateId(), tableId: null }
    set((s) => ({ guests: [...s.guests, guest] }))
    get().checkConflicts()
  },

  updateGuest: (id, data) => {
    set((s) => ({
      guests: s.guests.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }))
    get().checkConflicts()
  },

  removeGuest: (id) => {
    set((s) => ({
      guests: s.guests
        .filter((g) => g.id !== id)
        .map((g) => ({
          ...g,
          cannotSitWith: g.cannotSitWith.filter((rid) => rid !== id),
          preferSitWith: g.preferSitWith.filter((rid) => rid !== id),
        })),
      selectedGuestId: s.selectedGuestId === id ? null : s.selectedGuestId,
    }))
    get().checkConflicts()
  },

  importGuests: (guestsData) => {
    const newGuests: Guest[] = guestsData.map((g) => ({ ...g, id: generateId(), tableId: null }))
    set((s) => ({ guests: [...s.guests, ...newGuests] }))
    get().checkConflicts()
  },

  importGuestsWithNames: (rawData: { name: string; relationship: RelationshipGroup; partySize: number; isChild: boolean; isElderly: boolean; dietaryRestrictions: string; cannotSitWithNames: string[]; preferSitWithNames: string[] }[]) => {
    const existing = get().guests
    const newGuests: Guest[] = rawData.map((g) => ({
      name: g.name,
      relationship: g.relationship,
      partySize: g.partySize,
      isChild: g.isChild,
      isElderly: g.isElderly,
      dietaryRestrictions: g.dietaryRestrictions,
      cannotSitWith: [] as string[],
      preferSitWith: [] as string[],
      id: generateId(),
      tableId: null,
    }))
    const allGuests = [...existing, ...newGuests]
    const resolve = (names: string[]) =>
      names.map((n) => allGuests.find((g) => g.name === n)?.id || '').filter(Boolean)
    newGuests.forEach((ng, i) => {
      const raw = rawData[i]
      ng.cannotSitWith = resolve(raw.cannotSitWithNames)
      ng.preferSitWith = resolve(raw.preferSitWithNames)
    })
    set((s) => ({ guests: [...s.guests, ...newGuests] }))
    get().checkConflicts()
  },

  setSelectedGuestId: (id) => set({ selectedGuestId: id }),

  addTable: () => {
    const table: Table = {
      id: generateId(),
      name: `${get().tables.length + 1}号桌`,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      maxSeats: 10,
      isNearSpeaker: false,
      zone: null,
    }
    set((s) => ({ tables: [...s.tables, table] }))
  },

  updateTable: (id, data) => {
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
    get().checkConflicts()
  },

  removeTable: (id) => {
    set((s) => ({
      tables: s.tables.filter((t) => t.id !== id),
      guests: s.guests.map((g) => (g.tableId === id ? { ...g, tableId: null } : g)),
    }))
    get().checkConflicts()
  },

  moveTable: (id, x, y) => {
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? { ...t, x, y } : t)),
    }))
  },

  assignGuestToTable: (guestId, tableId) => {
    const { tables, guests } = get()
    const table = tables.find((t) => t.id === tableId)
    if (!table) return

    const currentCount = guests
      .filter((g) => g.tableId === tableId)
      .reduce((sum, g) => sum + g.partySize, 0)
    const guest = guests.find((g) => g.id === guestId)
    if (!guest) return

    if (currentCount + guest.partySize > table.maxSeats) {
      set((s) => ({
        conflicts: [
          ...s.conflicts.filter((c) => !(c.type === 'over_capacity' && c.guestIds.includes(guestId))),
          {
            type: 'over_capacity' as const,
            guestIds: [guestId],
            tableId,
            message: `${table.name}已满（${currentCount + guest.partySize}/${table.maxSeats}人），${guest.name}无法入座`,
            severity: 'warning' as const,
          },
        ],
      }))
      return
    }

    set((s) => ({
      guests: s.guests.map((g) => (g.id === guestId ? { ...g, tableId } : g)),
    }))
    get().checkConflicts()
  },

  unassignGuest: (guestId) => {
    set((s) => ({
      guests: s.guests.map((g) => (g.id === guestId ? { ...g, tableId: null } : g)),
    }))
    get().checkConflicts()
  },

  autoGroup: () => {
    const { guests, tables } = get()
    const groups: Record<RelationshipGroup, Guest[]> = {
      '亲戚': [], '同学': [], '同事': [], '朋友': [], '其他': [],
    }
    const unassigned = guests.filter((g) => g.tableId === null || true)
    unassigned.forEach((g) => groups[g.relationship].push(g))

    const updatedGuests = [...guests]
    const updatedTables = tables.map((t) => ({ ...t, zone: null }))
    const usedTables = new Set<string>()

    const groupOrder: RelationshipGroup[] = ['亲戚', '同学', '同事', '朋友', '其他']

    for (const group of groupOrder) {
      const groupGuests = groups[group]
      if (groupGuests.length === 0) continue

      const zone = RELATIONSHIP_ZONES[group]
      const sortedTables = [...updatedTables].sort((a, b) => {
        const da = Math.hypot(a.x - zone.x, a.y - zone.y)
        const db = Math.hypot(b.x - zone.x, b.y - zone.y)
        return da - db
      })

      let remainingGuests = [...groupGuests]

      for (const table of sortedTables) {
        if (remainingGuests.length === 0) break
        if (usedTables.has(table.id)) continue

        let currentSeats = 0
        table.zone = group

        while (remainingGuests.length > 0 && currentSeats < table.maxSeats) {
          const nextGuest = remainingGuests[0]
          if (currentSeats + nextGuest.partySize <= table.maxSeats) {
            const gi = updatedGuests.findIndex((g) => g.id === nextGuest.id)
            if (gi >= 0) {
              updatedGuests[gi] = { ...updatedGuests[gi], tableId: table.id }
            }
            currentSeats += nextGuest.partySize
            remainingGuests.shift()
          } else {
            break
          }
        }

        usedTables.add(table.id)
      }
    }

    set({ guests: updatedGuests, tables: updatedTables })
    get().checkConflicts()
  },

  checkConflicts: () => {
    const { guests, tables } = get()
    const conflicts: Conflict[] = []
    const guestMap = new Map(guests.map((g) => [g.id, g]))

    for (const table of tables) {
      const tableGuests = guests.filter((g) => g.tableId === table.id)
      const totalSize = tableGuests.reduce((s, g) => s + g.partySize, 0)

      if (totalSize > table.maxSeats) {
        conflicts.push({
          type: 'over_capacity',
          guestIds: tableGuests.map((g) => g.id),
          tableId: table.id,
          message: `${table.name}超员：${totalSize}/${table.maxSeats}人`,
          severity: 'error',
        })
      }

      for (let i = 0; i < tableGuests.length; i++) {
        for (let j = i + 1; j < tableGuests.length; j++) {
          const a = tableGuests[i]
          const b = tableGuests[j]
          if (a.cannotSitWith.includes(b.id) || b.cannotSitWith.includes(a.id)) {
            conflicts.push({
              type: 'cannot_sit_together',
              guestIds: [a.id, b.id],
              tableId: table.id,
              message: `${a.name}和${b.name}不能同桌，但都在${table.name}`,
              severity: 'error',
            })
          }
        }
      }

      for (const g of tableGuests) {
        if (g.isElderly && table.isNearSpeaker) {
          conflicts.push({
            type: 'elderly_near_speaker',
            guestIds: [g.id],
            tableId: table.id,
            message: `${g.name}是长辈，但${table.name}离音响太近`,
            severity: 'warning',
          })
        }
        if (g.isChild && !tableGuests.some((other) => !other.isChild)) {
          conflicts.push({
            type: 'no_child_seat',
            guestIds: [g.id],
            tableId: table.id,
            message: `${g.name}是儿童，${table.name}没有成人陪同`,
            severity: 'warning',
          })
        }
        for (const preferredId of g.preferSitWith) {
          const preferred = guestMap.get(preferredId)
          if (preferred && preferred.tableId !== null && preferred.tableId !== g.tableId) {
            const key = [g.id, preferredId].sort().join('-')
            if (!conflicts.some((c) => c.type === 'prefer_not_together' && [c.guestIds[0], c.guestIds[1]].sort().join('-') === key)) {
              conflicts.push({
                type: 'prefer_not_together',
                guestIds: [g.id, preferredId],
                tableId: g.tableId!,
                message: `${g.name}希望和${preferred.name}同桌，但未安排在一起`,
                severity: 'warning',
              })
            }
          }
        }
      }
    }

    set({ conflicts })
  },
}))
