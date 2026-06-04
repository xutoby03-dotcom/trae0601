import * as THREE from 'three';
import { ModelInfo } from '../types';

export function centerAndScaleModel(model: THREE.Object3D, targetSize: number = 5): void {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetSize / maxDim;
  
  model.scale.setScalar(scale);
  model.position.sub(center.multiplyScalar(scale));
}

export function calculateModelInfo(
  model: THREE.Object3D,
  fileSize: number,
  fileName: string
): ModelInfo {
  let vertexCount = 0;
  let faceCount = 0;
  
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      if (geometry.index) {
        faceCount += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        faceCount += geometry.attributes.position.count / 3;
      }
      if (geometry.attributes.position) {
        vertexCount += geometry.attributes.position.count;
      }
    }
  });
  
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  
  return {
    vertexCount: Math.round(vertexCount),
    faceCount: Math.round(faceCount),
    fileSize,
    boundingBox: {
      min: box.min,
      max: box.max,
      size
    },
    fileName
  };
}

export function applyMaterialToModel(
  model: THREE.Object3D,
  color: string,
  renderMode: 'solid' | 'wireframe' | 'transparent'
): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.1,
        roughness: 0.5
      });
      
      switch (renderMode) {
        case 'wireframe':
          material.wireframe = true;
          break;
        case 'transparent':
          material.transparent = true;
          material.opacity = 0.5;
          break;
        default:
          material.wireframe = false;
          material.transparent = false;
          material.opacity = 1;
      }
      
      child.material = material;
    }
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
