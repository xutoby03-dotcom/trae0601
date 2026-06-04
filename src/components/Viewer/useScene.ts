import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneSettings } from '../../types';

export type ViewPresetDirection = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'isometric';

const VIEW_DIRECTIONS: Record<ViewPresetDirection, THREE.Vector3> = {
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
  top: new THREE.Vector3(0, 1, 0),
  bottom: new THREE.Vector3(0, -1, 0),
  isometric: new THREE.Vector3(1, 1, 1).normalize(),
};

const DEFAULT_CAMERA_POS = new THREE.Vector3(8, 6, 8);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useScene(containerRef: React.RefObject<HTMLDivElement>) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number>(0);
  const tweenIdRef = useRef<number>(0);
  const initialCameraPosRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_POS.clone());
  const initialTargetRef = useRef<THREE.Vector3>(DEFAULT_TARGET.clone());

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.visible = false;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.visible = false;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  const updateSettings = useCallback((settings: SceneSettings) => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(settings.backgroundColor);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = settings.ambientLightIntensity;
    }
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = settings.directionalLightIntensity;
    }
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = settings.showAxes;
    }
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = settings.showGrid;
    }
    if (controlsRef.current) {
      controlsRef.current.autoRotate = settings.autoRotate;
      controlsRef.current.autoRotateSpeed = 2;
    }
  }, []);

  const addModel = useCallback((model: THREE.Object3D) => {
    if (modelGroupRef.current) {
      while (modelGroupRef.current.children.length > 0) {
        const child = modelGroupRef.current.children[0];
        modelGroupRef.current.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
      modelGroupRef.current.add(model);
    }
  }, []);

  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(DEFAULT_CAMERA_POS);
      controlsRef.current.target.copy(DEFAULT_TARGET);
      controlsRef.current.update();
      initialCameraPosRef.current.copy(DEFAULT_CAMERA_POS);
      initialTargetRef.current.copy(DEFAULT_TARGET);
    }
  }, []);

  const animateToView = useCallback((preset: ViewPresetDirection) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const modelGroup = modelGroupRef.current;
    if (!camera || !controls || !modelGroup) return;

    cancelAnimationFrame(tweenIdRef.current);

    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);

    const fov = camera.fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.8;

    const dir = VIEW_DIRECTIONS[preset];
    const targetPos = center.clone().add(dir.clone().multiplyScalar(dist));

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 600;
    const startTime = performance.now();

    const tween = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);

      camera.position.lerpVectors(startPos, targetPos, eased);
      controls.target.lerpVectors(startTarget, center, eased);
      controls.update();

      if (t < 1) {
        tweenIdRef.current = requestAnimationFrame(tween);
      }
    };

    tweenIdRef.current = requestAnimationFrame(tween);
  }, []);

  const resetToInitial = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    cancelAnimationFrame(tweenIdRef.current);

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const targetPos = initialCameraPosRef.current;
    const targetLookAt = initialTargetRef.current;
    const duration = 600;
    const startTime = performance.now();

    const tween = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);

      camera.position.lerpVectors(startPos, targetPos, eased);
      controls.target.lerpVectors(startTarget, targetLookAt, eased);
      controls.update();

      if (t < 1) {
        tweenIdRef.current = requestAnimationFrame(tween);
      }
    };

    tweenIdRef.current = requestAnimationFrame(tween);
  }, []);

  const saveInitialCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      initialCameraPosRef.current.copy(cameraRef.current.position);
      initialTargetRef.current.copy(controlsRef.current.target);
    }
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return {
    scene: sceneRef,
    camera: cameraRef,
    renderer: rendererRef,
    controls: controlsRef,
    modelGroup: modelGroupRef,
    addModel,
    updateSettings,
    resetCamera,
    animateToView,
    resetToInitial,
    saveInitialCamera
  };
}
