import { useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { centerAndScaleModel, calculateModelInfo, applyMaterialToModel } from '../../utils/modelUtils';
import { ModelInfo, RenderMode } from '../../types';

export function useModelLoader() {
  const loadModel = useCallback(async (
    file: File,
    materialColor: string,
    renderMode: RenderMode
  ): Promise<{ model: THREE.Object3D; info: ModelInfo }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const extension = file.name.split('.').pop()?.toLowerCase();

      reader.onload = async (event) => {
        try {
          let model: THREE.Object3D;

          if (extension === 'stl') {
            const loader = new STLLoader();
            const geometry = loader.parse(event.target?.result as ArrayBuffer);
            geometry.computeVertexNormals();
            const material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(materialColor),
              metalness: 0.1,
              roughness: 0.5
            });
            model = new THREE.Mesh(geometry, material);
          } else if (extension === 'obj') {
            const loader = new OBJLoader();
            model = loader.parse(event.target?.result as string);
          } else if (extension === 'glb' || extension === 'gltf') {
            const loader = new GLTFLoader();
            const gltf = await loader.parseAsync(event.target?.result as ArrayBuffer, '');
            model = gltf.scene;
          } else {
            reject(new Error('不支持的文件格式'));
            return;
          }

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          centerAndScaleModel(model);
          
          if (extension !== 'glb' && extension !== 'gltf') {
            applyMaterialToModel(model, materialColor, renderMode);
          }

          const info = calculateModelInfo(model, file.size, file.name);
          resolve({ model, info });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('文件读取失败'));

      if (extension === 'glb' || extension === 'stl') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, []);

  return { loadModel };
}
