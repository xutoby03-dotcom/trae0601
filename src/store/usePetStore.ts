import { create } from "zustand";
import {
  Order,
  OrderStep,
  Employee,
  ServicePackage,
  Pet,
  Abnormality,
  AbnormalityType,
  StepType,
  STEP_META,
  HairLength,
} from "@/types";
import { mockOrders, mockEmployees, mockPackages } from "@/data/mockData";
import { addMinutes } from "@/utils/time";

interface PetStoreState {
  orders: Order[];
  employees: Employee[];
  packages: ServicePackage[];
  selectedOrderId: string | null;

  getOrderById: (id: string) => Order | undefined;
  getCurrentStep: (orderId: string) => OrderStep | null;
  startStep: (orderId: string, stepType: StepType, employeeId: string) => void;
  completeStep: (orderId: string, stepType: StepType, photoUrl?: string, notes?: string) => void;
  addAbnormality: (
    orderId: string,
    type: AbnormalityType,
    description: string,
    photoUrl?: string
  ) => void;
  notifyOwner: (orderId: string, abnormalityId: string) => void;
  createOrder: (
    pet: Omit<Pet, "id" | "createdAt">,
    packageId: string,
    ownerPhone: string
  ) => Order;
  setSelectedOrderId: (id: string | null) => void;
}

let orderCounter = 100;

function generateQueueNumber() {
  orderCounter++;
  return `A${orderCounter.toString().padStart(3, "0")}`;
}

function createEmptySteps(orderId: string): OrderStep[] {
  const types: StepType[] = [
    "reception",
    "bath",
    "dry",
    "trim",
    "ear_paw_care",
    "photo_delivery",
  ];
  return types.map((t) => ({
    id: `${orderId}-step-${t}`,
    orderId,
    stepType: t,
    status: "pending",
  }));
}

export const usePetStore = create<PetStoreState>((set, get) => ({
  orders: mockOrders,
  employees: mockEmployees,
  packages: mockPackages,
  selectedOrderId: null,

  getOrderById: (id) => get().orders.find((o) => o.id === id),

  getCurrentStep: (orderId) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return null;
    return order.steps.find((s) => s.status === "in_progress") || null;
  },

  startStep: (orderId, stepType, employeeId) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;
        const sortedSteps = [...order.steps].sort(
          (a, b) => STEP_META[a.stepType].order - STEP_META[b.stepType].order
        );
        const currentIdx = sortedSteps.findIndex((s) => s.stepType === stepType);
        const newSteps = order.steps.map((s, idx) => {
          const origIdx = sortedSteps.findIndex((ss) => ss.id === s.id);
          if (s.stepType === stepType) {
            return {
              ...s,
              status: "in_progress" as const,
              startTime: new Date(),
              employeeId,
            };
          }
          if (origIdx < currentIdx && s.status !== "completed") {
            return { ...s, status: "completed" as const, endTime: new Date() };
          }
          return s;
        });
        return {
          ...order,
          status: "in_progress",
          steps: newSteps,
        };
      }),
    }));
  },

  completeStep: (orderId, stepType, photoUrl, notes) => {
    set((state) => {
      let updatedStatus: Order["status"] | null = null;
      const newOrders = state.orders.map((order) => {
        if (order.id !== orderId) return order;
        const newSteps = order.steps.map((s) => {
          if (s.stepType === stepType) {
            return {
              ...s,
              status: "completed" as const,
              endTime: new Date(),
              photoUrl: photoUrl || s.photoUrl,
              notes: notes || s.notes,
            };
          }
          return s;
        });
        const allDone = newSteps.every((s) => s.status === "completed");
        if (allDone) updatedStatus = "completed";
        return {
          ...order,
          status: updatedStatus || order.status,
          steps: newSteps,
        };
      });
      return { orders: newOrders };
    });
  },

  addAbnormality: (orderId, type, description, photoUrl) => {
    const newAbn: Abnormality = {
      id: `ab-${Date.now()}`,
      orderId,
      type,
      description,
      photoUrl,
      notifiedOwner: false,
      createdAt: new Date(),
    };
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, abnormalities: [...order.abnormalities, newAbn] }
          : order
      ),
    }));
  },

  notifyOwner: (orderId, abnormalityId) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              abnormalities: order.abnormalities.map((ab) =>
                ab.id === abnormalityId ? { ...ab, notifiedOwner: true } : ab
              ),
            }
          : order
      ),
    }));
  },

  createOrder: (petData, packageId, ownerPhone) => {
    const pkg = get().packages.find((p) => p.id === packageId) || get().packages[0];
    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}`,
      createdAt: new Date(),
    };
    const orderId = `o-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      petId: newPet.id,
      pet: newPet,
      queueNumber: generateQueueNumber(),
      status: "queuing",
      packageId,
      package: pkg,
      steps: createEmptySteps(orderId),
      abnormalities: [],
      createdAt: new Date(),
      estimatedFinish: addMinutes(new Date(), pkg.durationMinutes),
      ownerPhone,
    };
    set((state) => ({
      orders: [...state.orders, newOrder],
      selectedOrderId: orderId,
    }));
    return newOrder;
  },

  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
}));
