import * as THREE from 'three';

export type RenderMode = 'solid' | 'wireframe' | 'transparent';

export interface ModelInfo {
  vertexCount: number;
  faceCount: number;
  fileSize: number;
  boundingBox: {
    min: THREE.Vector3;
    max: THREE.Vector3;
    size: THREE.Vector3;
  };
  fileName: string;
}

export interface SceneSettings {
  backgroundColor: string;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  renderMode: RenderMode;
  materialColor: string;
  showAxes: boolean;
  showGrid: boolean;
  autoRotate: boolean;
}

export interface HitPoint {
  point: THREE.Vector3;
}

export interface ScreenPoint {
  x: number;
  y: number;
}
