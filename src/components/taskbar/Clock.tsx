import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col items-end px-3 py-1 text-xs cursor-default" 
      style={{ color: 'var(--color-text-primary)' }}>
      <span>{formatTime(time)}</span>
      <span className="opacity-80">{formatDate(time)}</span>
    </div>
  );
};

export default Clock;
