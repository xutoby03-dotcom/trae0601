import React from 'react';
import { NavLink } from 'react-router-dom';
import { Music, Play, Layers, Mic, Heart, Guitar } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', label: '和弦速查', icon: Music },
  { path: '/practice', label: '听音练习', icon: Play },
  { path: '/progression', label: '和弦进行', icon: Layers },
  { path: '/recognition', label: '录音识别', icon: Mic },
  { path: '/favorites', label: '收藏夹', icon: Heart },
];

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Guitar className="w-6 h-6 text-white" />
            </div>
            <h1 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              GuitarChord
            </h1>
          </div>
          
          <div className="flex gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    isActive
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-amber-200 hover:bg-amber-700 hover:text-white'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
