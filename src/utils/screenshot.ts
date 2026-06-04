import * as THREE from 'three';

export function takeScreenshot(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
  renderer.render(scene, camera);
  
  const dataURL = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  
  link.download = `model-viewer_${timestamp}.png`;
  link.href = dataURL;
  link.click();
}
