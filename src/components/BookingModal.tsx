import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Building2, User, Car, CalendarDays, Users, MapPin, Clock, Ticket } from 'lucide-react';
import type { BookingFormData, ValidationErrors } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { validateBookingForm } from '@/utils/validator';
import { getEndOfDayDateTimeLocal, getTodayDateTimeLocal } from '@/utils/dateUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (visitorId: string) => void;
}

const DURATION_OPTIONS = [
  { value: 4, label: '4小时（半天）' },
  { value: 8, label: '8小时（全天）' },
  { value: 12, label: '12小时（全天加长）' },
  { value: 24, label: '24小时（通宵）' },
];

export default function BookingModal({ open, onClose, onSuccess }: Props) {
  const departments = useAppStore((s) => s.departments);
  const employees = useAppStore((s) => s.employees);
  const addVisitor = useAppStore((s) => s.addVisitor);

  const [form, setForm] = useState<BookingFormData>({
    name: '',
    company: '',
    plateNumber: '',
    departmentId: '',
    meetingRoom: '',
    expectedArrival: getTodayDateTimeLocal(1),
    expectedDeparture: getEndOfDayDateTimeLocal(),
    hostId: '',
    validHours: 8,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        company: '',
        plateNumber: '',
        departmentId: '',
        meetingRoom: '',
        expectedArrival: getTodayDateTimeLocal(1),
        expectedDeparture: getEndOfDayDateTimeLocal(),
        hostId: '',
        validHours: 8,
      });
      setErrors({});
      setSubmitting(false);
      setSubmitError(null);
    }
  }, [open]);

  const hostOptions = useMemo(() => {
    if (!form.departmentId) return [];
    return employees.filter((e) => e.departmentId === form.departmentId && e.role === 'host');
  }, [employees, form.departmentId]);

  function updateField<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as keyof ValidationErrors];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateBookingForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    setTimeout(() => {
      try {
        const { visitor } = addVisitor(form);
        onSuccess?.(visitor.id);
        onClose();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : '发券失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    }, 400);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-soft"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-card bg-white shadow-card-hover"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between px-7 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Ticket size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">访客预约 & 发券</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">填写访客信息，系统自动生成停车券</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-170px)] px-7 py-6 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field label="访客姓名" icon={<User size={16} />} error={errors.name} required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="请输入访客姓名"
                    className={inputClass(!!errors.name)}
                  />
                </Field>

                <Field label="所属公司" icon={<Building2 size={16} />} error={errors.company} required>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    placeholder="请输入所属公司"
                    className={inputClass(!!errors.company)}
                  />
                </Field>

                <Field
                  label="车牌号"
                  icon={<Car size={16} />}
                  error={errors.plateNumber}
                  required
                  hint="无车牌不能发放停车券"
                >
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => updateField('plateNumber', e.target.value.toUpperCase())}
                    placeholder="例：京A12345 / 粤BD12345"
                    className={inputClass(!!errors.plateNumber) + ' font-mono uppercase tracking-wider'}
                  />
                </Field>

                <Field label="到访部门" icon={<Users size={16} />} error={errors.departmentId} required>
                  <select
                    value={form.departmentId}
                    onChange={(e) => {
                      updateField('departmentId', e.target.value);
                      updateField('hostId', '');
                    }}
                    className={inputClass(!!errors.departmentId)}
                  >
                    <option value="">请选择到访部门</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="会议室" icon={<MapPin size={16} />} error={errors.meetingRoom} required>
                  <input
                    type="text"
                    value={form.meetingRoom}
                    onChange={(e) => updateField('meetingRoom', e.target.value)}
                    placeholder="例：A座301-创新厅"
                    className={inputClass(!!errors.meetingRoom)}
                  />
                </Field>

                <Field label="接待人" icon={<User size={16} />} error={errors.hostId} required>
                  <select
                    value={form.hostId}
                    onChange={(e) => updateField('hostId', e.target.value)}
                    disabled={!form.departmentId}
                    className={inputClass(!!errors.hostId)}
                  >
                    <option value="">
                      {form.departmentId ? '请选择接待人' : '请先选择到访部门'}
                    </option>
                    {hostOptions.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} · {h.phone}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="预计到达" icon={<CalendarDays size={16} />} error={errors.expectedArrival} required>
                  <input
                    type="datetime-local"
                    value={form.expectedArrival}
                    onChange={(e) => updateField('expectedArrival', e.target.value)}
                    className={inputClass(!!errors.expectedArrival)}
                  />
                </Field>

                <Field
                  label="预计离开"
                  icon={<CalendarDays size={16} />}
                  error={errors.expectedDeparture}
                  required
                >
                  <input
                    type="datetime-local"
                    value={form.expectedDeparture}
                    onChange={(e) => updateField('expectedDeparture', e.target.value)}
                    className={inputClass(!!errors.expectedDeparture)}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="停车券有效时长" icon={<Clock size={16} />}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('validHours', opt.value)}
                          className={
                            'px-3 py-2.5 rounded-lg text-sm border transition-all font-medium ' +
                            (form.validHours === opt.value
                              ? 'bg-primary-700 border-primary-700 text-white shadow-button'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-primary-300 hover:bg-primary-50')
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-neutral-100">
                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-lg bg-accent-50 border border-accent-200 text-accent-700 text-xs flex items-start gap-2 overflow-hidden"
                    >
                      <span className="mt-0.5 font-bold">!</span>
                      <span>{submitError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-dot" />
                    提交后系统自动生成停车券并扣减库存
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary-700 text-white hover:bg-primary-600 shadow-button hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? '提交中...' : '确认预约并发券'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function inputClass(hasError: boolean): string {
  return (
    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-neutral-800 bg-white placeholder:text-neutral-400 transition-all outline-none focus:ring-2 ' +
    (hasError
      ? 'border-accent-400 focus:border-accent-500 focus:ring-accent-100'
      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100 hover:border-neutral-300')
  );
}

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, icon, error, required, hint, children }: FieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-2 text-sm font-medium text-neutral-700">
        <span className="text-neutral-400">{icon}</span>
        {label}
        {required && <span className="text-accent-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-accent-600 flex items-start gap-1">
          <span className="mt-0.5">!</span>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}
