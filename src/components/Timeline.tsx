import React, { useEffect, useRef } from 'react';
import { TimeUnit, CalendarConfig } from '../types';
import { getNextUnitDate, getUnitLabel, parseDate, getToday, isWorkDay } from '../utils/dateUtils';

interface TimelineProps {
  timeUnit: TimeUnit;
  startDate: string;
  endDate: string;
  dayWidth: number;
  scrollLeft: number;
  onScroll: (scrollLeft: number) => void;
  calendar: CalendarConfig;
}

const Timeline: React.FC<TimelineProps> = ({
  timeUnit,
  startDate,
  endDate,
  dayWidth,
  scrollLeft,
  onScroll,
  calendar,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && scrollRef.current.scrollLeft !== scrollLeft) {
      scrollRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  const handleScroll = () => {
    if (scrollRef.current) {
      onScroll(scrollRef.current.scrollLeft);
    }
  };

  const getUnitWidth = (unit: TimeUnit): number => {
    switch (unit) {
      case 'day': return dayWidth;
      case 'week': return dayWidth * 7;
      case 'month': return dayWidth * 30;
      case 'quarter': return dayWidth * 90;
    }
  };

  const generateTimeUnits = () => {
    const units: { date: string; width: number; label: string }[] = [];
    let current = startDate;

    while (current <= endDate) {
      const next = getNextUnitDate(current, timeUnit);
      const unitWidth = getUnitWidth(timeUnit);
      const date = parseDate(current);
      const isWeekend = !isWorkDay(date, calendar);
      const isToday = current === getToday();

      units.push({
        date: current,
        width: unitWidth,
        label: getUnitLabel(current, timeUnit),
      });

      current = next;
    }

    return units;
  };

  const generateDayUnits = () => {
    const units: { date: string; width: number; isWeekend: boolean; isToday: boolean }[] = [];
    let current = startDate;
    const today = getToday();

    while (current <= endDate) {
      const date = parseDate(current);
      const isWeekend = !isWorkDay(date, calendar);
      const isToday = current === today;

      units.push({
        date: current,
        width: dayWidth,
        isWeekend,
        isToday,
      });

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      current = `${year}-${month}-${day}`;
    }

    return units;
  };

  const timeUnits = generateTimeUnits();
  const dayUnits = generateDayUnits();
  const totalWidth = dayUnits.reduce((sum, d) => sum + d.width, 0);

  return (
    <div className="gantt-right-header">
      <div
        className="timeline-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="timeline-content" style={{ width: totalWidth }}>
          {timeUnit === 'day' ? (
            <div className="timeline-grid" style={{ height: '100%' }}>
              {dayUnits.map((unit) => (
                <div
                  key={unit.date}
                  className={`timeline-unit ${unit.isWeekend ? 'weekend' : ''} ${unit.isToday ? 'today' : ''}`}
                  style={{ width: unit.width }}
                >
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>
                    {parseDate(unit.date).getMonth() + 1}月
                  </div>
                  <div style={{ fontWeight: unit.isToday ? 600 : 400 }}>
                    {parseDate(unit.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="timeline-grid" style={{ height: '100%' }}>
              {timeUnits.map((unit, index) => (
                <div
                  key={`${unit.date}-${index}`}
                  className="timeline-unit"
                  style={{ width: unit.width }}
                >
                  {unit.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
