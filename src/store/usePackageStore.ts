import { create } from 'zustand';
import type { PackageItem, PackageStatus, StatsData, PackageFilters } from '@/types';
import { COLD_CHAIN_TIMEOUT_HOURS, NORMAL_TIMEOUT_HOURS } from '@/types';

const STORAGE_KEY = 'parcel-management-packages';

function generateId(): string {
  return `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function loadPackages(): PackageItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return generateMockData();
}

function savePackages(packages: PackageItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}

function isOverdue(pkg: PackageItem): boolean {
  if (pkg.status === 'picked_up') return false;
  const created = new Date(pkg.createdAt).getTime();
  const now = Date.now();
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  if (pkg.isColdChain) {
    return hoursDiff > COLD_CHAIN_TIMEOUT_HOURS;
  }
  return hoursDiff > NORMAL_TIMEOUT_HOURS;
}

function generateMockData(): PackageItem[] {
  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;

  return [
    {
      id: 'pkg_mock_001',
      recipientName: '张明',
      recipientPhone: '13812345678',
      department: '技术部',
      courierCompany: '顺丰速运',
      pickupCode: 'SF2024',
      shelfLocation: 'A-01',
      isFragile: false,
      isColdChain: true,
      photos: [],
      status: 'new',
      createdAt: new Date(now - 2 * hour).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_002',
      recipientName: '李芳',
      recipientPhone: '13987654321',
      department: '产品部',
      courierCompany: '京东物流',
      pickupCode: 'JD3021',
      shelfLocation: 'B-03',
      isFragile: true,
      isColdChain: false,
      photos: [],
      status: 'new',
      createdAt: new Date(now - 1 * hour).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_003',
      recipientName: '王磊',
      recipientPhone: '15011223344',
      department: '设计部',
      courierCompany: '中通快递',
      pickupCode: 'ZT8899',
      shelfLocation: 'C-12',
      isFragile: false,
      isColdChain: false,
      photos: [],
      status: 'pending',
      createdAt: new Date(now - 5 * hour).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_004',
      recipientName: '陈静',
      recipientPhone: '18677889900',
      department: '市场部',
      courierCompany: '圆通速递',
      pickupCode: 'YT5566',
      shelfLocation: 'A-07',
      isFragile: false,
      isColdChain: false,
      photos: [],
      status: 'pending',
      createdAt: new Date(now - 30 * hour).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_005',
      recipientName: '赵伟',
      recipientPhone: '13566778899',
      department: '运营部',
      courierCompany: '顺丰速运',
      pickupCode: 'SF7711',
      shelfLocation: 'D-02',
      isFragile: true,
      isColdChain: true,
      photos: [],
      status: 'new',
      createdAt: new Date(now - 6 * hour).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_006',
      recipientName: '刘洋',
      recipientPhone: '17788990011',
      department: '人事部',
      courierCompany: '韵达快递',
      pickupCode: 'YD3344',
      shelfLocation: 'B-09',
      isFragile: false,
      isColdChain: false,
      photos: [],
      status: 'picked_up',
      createdAt: new Date(now - 2 * day).toISOString(),
      pickedUpAt: new Date(now - 1.5 * day).toISOString(),
      phoneTailVerified: true,
    },
    {
      id: 'pkg_mock_007',
      recipientName: '孙丽',
      recipientPhone: '13900112233',
      department: '财务部',
      courierCompany: 'ems',
      pickupCode: 'EM1122',
      shelfLocation: 'A-04',
      isFragile: false,
      isColdChain: false,
      photos: [],
      status: 'picked_up',
      createdAt: new Date(now - 3 * day).toISOString(),
      pickedUpAt: new Date(now - 2.5 * day).toISOString(),
      phoneTailVerified: true,
    },
    {
      id: 'pkg_mock_008',
      recipientName: '周强',
      recipientPhone: '15844556677',
      department: '技术部',
      courierCompany: '极兔速递',
      pickupCode: 'JT9900',
      shelfLocation: 'C-05',
      isFragile: false,
      isColdChain: false,
      photos: [],
      status: 'abnormal',
      createdAt: new Date(now - 3 * day).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_009',
      recipientName: '吴婷',
      recipientPhone: '18233445566',
      department: '产品部',
      courierCompany: '菜鸟裹裹',
      pickupCode: 'CN2233',
      shelfLocation: 'D-08',
      isFragile: true,
      isColdChain: false,
      photos: [],
      status: 'pending',
      createdAt: new Date(now - 50 * hour).toISOString(),
      phoneTailVerified: false,
    },
    {
      id: 'pkg_mock_010',
      recipientName: '郑凯',
      recipientPhone: '13655667788',
      department: '行政部',
      courierCompany: '丹鸟物流',
      pickupCode: 'DN4455',
      shelfLocation: 'A-10',
      isFragile: false,
      isColdChain: true,
      photos: [],
      status: 'new',
      createdAt: new Date(now - 5 * hour).toISOString(),
      phoneTailVerified: false,
    },
  ];
}

interface PackageStore {
  packages: PackageItem[];
  addPackage: (pkg: Omit<PackageItem, 'id' | 'createdAt' | 'status' | 'phoneTailVerified'>) => void;
  pickupPackage: (id: string, phoneTail: string) => boolean;
  deletePackage: (id: string) => void;
  checkOverdue: () => void;
  getFilteredPackages: (query: string, filters: PackageFilters) => PackageItem[];
  getOverduePackages: () => PackageItem[];
  getStats: () => StatsData;
  getStatusCounts: () => Record<PackageStatus, number>;
}

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: loadPackages(),

  addPackage: (pkg) => {
    const newPkg: PackageItem = {
      ...pkg,
      id: generateId(),
      status: 'new',
      createdAt: new Date().toISOString(),
      phoneTailVerified: false,
    };
    set((state) => {
      const updated = [newPkg, ...state.packages];
      savePackages(updated);
      return { packages: updated };
    });
  },

  pickupPackage: (id, phoneTail) => {
    let success = false;
    set((state) => {
      const updated = state.packages.map((pkg) => {
        if (pkg.id === id) {
          const tail = pkg.recipientPhone.slice(-4);
          if (tail === phoneTail) {
            success = true;
            return {
              ...pkg,
              status: 'picked_up' as PackageStatus,
              pickedUpAt: new Date().toISOString(),
              phoneTailVerified: true,
            };
          }
        }
        return pkg;
      });
      savePackages(updated);
      return { packages: updated };
    });
    return success;
  },

  deletePackage: (id) => {
    set((state) => {
      const updated = state.packages.filter((pkg) => pkg.id !== id);
      savePackages(updated);
      return { packages: updated };
    });
  },

  checkOverdue: () => {
    set((state) => {
      let changed = false;
      const updated = state.packages.map((pkg) => {
        if (pkg.status !== 'picked_up' && isOverdue(pkg) && pkg.status !== 'abnormal') {
          changed = true;
          return { ...pkg, status: 'abnormal' as PackageStatus };
        }
        return pkg;
      });
      if (changed) {
        savePackages(updated);
        return { packages: updated };
      }
      return state;
    });
  },

  getFilteredPackages: (query, filters) => {
    const { packages } = get();
    return packages.filter((pkg) => {
      if (filters.status && pkg.status !== filters.status) return false;
      if (filters.department && pkg.department !== filters.department) return false;
      if (filters.courierCompany && pkg.courierCompany !== filters.courierCompany) return false;
      if (filters.isFragile && !pkg.isFragile) return false;
      if (filters.isColdChain && !pkg.isColdChain) return false;
      if (filters.isOverdue && !isOverdue(pkg)) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          pkg.recipientName.toLowerCase().includes(q) ||
          pkg.pickupCode.toLowerCase().includes(q) ||
          pkg.courierCompany.toLowerCase().includes(q) ||
          pkg.shelfLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  },

  getOverduePackages: () => {
    return get().packages.filter((pkg) => pkg.status !== 'picked_up' && isOverdue(pkg));
  },

  getStats: () => {
    const { packages } = get();
    const now = new Date();
    const last30Days: { date: string; count: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = packages.filter((pkg) => {
        const pkgDate = new Date(pkg.createdAt).toISOString().split('T')[0];
        return pkgDate === dateStr;
      }).length;
      last30Days.push({ date: dateStr, count });
    }

    const deptMap: Record<string, number> = {};
    packages.forEach((pkg) => {
      deptMap[pkg.department] = (deptMap[pkg.department] || 0) + 1;
    });
    const departmentRanking = Object.entries(deptMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const overduePkgs = packages.filter((pkg) => pkg.status !== 'picked_up' && isOverdue(pkg));
    const pickedUpPkgs = packages.filter((pkg) => pkg.status === 'picked_up' && pkg.pickedUpAt);
    let avgPickupHours = 0;
    if (pickedUpPkgs.length > 0) {
      const totalHours = pickedUpPkgs.reduce((sum, pkg) => {
        return sum + (new Date(pkg.pickedUpAt!).getTime() - new Date(pkg.createdAt).getTime()) / (1000 * 60 * 60);
      }, 0);
      avgPickupHours = Math.round((totalHours / pickedUpPkgs.length) * 10) / 10;
    }

    const coldChainPkgs = packages.filter((pkg) => pkg.isColdChain);
    const coldChainOverdue = coldChainPkgs.filter((pkg) => pkg.status !== 'picked_up' && isOverdue(pkg));
    const coldChainOverdueRatio = coldChainPkgs.length > 0 ? coldChainOverdue.length / coldChainPkgs.length : 0;

    return {
      dailyArrivals: last30Days,
      departmentRanking,
      overdueCount: overduePkgs.length,
      avgPickupHours,
      coldChainOverdueRatio: Math.round(coldChainOverdueRatio * 100),
    };
  },

  getStatusCounts: () => {
    const { packages } = get();
    return {
      new: packages.filter((p) => p.status === 'new').length,
      pending: packages.filter((p) => p.status === 'pending').length,
      picked_up: packages.filter((p) => p.status === 'picked_up').length,
      abnormal: packages.filter((p) => p.status === 'abnormal').length,
    };
  },
}));
