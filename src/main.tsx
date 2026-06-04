import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initDB } from './db';

async function bootstrap() {
  try {
    await initDB();
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize database:', error);
    document.body.innerHTML = '<div style="padding: 20px; color: red;">数据库初始化失败，请刷新页面重试</div>';
  }
}

bootstrap();
