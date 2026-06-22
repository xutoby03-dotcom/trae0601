import type { Play, Player, Route, FakeNode, Disc } from '../types';

export function createMockPlay(): Play {
  const players: Player[] = [
    { id: 'o1', type: 'offense', label: 'O1', startPosition: { x: 20, y: 18.5 } },
    { id: 'o2', type: 'offense', label: 'O2', startPosition: { x: 30, y: 10 } },
    { id: 'o3', type: 'offense', label: 'O3', startPosition: { x: 30, y: 27 } },
    { id: 'o4', type: 'offense', label: 'O4', startPosition: { x: 45, y: 15 } },
    { id: 'o5', type: 'offense', label: 'O5', startPosition: { x: 45, y: 22 } },
    { id: 'd1', type: 'defense', label: 'D1', startPosition: { x: 22, y: 18.5 } },
    { id: 'd2', type: 'defense', label: 'D2', startPosition: { x: 32, y: 10 } },
    { id: 'd3', type: 'defense', label: 'D3', startPosition: { x: 32, y: 27 } },
    { id: 'd4', type: 'defense', label: 'D4', startPosition: { x: 47, y: 15 } },
    { id: 'd5', type: 'defense', label: 'D5', startPosition: { x: 47, y: 22 } },
  ];

  const disc: Disc = {
    id: 'disc1',
    position: { x: 20, y: 18.5 },
    holderId: 'o1',
    releaseTime: 3,
  };

  const routes: Route[] = [
    {
      id: 'r1',
      playerId: 'o2',
      color: '#ff6b35',
      keyframes: [
        { id: 'k1', time: 1, position: { x: 40, y: 8 } },
        { id: 'k2', time: 2.5, position: { x: 55, y: 12 } },
        { id: 'k3', time: 4, position: { x: 70, y: 18.5 } },
      ],
    },
    {
      id: 'r2',
      playerId: 'o3',
      color: '#f7931e',
      keyframes: [
        { id: 'k4', time: 1.5, position: { x: 38, y: 30 } },
        { id: 'k5', time: 3, position: { x: 50, y: 25 } },
      ],
    },
    {
      id: 'r3',
      playerId: 'o4',
      color: '#ffc857',
      keyframes: [
        { id: 'k6', time: 0.8, position: { x: 52, y: 20 } },
        { id: 'k7', time: 2, position: { x: 60, y: 28 } },
      ],
    },
    {
      id: 'r4',
      playerId: 'o5',
      color: '#e97451',
      keyframes: [
        { id: 'k8', time: 1, position: { x: 55, y: 18 } },
        { id: 'k9', time: 2.5, position: { x: 65, y: 10 } },
      ],
    },
    {
      id: 'r5',
      playerId: 'd2',
      color: '#0077b6',
      keyframes: [
        { id: 'k10', time: 1, position: { x: 42, y: 10 } },
        { id: 'k11', time: 2.5, position: { x: 57, y: 14 } },
        { id: 'k12', time: 4, position: { x: 72, y: 20 } },
      ],
    },
    {
      id: 'r6',
      playerId: 'd3',
      color: '#00b4d8',
      keyframes: [
        { id: 'k13', time: 1.5, position: { x: 40, y: 28 } },
        { id: 'k14', time: 3, position: { x: 52, y: 23 } },
      ],
    },
  ];

  const fakeNodes: FakeNode[] = [
    {
      id: 'f1',
      playerId: 'o2',
      position: { x: 35, y: 8 },
      time: 0.5,
      direction: 'out',
    },
    {
      id: 'f2',
      playerId: 'o4',
      position: { x: 48, y: 16 },
      time: 0.5,
      direction: 'in',
    },
  ];

  return {
    id: 'play-1',
    name: '横向切入战术',
    duration: 6,
    players,
    disc,
    routes,
    fakeNodes,
    transferWindows: [],
    collisionRisks: [],
    gaps: [],
  };
}
