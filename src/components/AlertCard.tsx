import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import type { Alert } from '../../shared/types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { resolveAlert } = useAppStore();
  const navigate = useNavigate();

  const getAlertIcon = () => {
    if (alert.type === 'low_stock') return AlertTriangle;
    return TrendingUp;
  };

  const getAlertColor = () => {
    if (alert.level === 'danger') return 'red';
    return 'orange';
  };

  const Icon = getAlertIcon();
  const color = getAlertColor();

  const handleResolve = async () => {
    await resolveAlert(alert.id);
  };

  const handleReplenish = () => {
    navigate('/replenishments/new');
  };

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      badge: 'danger' as const,
      gradient: 'from-red-500/10 to-red-500/5',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500',
      badge: 'warning' as const,
      gradient: 'from-orange-500/10 to-orange-500/5',
    },
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <Card
      className={`border-l-4 ${classes.border} bg-gradient-to-r ${classes.gradient}`}
      hover={!alert.isResolved}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-xl ${classes.bg} ${
                !alert.isResolved ? 'animate-breathe' : ''
              }`}
            >
              <Icon className={`w-6 h-6 ${classes.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {alert.printerLocation}
                </h4>
                <Badge variant={classes.badge}>
                  {alert.type === 'low_stock' ? '低库存' : '异常领用'}
                </Badge>
                {alert.isResolved && (
                  <Badge variant="success">已处理</Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(alert.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          {!alert.isResolved && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleReplenish}
              >
                去补货
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResolve}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                标记已处理
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
