import { useState, useCallback, useRef } from 'react';
import { ThreeCanvas, ThreeCanvasHandle } from './components/Viewer/ThreeCanvas';
import { BackgroundControl } from './components/ControlPanel/BackgroundControl';
import { LightControl } from './components/ControlPanel/LightControl';
import { RenderModeControl } from './components/ControlPanel/RenderModeControl';
import { MaterialControl } from './components/ControlPanel/MaterialControl';
import { HelperSwitch } from './components/ControlPanel/HelperSwitch';
import { ViewPresetControl } from './components/ControlPanel/ViewPresetControl';
import { ModelInfo } from './components/InfoPanel/ModelInfo';
import { UploadButton } from './components/Toolbar/UploadButton';
import { ScreenshotButton } from './components/Toolbar/ScreenshotButton';
import { CoordinateTooltip } from './components/Tooltip/CoordinateTooltip';
import { SceneSettings, ModelInfo as ModelInfoType, HitPoint } from './types';
import { ViewPresetDirection } from './components/Viewer/useScene';

const initialSettings: SceneSettings = {
  backgroundColor: '#1a1a2e',
  ambientLightIntensity: 0.4,
  directionalLightIntensity: 0.8,
  renderMode: 'solid',
  materialColor: '#6366f1',
  showAxes: false,
  showGrid: false,
  autoRotate: false
};

function App() {
  const [settings, setSettings] = useState<SceneSettings>(initialSettings);
  const [fileToLoad, setFileToLoad] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfoType | null>(null);
  const [hitPoint, setHitPoint] = useState<HitPoint | null>(null);
  const [screenshotTrigger, setScreenshotTrigger] = useState<number>(0);
  const canvasRef = useRef<ThreeCanvasHandle>(null);

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setFileToLoad(file);
    setHitPoint(null);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleModelLoaded = useCallback((info: ModelInfoType) => {
    setModelInfo(info);
  }, []);

  const handleScreenshot = useCallback(() => {
    setScreenshotTrigger(prev => prev + 1);
  }, []);

  const handleViewPreset = useCallback((preset: ViewPresetDirection) => {
    canvasRef.current?.animateToView(preset);
  }, []);

  const handleResetView = useCallback(() => {
    canvasRef.current?.clearHighlight();
    setHitPoint(null);
    setSettings(prev => ({ ...prev, autoRotate: false }));
    canvasRef.current?.resetToInitial();
  }, []);

  const updateSetting = useCallback(<K extends keyof SceneSettings>(
    key: K,
    value: SceneSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex flex-col overflow-hidden">
      <header className="h-14 flex items-center justify-between px-4 bg-panel/80 glass-panel border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <h1 className="text-white font-semibold text-lg">3D 模型查看器</h1>
          <span className="text-xs text-gray-500 hidden sm:inline">STL / OBJ / GLB</span>
        </div>
        
        <div className="flex items-center gap-3">
          <UploadButton onUpload={handleFileUpload} isLoading={isLoading} />
          <ScreenshotButton onClick={handleScreenshot} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-panel/60 glass-panel border-r border-white/5 p-4 overflow-y-auto flex-shrink-0 hidden lg:block">
          <div className="space-y-1">
            <ViewPresetControl
              onViewPreset={handleViewPreset}
              onReset={handleResetView}
              hasModel={modelInfo !== null}
            />
            
            <div className="h-px bg-white/10 my-4" />
            
            <BackgroundControl
              backgroundColor={settings.backgroundColor}
              onChange={(color) => updateSetting('backgroundColor', color)}
            />
            
            <div className="h-px bg-white/10 my-4" />
            
            <LightControl
              ambientIntensity={settings.ambientLightIntensity}
              directionalIntensity={settings.directionalLightIntensity}
              onAmbientChange={(value) => updateSetting('ambientLightIntensity', value)}
              onDirectionalChange={(value) => updateSetting('directionalLightIntensity', value)}
            />
            
            <div className="h-px bg-white/10 my-4" />
            
            <RenderModeControl
              renderMode={settings.renderMode}
              onChange={(mode) => updateSetting('renderMode', mode)}
            />
            
            <div className="h-px bg-white/10 my-4" />
            
            <MaterialControl
              materialColor={settings.materialColor}
              onChange={(color) => updateSetting('materialColor', color)}
            />
            
            <div className="h-px bg-white/10 my-4" />
            
            <HelperSwitch
              showAxes={settings.showAxes}
              showGrid={settings.showGrid}
              autoRotate={settings.autoRotate}
              onAxesChange={(value) => updateSetting('showAxes', value)}
              onGridChange={(value) => updateSetting('showGrid', value)}
              onAutoRotateChange={(value) => updateSetting('autoRotate', value)}
            />
          </div>
        </aside>

        <main className="flex-1 relative">
          <ThreeCanvas
            ref={canvasRef}
            settings={settings}
            onModelLoaded={handleModelLoaded}
            onHitPoint={setHitPoint}
            fileToLoad={fileToLoad}
            onLoadComplete={handleLoadComplete}
            onScreenshotRequest={screenshotTrigger > 0 ? () => {} : null}
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">正在加载模型...</p>
              </div>
            </div>
          )}

          {!modelInfo && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm mb-2">点击顶部「上传模型」按钮开始</p>
                <p className="text-gray-600 text-xs">支持 STL / OBJ / GLB / GLTF 格式</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 text-xs text-gray-500 pointer-events-none">
            <p>🖱️ 左键旋转 · 滚轮缩放 · 右键平移</p>
          </div>
        </main>

        <aside className="w-64 bg-panel/60 glass-panel border-l border-white/5 p-4 overflow-y-auto flex-shrink-0 hidden lg:block">
          <ModelInfo info={modelInfo} />
        </aside>
      </div>

      <CoordinateTooltip hitPoint={hitPoint} />
    </div>
  );
}

export default App;
