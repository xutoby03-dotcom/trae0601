import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { HitPoint } from '../types';

interface UseRaycasterOptions {
  scene: React.RefObject<THREE.Scene | null>;
  camera: React.RefObject<THREE.PerspectiveCamera | null>;
  containerRef: React.RefObject<HTMLDivElement>;
  onHit?: (hitPoint: HitPoint | null) => void;
}

export function useRaycaster({ scene, camera, containerRef, onHit }: UseRaycasterOptions) {
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const highlightMeshRef = useRef<THREE.Mesh | null>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !scene.current || !camera.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera.current);
    
    const modelGroup = scene.current.children.find(
      child => child instanceof THREE.Group && child.id !== highlightMeshRef.current?.id
    );

    if (!modelGroup) {
      if (highlightMeshRef.current) {
        scene.current.remove(highlightMeshRef.current);
        highlightMeshRef.current.geometry.dispose();
        (highlightMeshRef.current.material as THREE.Material).dispose();
        highlightMeshRef.current = null;
      }
      onHit?.(null);
      return;
    }

    const intersects = raycasterRef.current.intersectObject(modelGroup, true);

    if (intersects.length > 0 && intersects[0].face) {
      const hit = intersects[0];
      
      if (highlightMeshRef.current) {
        scene.current.remove(highlightMeshRef.current);
        highlightMeshRef.current.geometry.dispose();
        (highlightMeshRef.current.material as THREE.Material).dispose();
      }

      const highlightGeometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(9);
      const face = hit.face!;
      const obj = hit.object as THREE.Mesh;
      
      const positions = obj.geometry.attributes.position;
      const transform = obj.matrixWorld;
      
      const v1 = new THREE.Vector3().fromBufferAttribute(positions, face.a).applyMatrix4(transform);
      const v2 = new THREE.Vector3().fromBufferAttribute(positions, face.b).applyMatrix4(transform);
      const v3 = new THREE.Vector3().fromBufferAttribute(positions, face.c).applyMatrix4(transform);
      
      vertices[0] = v1.x; vertices[1] = v1.y; vertices[2] = v1.z;
      vertices[3] = v2.x; vertices[4] = v2.y; vertices[5] = v2.z;
      vertices[6] = v3.x; vertices[7] = v3.y; vertices[8] = v3.z;
      
      highlightGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      
      highlightMeshRef.current = new THREE.Mesh(highlightGeometry, highlightMaterial);
      scene.current.add(highlightMeshRef.current);

      const screenPos = new THREE.Vector3();
      hit.point.clone().project(camera.current);
      screenPos.x = (screenPos.x + 1) / 2 * rect.width + rect.left;
      screenPos.y = (-screenPos.y + 1) / 2 * rect.height + rect.top;

      onHit?.({
        point: hit.point.clone(),
        screenX: event.clientX,
        screenY: event.clientY
      });
    } else {
      if (highlightMeshRef.current) {
        scene.current.remove(highlightMeshRef.current);
        highlightMeshRef.current.geometry.dispose();
        (highlightMeshRef.current.material as THREE.Material).dispose();
        highlightMeshRef.current = null;
      }
      onHit?.(null);
    }
  }, [containerRef, scene, camera, onHit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [containerRef, handleClick]);

  const clearHighlight = useCallback(() => {
    if (highlightMeshRef.current && scene.current) {
      scene.current.remove(highlightMeshRef.current);
      highlightMeshRef.current.geometry.dispose();
      (highlightMeshRef.current.material as THREE.Material).dispose();
      highlightMeshRef.current = null;
    }
    onHit?.(null);
  }, [scene, onHit]);

  return { clearHighlight };
}
