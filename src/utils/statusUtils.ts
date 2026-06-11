import { Priority, TodoStatus, PRIORITY_LABELS, STATUS_LABELS } from '../types';

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'critical':
      return 'bg-danger-500 text-white';
    case 'high':
      return 'bg-accent-500 text-white';
    case 'medium':
      return 'bg-info-500 text-white';
    case 'low':
      return 'bg-gray-400 text-white';
  }
}

export function getPriorityBadgeClass(priority: Priority): string {
  switch (priority) {
    case 'critical':
      return 'bg-danger-50 text-danger-600 border border-danger-100';
    case 'high':
      return 'bg-accent-50 text-accent-600 border border-accent-100';
    case 'medium':
      return 'bg-info-50 text-info-600 border border-info-100';
    case 'low':
      return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
}

export function getStatusColor(status: TodoStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-700';
    case 'in_progress':
      return 'bg-info-100 text-info-600';
    case 'completed':
      return 'bg-success-100 text-success-600';
    case 'overdue':
      return 'bg-danger-100 text-danger-600';
  }
}

export function getStatusLabel(status: TodoStatus): string {
  return STATUS_LABELS[status];
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority];
}
