import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkOrder, Contact, CommunicationRecord, QuotationRecord, VisitRecord, CostItem, OrderStatus, Urgency, RoomId, CostCategory } from '@/types'

interface RepairStore {
  orders: WorkOrder[]
  contacts: Contact[]
  addOrder: (order: Omit<WorkOrder, 'id' | 'communications' | 'quotations' | 'visits' | 'costs' | 'createdAt' | 'updatedAt' | 'rating'>) => string
  updateOrder: (id: string, updates: Partial<WorkOrder>) => void
  deleteOrder: (id: string) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  setOrderRating: (id: string, rating: number) => void
  addCommunication: (orderId: string, record: Omit<CommunicationRecord, 'id' | 'orderId' | 'createdAt'>) => void
  addQuotation: (orderId: string, record: Omit<QuotationRecord, 'id' | 'orderId' | 'createdAt'>) => void
  addVisit: (orderId: string, record: Omit<VisitRecord, 'id' | 'orderId'>) => void
  addCost: (orderId: string, item: Omit<CostItem, 'id' | 'orderId'>) => void
  removeCost: (orderId: string, costId: string) => void
  addContact: (contact: Omit<Contact, 'id' | 'avgRating' | 'totalOrders'>) => string
  updateContact: (id: string, updates: Partial<Contact>) => void
}

const generateId = () => Math.random().toString(36).substring(2, 11)

const mockContacts: Contact[] = [
  { id: 'c1', name: '王师傅', phone: '138-0001-2345', type: 'repairman', tags: ['水电', '靠谱'], avgRating: 4.5, totalOrders: 3 },
  { id: 'c2', name: '李师傅', phone: '139-0002-3456', type: 'repairman', tags: ['木工', '价格实惠'], avgRating: 4.0, totalOrders: 2 },
  { id: 'c3', name: '物业小张', phone: '010-8888-9999', type: 'property', tags: ['响应快'], avgRating: 3.5, totalOrders: 5 },
  { id: 'c4', name: '赵师傅', phone: '137-0003-4567', type: 'repairman', tags: ['锁具', '经验丰富'], avgRating: 4.8, totalOrders: 1 },
]

const mockOrders: WorkOrder[] = [
  {
    id: 'o1',
    title: '厨房水龙头漏水',
    description: '厨房洗菜盆的水龙头持续滴水，关紧后仍然渗水，已经放了一个盆在下面接水',
    roomId: 'kitchen',
    urgency: 'high',
    status: 'in_progress',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 200,
    contactId: 'c1',
    appointmentTime: '2026-06-08T14:00:00',
    rating: 0,
    createdAt: '2026-06-01T09:30:00',
    updatedAt: '2026-06-08T14:00:00',
    communications: [
      { id: 'com1', orderId: 'o1', content: '王师傅您好，我家厨房水龙头漏水，方便来看看吗？', direction: 'outgoing', createdAt: '2026-06-01T09:35:00' },
      { id: 'com2', orderId: 'o1', content: '好的，周六下午2点可以过去看', direction: 'incoming', createdAt: '2026-06-01T10:00:00' },
    ],
    quotations: [
      { id: 'q1', orderId: 'o1', quotationBy: '王师傅', amount: 150, note: '换阀芯', createdAt: '2026-06-06T10:00:00' },
    ],
    visits: [
      { id: 'v1', orderId: 'o1', scheduledTime: '2026-06-08T14:00:00', actualTime: '2026-06-08T14:15:00', note: '准时到达，正在检查' },
    ],
    costs: [
      { id: 'cost1', orderId: 'o1', category: 'labor', amount: 80, note: '上门维修费' },
      { id: 'cost2', orderId: 'o1', category: 'material', amount: 70, note: '阀芯替换件' },
    ],
  },
  {
    id: 'o2',
    title: '卫生间灯不亮了',
    description: '卫生间吸顶灯突然不亮了，换了灯泡还是不行，可能是线路问题',
    roomId: 'bathroom',
    urgency: 'medium',
    status: 'scheduled',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 300,
    contactId: 'c1',
    appointmentTime: '2026-06-10T10:00:00',
    rating: 0,
    createdAt: '2026-06-03T20:15:00',
    updatedAt: '2026-06-05T11:00:00',
    communications: [
      { id: 'com3', orderId: 'o2', content: '王师傅，卫生间灯不亮，换了灯泡也不行', direction: 'outgoing', createdAt: '2026-06-03T20:20:00' },
      { id: 'com4', orderId: 'o2', content: '可能是线路问题，我周三上午过来检查', direction: 'incoming', createdAt: '2026-06-04T08:30:00' },
    ],
    quotations: [],
    visits: [
      { id: 'v2', orderId: 'o2', scheduledTime: '2026-06-10T10:00:00', actualTime: '', note: '' },
    ],
    costs: [],
  },
  {
    id: 'o3',
    title: '卧室门锁卡住',
    description: '主卧门锁转动困难，钥匙插进去很难拧动，需要润滑或更换锁芯',
    roomId: 'bedroom',
    urgency: 'low',
    status: 'pending',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 150,
    contactId: 'c4',
    appointmentTime: '',
    rating: 0,
    createdAt: '2026-06-05T18:00:00',
    updatedAt: '2026-06-05T18:00:00',
    communications: [],
    quotations: [],
    visits: [],
    costs: [],
  },
  {
    id: 'o4',
    title: '阳台窗户关不严',
    description: '阳台推拉窗关不严实，刮风时能听到漏风声，冬天怕冷',
    roomId: 'balcony',
    urgency: 'medium',
    status: 'pending',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 400,
    contactId: '',
    appointmentTime: '',
    rating: 0,
    createdAt: '2026-06-06T12:00:00',
    updatedAt: '2026-06-06T12:00:00',
    communications: [],
    quotations: [],
    visits: [],
    costs: [],
  },
  {
    id: 'o5',
    title: '玄关插座松动',
    description: '玄关鞋柜旁的插座面板松动，插拔时晃动，有安全隐患',
    roomId: 'entrance',
    urgency: 'urgent',
    status: 'pending',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 100,
    contactId: '',
    appointmentTime: '',
    rating: 0,
    createdAt: '2026-06-07T07:30:00',
    updatedAt: '2026-06-07T07:30:00',
    communications: [],
    quotations: [],
    visits: [],
    costs: [],
  },
  {
    id: 'o6',
    title: '客厅墙面裂缝修补',
    description: '客厅电视墙上方出现一条约30cm的裂缝，需要修补和重新刷漆',
    roomId: 'living_room',
    urgency: 'low',
    status: 'completed',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 500,
    contactId: 'c2',
    appointmentTime: '2026-05-20T09:00:00',
    rating: 4,
    createdAt: '2026-05-10T15:00:00',
    updatedAt: '2026-05-22T16:00:00',
    communications: [
      { id: 'com5', orderId: 'o6', content: '李师傅，客厅墙面有裂缝，能修补吗？', direction: 'outgoing', createdAt: '2026-05-10T15:30:00' },
      { id: 'com6', orderId: 'o6', content: '可以，我下周三过去', direction: 'incoming', createdAt: '2026-05-11T09:00:00' },
    ],
    quotations: [
      { id: 'q2', orderId: 'o6', quotationBy: '李师傅', amount: 450, note: '含腻子和乳胶漆', createdAt: '2026-05-15T10:00:00' },
    ],
    visits: [
      { id: 'v3', orderId: 'o6', scheduledTime: '2026-05-20T09:00:00', actualTime: '2026-05-20T09:10:00', note: '准时到达，当天完成修补' },
    ],
    costs: [
      { id: 'cost3', orderId: 'o6', category: 'labor', amount: 250, note: '墙面修补人工' },
      { id: 'cost4', orderId: 'o6', category: 'material', amount: 200, note: '腻子和乳胶漆' },
    ],
  },
  {
    id: 'o7',
    title: '卫生间地漏反味',
    description: '卫生间地漏经常有臭味返上来，尤其是夏天，已尝试换防臭地漏芯但效果不佳',
    roomId: 'bathroom',
    urgency: 'high',
    status: 'completed',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 350,
    contactId: 'c1',
    appointmentTime: '2026-04-15T14:00:00',
    rating: 5,
    createdAt: '2026-04-08T10:00:00',
    updatedAt: '2026-04-16T15:00:00',
    communications: [
      { id: 'com7', orderId: 'o7', content: '王师傅，卫生间地漏反味很严重', direction: 'outgoing', createdAt: '2026-04-08T10:30:00' },
    ],
    quotations: [
      { id: 'q3', orderId: 'o7', quotationBy: '王师傅', amount: 300, note: '更换存水弯+管道疏通', createdAt: '2026-04-10T10:00:00' },
    ],
    visits: [
      { id: 'v4', orderId: 'o7', scheduledTime: '2026-04-15T14:00:00', actualTime: '2026-04-15T14:05:00', note: '发现是存水弯干涸，已更换' },
    ],
    costs: [
      { id: 'cost5', orderId: 'o7', category: 'labor', amount: 150, note: '疏通和更换' },
      { id: 'cost6', orderId: 'o7', category: 'material', amount: 120, note: '新存水弯' },
      { id: 'cost7', orderId: 'o7', category: 'other', amount: 30, note: '密封胶' },
    ],
  },
  {
    id: 'o8',
    title: '书房书架固定',
    description: '书房墙上书架松动，需要加固，书比较多怕掉下来',
    roomId: 'study',
    urgency: 'medium',
    status: 'completed',
    beforePhotos: [],
    afterPhotos: [],
    estimatedCost: 200,
    contactId: 'c2',
    appointmentTime: '2026-03-25T10:00:00',
    rating: 4,
    createdAt: '2026-03-20T16:00:00',
    updatedAt: '2026-03-25T12:00:00',
    communications: [],
    quotations: [],
    visits: [
      { id: 'v5', orderId: 'o8', scheduledTime: '2026-03-25T10:00:00', actualTime: '2026-03-25T10:20:00', note: '加固完成，使用了膨胀螺栓' },
    ],
    costs: [
      { id: 'cost8', orderId: 'o8', category: 'labor', amount: 100, note: '加固安装' },
      { id: 'cost9', orderId: 'o8', category: 'material', amount: 50, note: '膨胀螺栓和支架' },
    ],
  },
]

export const useRepairStore = create<RepairStore>()(
  persist(
    (set) => ({
      orders: mockOrders,
      contacts: mockContacts,

      addOrder: (orderData) => {
        const id = 'o' + generateId()
        const now = new Date().toISOString()
        const newOrder: WorkOrder = {
          ...orderData,
          id,
          communications: [],
          quotations: [],
          visits: [],
          costs: [],
          rating: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ orders: [...state.orders, newOrder] }))
        return id
      },

      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
          ),
        }))
      },

      deleteOrder: (id) => {
        set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }))
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        }))
      },

      setOrderRating: (id, rating) => {
        set((state) => {
          const order = state.orders.find((o) => o.id === id)
          let contactsUpdate = state.contacts
          if (order && order.contactId) {
            const contactId = order.contactId
            const contactOrders = state.orders.filter((o) => o.contactId === contactId && o.rating > 0)
            const oldRating = order.rating
            let ratedOrders: typeof contactOrders
            if (oldRating > 0) {
              ratedOrders = contactOrders.map((o) =>
                o.id === id ? { ...o, rating } : o
              )
            } else {
              ratedOrders = [...contactOrders, { ...order, rating }]
            }
            const totalRating = ratedOrders.reduce((s, o) => s + o.rating, 0)
            const totalOrders = state.orders.filter((o) => o.contactId === contactId && o.status === 'completed').length
            contactsUpdate = state.contacts.map((c) =>
              c.id === contactId
                ? { ...c, avgRating: totalRating / ratedOrders.length, totalOrders: Math.max(totalOrders, ratedOrders.length) }
                : c
            )
          }
          return {
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, rating, updatedAt: new Date().toISOString() } : o
            ),
            contacts: contactsUpdate,
          }
        })
      },

      addCommunication: (orderId, record) => {
        const comId = 'com' + generateId()
        const newCom: CommunicationRecord = {
          ...record,
          id: comId,
          orderId,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, communications: [...o.communications, newCom], updatedAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      addQuotation: (orderId, record) => {
        const qId = 'q' + generateId()
        const newQ: QuotationRecord = {
          ...record,
          id: qId,
          orderId,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, quotations: [...o.quotations, newQ], updatedAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      addVisit: (orderId, record) => {
        const vId = 'v' + generateId()
        const newV: VisitRecord = { ...record, id: vId, orderId }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, visits: [...o.visits, newV], updatedAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      addCost: (orderId, item) => {
        const costId = 'cost' + generateId()
        const newCost: CostItem = { ...item, id: costId, orderId }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, costs: [...o.costs, newCost], updatedAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      removeCost: (orderId, costId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, costs: o.costs.filter((c) => c.id !== costId), updatedAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      addContact: (contactData) => {
        const id = 'c' + generateId()
        const newContact: Contact = {
          ...contactData,
          id,
          avgRating: 0,
          totalOrders: 0,
        }
        set((state) => ({ contacts: [...state.contacts, newContact] }))
        return id
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },
    }),
    { name: 'home-repair-store' }
  )
)
