import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import MedicineForm from '@/components/Medicine/MedicineForm';

export default function MedicineFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { medicines, schedules, addMedicine, updateMedicine, addSchedule, updateSchedule, deleteSchedule } =
    useAppStore();

  const medicine = medicines.find((m) => m.id === id);
  const medSchedules = schedules.filter((s) => s.medicineId === id);

  const handleSubmit = (
    medicineData: any,
    schedulesData: { medicineId: string; timeSlot: any; pillsPerTime: number; nextVisitDate?: string; notes?: string }[]
  ) => {
    if (isEdit && medicine) {
      updateMedicine(medicine.id, medicineData);

      medSchedules.forEach((oldSch) => {
        deleteSchedule(oldSch.id);
      });

      schedulesData.forEach((sch) => {
        addSchedule({
          ...sch,
          medicineId: medicine.id,
        });
      });
    } else {
      addMedicine(medicineData);

      setTimeout(() => {
        const latestMed = useAppStore.getState().medicines.slice(-1)[0];
        if (latestMed) {
          schedulesData.forEach((sch) => {
            addSchedule({
              ...sch,
              medicineId: latestMed.id,
            });
          });
        }
      }, 0);
    }
  };

  return (
    <MedicineForm
      title={isEdit ? '编辑药品' : '添加药品'}
      initialMedicine={medicine}
      initialSchedules={medSchedules}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/medicines')}
    />
  );
}
