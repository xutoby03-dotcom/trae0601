import {
  DogProfile,
  WalkPlan,
  WalkRecord,
  ConflictAlert,
} from './types'

const KEYS = {
  DOGS: 'dogwalk_dogs',
  PLANS: 'dogwalk_plans',
  RECORDS: 'dogwalk_records',
  CONFLICTS: 'dogwalk_conflicts',
}

function get<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : []
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const store = {
  dogs: {
    getAll: (): DogProfile[] => get<DogProfile>(KEYS.DOGS),
    getById: (id: string): DogProfile | undefined =>
      get<DogProfile>(KEYS.DOGS).find((d) => d.id === id),
    add: (dog: DogProfile) => {
      const list = get<DogProfile>(KEYS.DOGS)
      list.push(dog)
      set(KEYS.DOGS, list)
    },
    update: (dog: DogProfile) => {
      const list = get<DogProfile>(KEYS.DOGS).map((d) =>
        d.id === dog.id ? dog : d
      )
      set(KEYS.DOGS, list)
    },
    remove: (id: string) => {
      set(
        KEYS.DOGS,
        get<DogProfile>(KEYS.DOGS).filter((d) => d.id !== id)
      )
    },
  },

  plans: {
    getAll: (): WalkPlan[] => get<WalkPlan>(KEYS.PLANS),
    getById: (id: string): WalkPlan | undefined =>
      get<WalkPlan>(KEYS.PLANS).find((p) => p.id === id),
    add: (plan: WalkPlan) => {
      const list = get<WalkPlan>(KEYS.PLANS)
      list.push(plan)
      set(KEYS.PLANS, list)
    },
    update: (plan: WalkPlan) => {
      const list = get<WalkPlan>(KEYS.PLANS).map((p) =>
        p.id === plan.id ? plan : p
      )
      set(KEYS.PLANS, list)
    },
    remove: (id: string) => {
      set(
        KEYS.PLANS,
        get<WalkPlan>(KEYS.PLANS).filter((p) => p.id !== id)
      )
    },
  },

  records: {
    getAll: (): WalkRecord[] => get<WalkRecord>(KEYS.RECORDS),
    add: (record: WalkRecord) => {
      const list = get<WalkRecord>(KEYS.RECORDS)
      list.push(record)
      set(KEYS.RECORDS, list)
    },
    remove: (id: string) => {
      set(
        KEYS.RECORDS,
        get<WalkRecord>(KEYS.RECORDS).filter((r) => r.id !== id)
      )
    },
  },

  conflicts: {
    getAll: (): ConflictAlert[] => get<ConflictAlert>(KEYS.CONFLICTS),
    add: (conflict: ConflictAlert) => {
      const list = get<ConflictAlert>(KEYS.CONFLICTS)
      list.push(conflict)
      set(KEYS.CONFLICTS, list)
    },
    resolve: (id: string) => {
      const list = get<ConflictAlert>(KEYS.CONFLICTS).map((c) =>
        c.id === id ? { ...c, resolved: true } : c
      )
      set(KEYS.CONFLICTS, list)
    },
  },
}

export function checkAndCreateConflicts(newPlan: WalkPlan): ConflictAlert[] {
  const dogs = store.dogs.getAll()
  const plans = store.plans.getAll()
  const existingConflicts = store.conflicts.getAll()
  const newDog = dogs.find((d) => d.id === newPlan.dogId)
  if (!newDog) return []

  const conflicts: ConflictAlert[] = []

  const sameSlotPlans = plans.filter(
    (p) =>
      p.id !== newPlan.id &&
      p.date === newPlan.date &&
      p.route === newPlan.route &&
      p.specificTime === newPlan.specificTime
  )

  for (const existing of sameSlotPlans) {
    const existingDog = dogs.find((d) => d.id === existing.dogId)
    if (!existingDog) continue

    const alreadyHas = existingConflicts.some(
      (c) =>
        !c.resolved &&
        ((c.plan1Id === newPlan.id && c.plan2Id === existing.id) ||
          (c.plan1Id === existing.id && c.plan2Id === newPlan.id))
    )
    if (alreadyHas) continue

    let reason = ''

    if (newDog.incompatibleDogIds.includes(existingDog.id) || existingDog.incompatibleDogIds.includes(newDog.id)) {
      reason = `${newDog.name} 和 ${existingDog.name} 互相不合`
    } else if (newDog.afraidOfBigDogs && existingDog.size === '大型') {
      reason = `${newDog.name} 怕大狗，${existingDog.name} 是大型犬`
    } else if (existingDog.afraidOfBigDogs && newDog.size === '大型') {
      reason = `${existingDog.name} 怕大狗，${newDog.name} 是大型犬`
    }

    if (reason) {
      const conflict: ConflictAlert = {
        id: uid(),
        plan1Id: newPlan.id,
        plan2Id: existing.id,
        dog1Id: newDog.id,
        dog1Name: newDog.name,
        dog2Id: existingDog.id,
        dog2Name: existingDog.name,
        owner1Name: newPlan.ownerName,
        owner2Name: existing.ownerName,
        reason,
        route: newPlan.route,
        date: newPlan.date,
        timeSlot: newPlan.timeSlot,
        specificTime: newPlan.specificTime,
        resolved: false,
        createdAt: new Date().toISOString(),
      }
      conflicts.push(conflict)
      store.conflicts.add(conflict)
    }
  }

  return conflicts
}
