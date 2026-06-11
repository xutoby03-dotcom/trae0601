import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useFoodStore } from '@/store/foodStore';
import './app.scss';

function App(props) {
  const init = useFoodStore(state => state.init);
  const updateStatuses = useFoodStore(state => state.updateStatuses);

  useEffect(() => {
    init();
    console.log('[App] Initialized food store');
  }, [init]);

  useDidShow(() => {
    updateStatuses();
    console.log('[App] onShow: updated food statuses');
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
