import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CoffeeBean, BrewRecord, Alert } from '@/types'

interface CoffeeState {
  beans: CoffeeBean[]
  brews: BrewRecord[]
  addBean: (bean: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBean: (id: string, data: Partial<Omit<CoffeeBean, 'id' | 'createdAt'>>) => void
  removeBean: (id: string) => void
  addBrew: (brew: Omit<BrewRecord, 'id' | 'createdAt'>) => void
  updateBrew: (id: string, data: Partial<Omit<BrewRecord, 'id' | 'createdAt'>>) => void
  removeBrew: (id: string) => void
  getAlerts: () => Alert[]
}

export const useCoffeeStore = create<CoffeeState>()(
  persist(
    (set, get) => ({
      beans: [],
      brews: [],

      addBean: (bean) =>
        set((state) => ({
          beans: [
            ...state.beans,
            {
              ...bean,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateBean: (id, data) =>
        set((state) => ({
          beans: state.beans.map((bean) =>
            bean.id === id
              ? { ...bean, ...data, updatedAt: new Date().toISOString() }
              : bean
          ),
        })),

      removeBean: (id) =>
        set((state) => ({
          beans: state.beans.filter((bean) => bean.id !== id),
          brews: state.brews.filter((brew) => brew.beanId !== id),
        })),

      addBrew: (brew) =>
        set((state) => ({
          brews: [
            ...state.brews,
            {
              ...brew,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateBrew: (id, data) =>
        set((state) => ({
          brews: state.brews.map((brew) =>
            brew.id === id ? { ...brew, ...data } : brew
          ),
        })),

      removeBrew: (id) =>
        set((state) => ({
          brews: state.brews.filter((brew) => brew.id !== id),
        })),

      getAlerts: () => {
        const { beans } = get()
        const alerts: Alert[] = []
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        for (const bean of beans) {
          if (bean.weightRemaining < 50) {
            alerts.push({
              beanId: bean.id,
              beanName: bean.name,
              type: 'low-stock',
              message: `${bean.name} 库存不足（剩余 ${bean.weightRemaining}g）`,
            })
          }
          if (bean.openDate && new Date(bean.openDate) < thirtyDaysAgo) {
            alerts.push({
              beanId: bean.id,
              beanName: bean.name,
              type: 'open-too-long',
              message: `${bean.name} 已开封超过30天`,
            })
          }
        }

        return alerts
      },
    }),
    {
      name: 'coffee-bean-vault',
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          const defaultFlavor = { acidity: 5, sweetness: 5, bitterness: 5, body: 5, aroma: 5 }
          if (persisted.brews) {
            persisted.brews = persisted.brews.map((brew: any) => {
              if (!brew.flavor) {
                return { ...brew, flavor: defaultFlavor }
              }
              return brew
            })
          }
        }
        return persisted
      },
    }
  )
)
