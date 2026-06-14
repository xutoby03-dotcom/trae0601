import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repair, RepairPhoto, MaintenanceLog, Severity } from '@/types';
import { useFacilityStore } from './facilityStore';

const generateId = (): string => Date.now().toString() + Math.random().toString(36).slice(2, 9);

interface RepairState {
  repairs: Repair[];
  repairPhotos: RepairPhoto[];
  maintenanceLogs: MaintenanceLog[];
  addRepair: (
    data: Omit<Repair, 'id' | 'created_at' | 'status'> & { severity: Severity; _reportPhotos?: string[] }
  ) => void;
  assignRepair: (id: string, assigned_to: string) => void;
  startRepair: (id: string) => void;
  completeRepair: (
    id: string,
    beforePhotos: string[],
    afterPhotos: string[],
    remark: string
  ) => void;
  reviewRepair: (
    id: string,
    passed: boolean,
    reviewer: string,
    comment: string
  ) => void;
  cancelRepair: (id: string) => void;
  updateRepair: (id: string, data: Partial<Repair>) => void;
  getRepairById: (id: string) => Repair | undefined;
  getPhotosByRepairId: (
    repairId: string
  ) => { report: RepairPhoto[]; before: RepairPhoto[]; after: RepairPhoto[] };
  getLogsByRepairId: (repairId: string) => MaintenanceLog[];
}

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      repairs: [],
      repairPhotos: [],
      maintenanceLogs: [],
      addRepair: (data) => {
        const now = new Date().toISOString();
        const id = generateId();
        const reportUrls = data._reportPhotos || [];
        const newRepair: Repair = {
          ...data,
          id,
          status: 'pending',
          created_at: now,
        } as Repair;
        const reportPhotos: RepairPhoto[] = reportUrls.map((url) => ({
          id: generateId(),
          repair_id: id,
          photo_type: 'report',
          photo_url: url,
          uploaded_at: now,
        }));
        const createLog: MaintenanceLog = {
          id: generateId(),
          repair_id: id,
          action: 'create',
          operator: data.reporter,
          remark: '提交报修申请',
          created_at: now,
        };
        let newLogs = [createLog];
        if (data.severity === 'high' || data.severity === 'critical') {
          useFacilityStore.getState().setFacilityStatus(data.facility_id, 'inactive');
          const autoLog: MaintenanceLog = {
            id: generateId(),
            repair_id: id,
            action: 'auto_disable',
            operator: 'system',
            remark: '高风险自动停用设施',
            created_at: now,
          };
          newLogs = [...newLogs, autoLog];
        }
        set({
          repairs: [...get().repairs, newRepair],
          repairPhotos: [...get().repairPhotos, ...reportPhotos],
          maintenanceLogs: [...get().maintenanceLogs, ...newLogs],
        });
      },
      assignRepair: (id, assigned_to) => {
        const now = new Date().toISOString();
        set({
          repairs: get().repairs.map((r) =>
            r.id === id
              ? { ...r, assigned_to, assigned_at: now, status: 'assigned' }
              : r
          ),
          maintenanceLogs: [
            ...get().maintenanceLogs,
            {
              id: generateId(),
              repair_id: id,
              action: 'assign',
              operator: assigned_to,
              remark: '分派维修人员',
              created_at: now,
            },
          ],
        });
      },
      startRepair: (id) => {
        const now = new Date().toISOString();
        const repair = get().repairs.find((r) => r.id === id);
        if (repair) {
          useFacilityStore.getState().setFacilityStatus(repair.facility_id, 'maintenance');
        }
        set({
          repairs: get().repairs.map((r) =>
            r.id === id ? { ...r, started_at: now, status: 'in_progress' } : r
          ),
          maintenanceLogs: [
            ...get().maintenanceLogs,
            {
              id: generateId(),
              repair_id: id,
              action: 'start',
              operator: repair?.assigned_to || 'unknown',
              remark: '开始维修',
              created_at: now,
            },
          ],
        });
      },
      completeRepair: (id, beforePhotos, afterPhotos, remark) => {
        const now = new Date().toISOString();
        const repair = get().repairs.find((r) => r.id === id);
        const photos: RepairPhoto[] = [
          ...beforePhotos.map((url) => ({
            id: generateId(),
            repair_id: id,
            photo_type: 'before' as const,
            photo_url: url,
            uploaded_at: now,
          })),
          ...afterPhotos.map((url) => ({
            id: generateId(),
            repair_id: id,
            photo_type: 'after' as const,
            photo_url: url,
            uploaded_at: now,
          })),
        ];
        set({
          repairs: get().repairs.map((r) =>
            r.id === id ? { ...r, completed_at: now, status: 'review' } : r
          ),
          repairPhotos: [...get().repairPhotos, ...photos],
          maintenanceLogs: [
            ...get().maintenanceLogs,
            {
              id: generateId(),
              repair_id: id,
              action: 'complete',
              operator: repair?.assigned_to || 'unknown',
              remark,
              created_at: now,
            },
          ],
        });
      },
      reviewRepair: (id, passed, reviewer, comment) => {
        const now = new Date().toISOString();
        const repair = get().repairs.find((r) => r.id === id);
        if (passed) {
          if (repair) {
            useFacilityStore.getState().setFacilityStatus(repair.facility_id, 'active');
          }
          set({
            repairs: get().repairs.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: 'completed',
                    reviewer,
                    reviewed_at: now,
                    review_comment: comment,
                  }
                : r
            ),
            maintenanceLogs: [
              ...get().maintenanceLogs,
              {
                id: generateId(),
                repair_id: id,
                action: 'review',
                operator: reviewer,
                remark: comment,
                created_at: now,
              },
            ],
          });
        } else {
          set({
            repairs: get().repairs.map((r) =>
              r.id === id ? { ...r, status: 'in_progress' } : r
            ),
            maintenanceLogs: [
              ...get().maintenanceLogs,
              {
                id: generateId(),
                repair_id: id,
                action: 'reject',
                operator: reviewer,
                remark: comment,
                created_at: now,
              },
            ],
          });
        }
      },
      cancelRepair: (id) => {
        const now = new Date().toISOString();
        set({
          repairs: get().repairs.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' } : r
          ),
          maintenanceLogs: [
            ...get().maintenanceLogs,
            {
              id: generateId(),
              repair_id: id,
              action: 'cancel',
              operator: 'system',
              remark: '取消报修单',
              created_at: now,
            },
          ],
        });
      },
      updateRepair: (id, data) => {
        set({
          repairs: get().repairs.map((r) => (r.id === id ? { ...r, ...data } : r)),
        });
      },
      getRepairById: (id) => {
        return get().repairs.find((r) => r.id === id);
      },
      getPhotosByRepairId: (repairId) => {
        const photos = get().repairPhotos.filter((p) => p.repair_id === repairId);
        return {
          report: photos.filter((p) => p.photo_type === 'report'),
          before: photos.filter((p) => p.photo_type === 'before'),
          after: photos.filter((p) => p.photo_type === 'after'),
        };
      },
      getLogsByRepairId: (repairId) => {
        return get()
          .maintenanceLogs.filter((l) => l.repair_id === repairId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      },
    }),
    {
      name: 'playground-repairs',
    }
  )
);
