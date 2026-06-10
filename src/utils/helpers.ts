import { Ticket, Queue } from '@/types';

export const formatTicketNumber = (num: number): string => {
  const letter = 'A';
  const padded = num.toString().padStart(3, '0');
  return `${letter}${padded}`;
};

export const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const calculateWaitTime = (
  position: number,
  estimatedTimePerPerson: number
): number => {
  return position * estimatedTimePerPerson;
};

export const formatWaitTime = (minutes: number): string => {
  if (minutes < 60) {
    return `约 ${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `约 ${hours} 小时 ${mins} 分钟` : `约 ${hours} 小时`;
};

export const getQueuePosition = (
  ticket: Ticket,
  allTickets: Ticket[]
): number => {
  const activeTickets = allTickets
    .filter(t => t.status === 'waiting' || t.status === 'passed' || t.status === 'calling')
    .sort(sortActiveTickets);
  
  const idx = activeTickets.findIndex(t => t.id === ticket.id);
  if (idx <= 0) return 0;
  return idx - (activeTickets[0].status === 'calling' ? 1 : 0);
};

const sortActiveTickets = (a: Ticket, b: Ticket): number => {
  if (a.status === 'calling') return -1;
  if (b.status === 'calling') return 1;

  const aIsWaiting = a.status === 'waiting';
  const bIsWaiting = b.status === 'waiting';

  if (aIsWaiting && !bIsWaiting) return -1;
  if (!aIsWaiting && bIsWaiting) return 1;

  if (aIsWaiting && bIsWaiting) {
    if (a.passedCount !== b.passedCount) return a.passedCount - b.passedCount;
    return a.number - b.number;
  }

  if (!aIsWaiting && !bIsWaiting) {
    const aTime = a.lastPassedAt ? new Date(a.lastPassedAt).getTime() : 0;
    const bTime = b.lastPassedAt ? new Date(b.lastPassedAt).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return a.number - b.number;
  }

  return 0;
};

export const getWaitingList = (tickets: Ticket[]): Ticket[] => {
  return tickets
    .filter(t => t.status === 'waiting' || t.status === 'passed')
    .sort(sortActiveTickets);
};

export const getPassedList = (tickets: Ticket[]): Ticket[] => {
  return tickets
    .filter(t => t.status === 'passed')
    .sort((a, b) => a.number - b.number);
};

export const getCallingTicket = (tickets: Ticket[]): Ticket | undefined => {
  return tickets.find(t => t.status === 'calling');
};

export const getUpcomingTickets = (tickets: Ticket[], count: number = 3): Ticket[] => {
  const waiting = getWaitingList(tickets);
  return waiting.slice(0, count);
};

export const getServedToday = (tickets: Ticket[]): Ticket[] => {
  const today = getTodayString();
  return tickets.filter(t => 
    t.status === 'served' && t.completedAt?.startsWith(today)
  );
};

export const calculateAverageWaitTime = (tickets: Ticket[]): number => {
  const servedToday = getServedToday(tickets);
  if (servedToday.length === 0) return 0;
  
  const totalWait = servedToday.reduce((sum, t) => {
    if (t.calledAt && t.createdAt) {
      const waitMs = new Date(t.calledAt).getTime() - new Date(t.createdAt).getTime();
      return sum + Math.round(waitMs / 60000);
    }
    return sum;
  }, 0);
  
  return Math.round(totalWait / servedToday.length);
};

export const getHourlyDistribution = (tickets: Ticket[]): Record<number, number> => {
  const today = getTodayString();
  const distribution: Record<number, number> = {};
  
  for (let i = 8; i <= 22; i++) {
    distribution[i] = 0;
  }
  
  tickets
    .filter(t => t.createdAt.startsWith(today))
    .forEach(t => {
      const hour = new Date(t.createdAt).getHours();
      if (hour >= 8 && hour <= 22) {
        distribution[hour]++;
      }
    });
  
  return distribution;
};

export const getPeakHour = (distribution: Record<number, number>): number => {
  let peak = 8;
  let max = 0;
  Object.entries(distribution).forEach(([hour, count]) => {
    if (count > max) {
      max = count;
      peak = parseInt(hour);
    }
  });
  return peak;
};

export const getNearbyMessage = (position: number): string => {
  if (position <= 0) return '正在叫号，请到前台！';
  if (position === 1) return '快轮到你了，请做好准备！';
  if (position <= 3) return '马上就到你了，请在附近等候~';
  return '';
};
