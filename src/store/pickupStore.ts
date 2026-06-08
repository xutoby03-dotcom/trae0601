import { create } from 'zustand';
import type { PickupRequest, RequestStatus, FilterType, OrderTab, ExceptionType } from '@/types/pickup';
import { mockRequests } from '@/data/pickup';
import { currentUser } from '@/data/users';
import dayjs from 'dayjs';

interface PickupState {
  requests: PickupRequest[];
  currentFilter: FilterType;
  orderTab: OrderTab;
  searchKeyword: string;

  setFilter: (filter: FilterType) => void;
  setOrderTab: (tab: OrderTab) => void;
  setSearchKeyword: (keyword: string) => void;
  publishRequest: (data: Omit<PickupRequest, 'id' | 'status' | 'createdAt' | 'publisherId' | 'publisherName' | 'publisherAvatar' | 'publisherBuilding'>) => void;
  acceptRequest: (id: string) => void;
  markPickedUp: (id: string) => void;
  markDelivered: (id: string, photoUrl: string) => void;
  reportException: (id: string, type: ExceptionType, desc: string) => void;
  updatePickupCode: (id: string, newCode: string) => void;
  resolveException: (id: string) => void;

  getFilteredRequests: () => PickupRequest[];
  getMyOrders: () => PickupRequest[];
  getMyPublished: () => PickupRequest[];
  getRequestById: (id: string) => PickupRequest | undefined;
  isExpiring: (deadline: string) => boolean;
}

export const usePickupStore = create<PickupState>((set, get) => ({
  requests: [...mockRequests],
  currentFilter: 'all',
  orderTab: 'active',
  searchKeyword: '',

  setFilter: (filter) => set({ currentFilter: filter }),
  setOrderTab: (tab) => set({ orderTab: tab }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  publishRequest: (data) => {
    const newRequest: PickupRequest = {
      ...data,
      id: `req_${Date.now()}`,
      publisherId: currentUser.id,
      publisherName: currentUser.name,
      publisherAvatar: currentUser.avatar,
      publisherBuilding: currentUser.building,
      status: 'pending',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    };
    set((state) => ({
      requests: [newRequest, ...state.requests],
    }));
  },

  acceptRequest: (id) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'accepted' as RequestStatus,
              acceptedBy: currentUser.id,
              acceptedByName: currentUser.name,
              acceptedByAvatar: currentUser.avatar,
            }
          : req
      ),
    }));
  },

  markPickedUp: (id) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'picked_up' as RequestStatus,
              pickedUpAt: dayjs().format('YYYY-MM-DD HH:mm'),
            }
          : req
      ),
    }));
  },

  markDelivered: (id, photoUrl) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'delivered' as RequestStatus,
              deliveredAt: dayjs().format('YYYY-MM-DD HH:mm'),
              placementPhoto: photoUrl,
            }
          : req
      ),
    }));
  },

  reportException: (id, type, desc) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'exception' as RequestStatus,
              exceptionType: type,
              exceptionDesc: desc,
            }
          : req
      ),
    }));
  },

  updatePickupCode: (id, newCode) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              pickupCode: newCode,
              status: 'accepted' as RequestStatus,
              exceptionType: undefined,
              exceptionDesc: undefined,
            }
          : req
      ),
    }));
  },

  resolveException: (id) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'exception_resolved' as RequestStatus,
            }
          : req
      ),
    }));
  },

  isExpiring: (deadline) => {
    const deadlineTime = dayjs(deadline);
    const now = dayjs();
    const diffHours = deadlineTime.diff(now, 'hour');
    return diffHours <= 3 && diffHours >= 0;
  },

  getFilteredRequests: () => {
    const { requests, currentFilter, searchKeyword, isExpiring } = get();
    let filtered = requests.filter((req) => req.status === 'pending');

    if (searchKeyword) {
      filtered = filtered.filter(
        (req) =>
          req.lockerLocation.includes(searchKeyword) ||
          req.deliveryLocation.includes(searchKeyword) ||
          req.publisherName.includes(searchKeyword) ||
          req.description?.includes(searchKeyword)
      );
    }

    switch (currentFilter) {
      case 'expiring':
        filtered = filtered.filter((req) => isExpiring(req.deadline));
        break;
      case 'building':
        filtered = filtered.filter((req) => req.publisherBuilding === currentUser.building);
        break;
      case 'heavy':
        filtered = filtered.filter((req) => req.packageSize === 'large');
        break;
      default:
        break;
    }

    filtered.sort((a, b) => {
      const aExpiring = isExpiring(a.deadline) ? 0 : 1;
      const bExpiring = isExpiring(b.deadline) ? 0 : 1;
      if (aExpiring !== bExpiring) return aExpiring - bExpiring;
      return dayjs(a.deadline).diff(dayjs(b.deadline));
    });

    return filtered;
  },

  getMyOrders: () => {
    const { requests, orderTab } = get();
    const myOrders = requests.filter((req) => req.acceptedBy === currentUser.id);
    if (orderTab === 'active') {
      return myOrders.filter((req) => ['accepted', 'picked_up'].includes(req.status));
    }
    return myOrders.filter((req) => ['delivered', 'completed', 'exception', 'exception_resolved'].includes(req.status));
  },

  getMyPublished: () => {
    const { requests } = get();
    return requests.filter((req) => req.publisherId === currentUser.id);
  },

  getRequestById: (id) => {
    return get().requests.find((req) => req.id === id);
  },
}));
