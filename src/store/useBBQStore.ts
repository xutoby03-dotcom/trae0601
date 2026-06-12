import { create } from 'zustand';
import type { FoodItem, ClaimInfo, SubstituteInfo, Participant } from '@/types';

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: '1', name: '老王', avatar: '👨‍🍳' },
  { id: '2', name: '小李', avatar: '👩' },
  { id: '3', name: '阿强', avatar: '🧑' },
  { id: '4', name: '大刘', avatar: '👨' },
  { id: '5', name: '小美', avatar: '👩‍🌾' },
];

const INITIAL_ITEMS: FoodItem[] = [
  { id: '1', name: '五花肉', category: '肉类', budget: 60, suggestedQuantity: '2斤', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=thick%20sliced%20pork%20belly%20for%20Korean%20BBQ%2C%20raw%20meat%20on%20cutting%20board%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '老王', actualQuantity: '2斤', cost: 55, estimatedArrival: '10:00', receiptPhoto: undefined } },
  { id: '2', name: '牛排', category: '肉类', budget: 120, suggestedQuantity: '1.5斤', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=raw%20beef%20steak%20marbled%2C%20BBQ%20grilling%2C%20food%20photography&image_size=square', status: '未认领' },
  { id: '3', name: '鸡翅', category: '肉类', budget: 40, suggestedQuantity: '2斤', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=raw%20chicken%20wings%20on%20tray%2C%20BBQ%20ready%2C%20food%20photography&image_size=square', status: '已买到', claim: { buyer: '小李', actualQuantity: '2.5斤', cost: 45, estimatedArrival: '09:30', receiptPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } },
  { id: '4', name: '羊肉串', category: '肉类', budget: 80, suggestedQuantity: '30串', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lamb%20skewers%20for%20BBQ%2C%20raw%20meat%20on%20sticks%2C%20food%20photography&image_size=square', status: '临时缺货' },
  { id: '5', name: '大虾', category: '海鲜', budget: 100, suggestedQuantity: '2斤', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20large%20shrimp%20on%20ice%2C%20seafood%20BBQ%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '阿强', actualQuantity: '2斤', cost: 98, estimatedArrival: '10:30' } },
  { id: '6', name: '生蚝', category: '海鲜', budget: 60, suggestedQuantity: '12只', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oysters%20on%20ice%2C%20seafood%20BBQ%2C%20food%20photography&image_size=square', status: '未认领' },
  { id: '7', name: '玉米', category: '蔬菜', budget: 15, suggestedQuantity: '6根', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20corn%20on%20the%20cob%2C%20vegetables%20for%20BBQ%2C%20food%20photography&image_size=square', status: '已买到', claim: { buyer: '小美', actualQuantity: '8根', cost: 18, estimatedArrival: '09:00', receiptPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } },
  { id: '8', name: '茄子', category: '蔬菜', budget: 10, suggestedQuantity: '4根', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20eggplant%2C%20vegetables%20for%20BBQ%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '大刘', actualQuantity: '4根', cost: 9, estimatedArrival: '10:00' } },
  { id: '9', name: '金针菇', category: '蔬菜', budget: 8, suggestedQuantity: '3包', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=enoki%20mushrooms%20fresh%2C%20BBQ%20vegetable%2C%20food%20photography&image_size=square', status: '未认领' },
  { id: '10', name: '馒头片', category: '主食', budget: 10, suggestedQuantity: '2袋', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sliced%20steamed%20bun%20for%20BBQ%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '小美', actualQuantity: '2袋', cost: 10, estimatedArrival: '09:00' } },
  { id: '11', name: '可乐', category: '饮品', budget: 30, suggestedQuantity: '4瓶', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coca%20cola%20bottles%20cold%20drinks%2C%20BBQ%20party%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '小李', actualQuantity: '6瓶', cost: 36, estimatedArrival: '09:30' } },
  { id: '12', name: '啤酒', category: '饮品', budget: 50, suggestedQuantity: '12罐', needsRefrigeration: true, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cold%20beer%20cans%20for%20BBQ%20party%2C%20food%20photography&image_size=square', status: '未认领' },
  { id: '13', name: '矿泉水', category: '饮品', budget: 20, suggestedQuantity: '2箱', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mineral%20water%20bottles%2C%20BBQ%20party%20drinks%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '阿强', actualQuantity: '2箱', cost: 24, estimatedArrival: '10:30' } },
  { id: '14', name: '烧烤酱', category: '调料', budget: 25, suggestedQuantity: '3瓶', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=BBQ%20sauce%20bottles%20assorted%2C%20condiments%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '大刘', actualQuantity: '3瓶', cost: 27, estimatedArrival: '10:00' } },
  { id: '15', name: '孜然粉', category: '调料', budget: 10, suggestedQuantity: '2罐', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cumin%20powder%20spice%20jar%2C%20BBQ%20seasoning%2C%20food%20photography&image_size=square', status: '已买到', claim: { buyer: '老王', actualQuantity: '2罐', cost: 12, estimatedArrival: '10:00', receiptPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } },
  { id: '16', name: '木炭', category: '耗材', budget: 30, suggestedQuantity: '2箱', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=charcoal%20briquettes%20for%20BBQ%20grill%2C%20food%20photography&image_size=square', status: '已认领', claim: { buyer: '大刘', actualQuantity: '2箱', cost: 35, estimatedArrival: '08:30' } },
  { id: '17', name: '锡纸', category: '耗材', budget: 10, suggestedQuantity: '2卷', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aluminum%20foil%20rolls%20for%20BBQ%2C%20food%20photography&image_size=square', status: '未认领' },
  { id: '18', name: '竹签', category: '耗材', budget: 8, suggestedQuantity: '100根', needsRefrigeration: false, referenceImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bamboo%20skewers%20for%20BBQ%2C%20food%20photography&image_size=square', status: '未认领' },
];

interface BBQStore {
  items: FoodItem[];
  participants: Participant[];
  claimItem: (id: string, claim: ClaimInfo) => void;
  markPurchased: (id: string, receiptPhoto: string) => void;
  markOutOfStock: (id: string) => void;
  addSubstitute: (id: string, substitute: SubstituteInfo) => void;
  updateItemStatus: (id: string, status: FoodItem['status']) => void;
  getTotalCost: () => number;
  getPerPersonCost: () => number;
  getUnclaimedItems: () => FoodItem[];
  getMissingReceipts: () => { buyer: string; item: string }[];
  getUnclaimedRefrigerated: () => FoodItem[];
}

export const useBBQStore = create<BBQStore>((set, get) => ({
  items: INITIAL_ITEMS,
  participants: INITIAL_PARTICIPANTS,

  claimItem: (id, claim) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: '已认领' as const, claim } : item
      ),
    })),

  markPurchased: (id, receiptPhoto) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status: '已买到' as const, claim: { ...item.claim!, receiptPhoto } }
          : item
      ),
    })),

  markOutOfStock: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: '临时缺货' as const } : item
      ),
    })),

  addSubstitute: (id, substitute) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, substitute, status: '已认领' as const, claim: { buyer: '', actualQuantity: substitute.substituteQuantity, cost: substitute.substituteCost, estimatedArrival: '' } } : item
      ),
    })),

  updateItemStatus: (id, status) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })),

  getTotalCost: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.claim?.cost ?? 0), 0);
  },

  getPerPersonCost: () => {
    const { items, participants } = get();
    const totalCost = items.reduce((sum, item) => sum + (item.claim?.cost ?? 0), 0);
    return participants.length > 0 ? totalCost / participants.length : 0;
  },

  getUnclaimedItems: () => {
    const { items } = get();
    return items.filter((item) => item.status === '未认领');
  },

  getMissingReceipts: () => {
    const { items } = get();
    return items
      .filter((item) => (item.status === '已认领' || item.status === '已买到') && item.claim && !item.claim.receiptPhoto)
      .map((item) => ({ buyer: item.claim!.buyer, item: item.name }));
  },

  getUnclaimedRefrigerated: () => {
    const { items } = get();
    return items.filter((item) => item.needsRefrigeration && item.status === '未认领');
  },
}));
