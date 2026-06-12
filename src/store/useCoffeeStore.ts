import { create } from 'zustand';
import { CoffeeBean, BrewRecord, FlavorTag, Statistics, StockStatus } from '../types';
import { generateId, hasAnyFlavor, getStockStatus, pricePerGram } from '../utils/helpers';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { mockBeans, mockBrewRecords } from '../data/mockData';

type StockFilter = 'all' | StockStatus;

interface CoffeeState {
  beans: CoffeeBean[];
  brewRecords: BrewRecord[];
  activeFlavorFilter: FlavorTag[];
  activeStockFilter: StockFilter;

  initFromStorage: () => void;

  addBean: (
    bean: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void;
  updateBean: (id: string, bean: Partial<CoffeeBean>) => void;
  deleteBean: (id: string) => void;
  getBeanById: (id: string) => CoffeeBean | undefined;

  addBrewRecord: (record: Omit<BrewRecord, 'id'>) => void;
  deleteBrewRecord: (id: string) => void;
  getRecordsByBeanId: (beanId: string) => BrewRecord[];

  toggleFlavorFilter: (tag: FlavorTag) => void;
  setStockFilter: (filter: StockFilter) => void;
  clearFlavorFilter: () => void;
  clearAllFilters: () => void;
  getFilteredBeans: () => CoffeeBean[];

  getStats: () => Statistics;
}

export const useCoffeeStore = create<CoffeeState>((set, get) => ({
  beans: [],
  brewRecords: [],
  activeFlavorFilter: [],
  activeStockFilter: 'all',

  initFromStorage: () => {
    const stored = loadFromStorage();
    if (stored && stored.beans.length > 0) {
      set({
        beans: stored.beans as CoffeeBean[],
        brewRecords: stored.brewRecords as BrewRecord[],
      });
    } else {
      set({
        beans: mockBeans,
        brewRecords: mockBrewRecords,
      });
      saveToStorage(mockBeans, mockBrewRecords);
    }
  },

  addBean: (beanData) => {
    const now = new Date().toISOString();
    const newBean: CoffeeBean = {
      ...beanData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newBeans = [...state.beans, newBean];
      saveToStorage(newBeans, state.brewRecords);
      return { beans: newBeans };
    });
  },

  updateBean: (id, beanData) => {
    set((state) => {
      const newBeans = state.beans.map((bean) =>
        bean.id === id
          ? { ...bean, ...beanData, updatedAt: new Date().toISOString() }
          : bean,
      );
      saveToStorage(newBeans, state.brewRecords);
      return { beans: newBeans };
    });
  },

  deleteBean: (id) => {
    set((state) => {
      const newBeans = state.beans.filter((bean) => bean.id !== id);
      const newRecords = state.brewRecords.filter(
        (record) => record.beanId !== id,
      );
      saveToStorage(newBeans, newRecords);
      return { beans: newBeans, brewRecords: newRecords };
    });
  },

  getBeanById: (id) => {
    return get().beans.find((bean) => bean.id === id);
  },

  addBrewRecord: (recordData) => {
    const newRecord: BrewRecord = {
      ...recordData,
      id: generateId(),
    };
    set((state) => {
      const newRecords = [newRecord, ...state.brewRecords];
      const newBeans = state.beans.map((bean) => {
        if (bean.id === recordData.beanId) {
          const newWeight = Math.max(
            0,
            bean.remainingWeight - recordData.coffeeDose,
          );
          return {
            ...bean,
            remainingWeight: newWeight,
            updatedAt: new Date().toISOString(),
          };
        }
        return bean;
      });
      saveToStorage(newBeans, newRecords);
      return { brewRecords: newRecords, beans: newBeans };
    });
  },

  deleteBrewRecord: (id) => {
    set((state) => {
      const record = state.brewRecords.find((r) => r.id === id);
      const newRecords = state.brewRecords.filter((r) => r.id !== id);
      let newBeans = state.beans;
      if (record) {
        newBeans = state.beans.map((bean) => {
          if (bean.id === record.beanId) {
            return {
              ...bean,
              remainingWeight: Math.min(
                bean.initialWeight,
                bean.remainingWeight + record.coffeeDose,
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return bean;
        });
      }
      saveToStorage(newBeans, newRecords);
      return { brewRecords: newRecords, beans: newBeans };
    });
  },

  getRecordsByBeanId: (beanId) => {
    return get()
      .brewRecords.filter((record) => record.beanId === beanId)
      .sort((a, b) => new Date(b.brewTime).getTime() - new Date(a.brewTime).getTime());
  },

  toggleFlavorFilter: (tag) => {
    set((state) => {
      const hasTag = state.activeFlavorFilter.includes(tag);
      return {
        activeFlavorFilter: hasTag
          ? state.activeFlavorFilter.filter((t) => t !== tag)
          : [...state.activeFlavorFilter, tag],
      };
    });
  },

  setStockFilter: (filter) => {
    set({ activeStockFilter: filter });
  },

  clearFlavorFilter: () => {
    set({ activeFlavorFilter: [] });
  },

  clearAllFilters: () => {
    set({ activeFlavorFilter: [], activeStockFilter: 'all' });
  },

  getFilteredBeans: () => {
    const { beans, activeFlavorFilter, activeStockFilter } = get();
    let result = beans;

    if (activeFlavorFilter.length > 0) {
      result = result.filter((bean) =>
        hasAnyFlavor(bean.flavorTags, activeFlavorFilter),
      );
    }

    if (activeStockFilter !== 'all') {
      result = result.filter(
        (bean) => getStockStatus(bean) === activeStockFilter,
      );
    }

    return result;
  },

  getStats: () => {
    const { beans, brewRecords } = get();

    const totalBeans = beans.length;
    const totalBrews = brewRecords.length;
    const lowStockCount = beans.filter(
      (bean) => getStockStatus(bean) === 'low' || getStockStatus(bean) === 'empty',
    ).length;

    const originMap = new Map<string, { count: number; brewCount: number }>();
    beans.forEach((bean) => {
      const existing = originMap.get(bean.origin) || { count: 0, brewCount: 0 };
      originMap.set(bean.origin, { ...existing, count: existing.count + 1 });
    });
    brewRecords.forEach((record) => {
      const bean = beans.find((b) => b.id === record.beanId);
      if (bean) {
        const existing = originMap.get(bean.origin) || { count: 0, brewCount: 0 };
        originMap.set(bean.origin, {
          ...existing,
          brewCount: existing.brewCount + 1,
        });
      }
    });
    const originDistribution = Array.from(originMap.entries())
      .map(([origin, data]) => ({ origin, ...data }))
      .sort((a, b) => b.brewCount - a.brewCount);

    const favoriteOrigin = originDistribution[0]?.origin || '暂无';

    const beanRatings = new Map<string, number[]>();
    brewRecords.forEach((record) => {
      const ratings = beanRatings.get(record.beanId) || [];
      ratings.push(record.rating);
      beanRatings.set(record.beanId, ratings);
    });

    const topValueBeans = beans
      .map((bean) => {
        const ratings = beanRatings.get(bean.id) || [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        const ppg = pricePerGram(bean.price, bean.initialWeight);
        const valueScore = ppg > 0 ? (avgRating / ppg) * 10 : 0;
        return { bean, avgRating, pricePerGram: ppg, valueScore };
      })
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 5);

    const equipmentMap = new Map<string, number>();
    brewRecords.forEach((record) => {
      equipmentMap.set(record.equipment, (equipmentMap.get(record.equipment) || 0) + 1);
    });
    const commonEquipment = Array.from(equipmentMap.entries())
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((a, b) => b.count - a.count);

    const ratioMap = new Map<string, number>();
    brewRecords.forEach((record) => {
      if (record.coffeeDose > 0) {
        const ratio = `1:${(record.waterAmount / record.coffeeDose).toFixed(1)}`;
        ratioMap.set(ratio, (ratioMap.get(ratio) || 0) + 1);
      }
    });
    const commonRatioEntry = Array.from(ratioMap.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const commonRatio = commonRatioEntry?.[0] || '暂无';

    const tempBuckets = new Map<number, number>();
    brewRecords.forEach((record) => {
      const bucket = Math.round(record.waterTemp / 5) * 5;
      tempBuckets.set(bucket, (tempBuckets.get(bucket) || 0) + 1);
    });
    const commonTempEntry = Array.from(tempBuckets.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const commonTemp = commonTempEntry?.[0] || 0;

    return {
      totalBeans,
      totalBrews,
      lowStockCount,
      favoriteOrigin,
      topValueBeans,
      originDistribution,
      commonEquipment,
      commonRatio,
      commonTemp,
    };
  },
}));
