import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function InitData() {
  const initData = useStore((state) => state.initData);
  
  useEffect(() => {
    initData();
  }, [initData]);
  
  return null;
}
