import { useMemo } from 'react';
import type { Table, Booking } from '../../types';
import { generateTimeSlots, isTimeBefore, getCurrentTimeString, addMinutesToTime } from '../../utils/timeUtils';

interface TimeSlotPickerProps {
  table: Table;
  selectedDate: string;
  startTime: string;
  endTime: string;
  onTimeChange: (start: string, end: string) => void;
  existingBookings: Booking[];
}

export default function TimeSlotPicker({
  table,
  selectedDate,
  startTime,
  endTime,
  onTimeChange,
  existingBookings,
}: TimeSlotPickerProps) {
  const timeSlots = useMemo(
    () => generateTimeSlots(table.openTimeStart, table.openTimeEnd, 30),
    [table.openTimeStart, table.openTimeEnd]
  );

  const now = getCurrentTimeString();
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const isSlotBooked = (slot: string): boolean => {
    const slotEnd = addMinutesToTime(slot, 30);
    return existingBookings.some((b) => {
      if (b.status === 'cancelled' || b.status === 'no-show') return false;
      return (
        (slot >= b.startTime && slot < b.endTime) ||
        (slotEnd > b.startTime && slotEnd <= b.endTime)
      );
    });
  };

  const isSlotPast = (slot: string): boolean => {
    if (!isToday) return false;
    return isTimeBefore(slot, now);
  };

  const isSlotSelected = (slot: string): boolean => {
    return slot >= startTime && slot < endTime;
  };

  const handleSlotClick = (slot: string) => {
    if (isSlotBooked(slot) || isSlotPast(slot)) return;

    if (!startTime || (startTime && endTime)) {
      onTimeChange(slot, addMinutesToTime(slot, 30));
    } else if (startTime && !endTime) {
      if (slot <= startTime) {
        onTimeChange(slot, addMinutesToTime(slot, 30));
      } else {
        const end = addMinutesToTime(slot, 30);
        onTimeChange(startTime, end);
      }
    }
  };

  const getSlotClass = (slot: string) => {
    const base = 'time-slot';
    if (isSlotPast(slot) || isSlotBooked(slot)) {
      return `${base} time-slot-booked`;
    }
    if (isSlotSelected(slot)) {
      return `${base} time-slot-selected`;
    }
    return `${base} time-slot-available`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        选择时段 <span className="text-gray-400">(点击选择开始和结束时间)</span>
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            type="button"
            className={getSlotClass(slot)}
            onClick={() => handleSlotClick(slot)}
            disabled={isSlotBooked(slot) || isSlotPast(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
      
      {startTime && endTime && (
        <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">已选时长:</span>
            <span className="font-bold text-primary-600 text-lg">
              {startTime} - {endTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
