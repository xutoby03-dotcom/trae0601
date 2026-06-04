import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Save } from 'lucide-react';
import { usePhysicsStore } from '../store/physicsStore';
import type { SceneData } from '../types';
import { deleteScene, saveScene } from '../utils/indexedDB';

interface SceneSelectorProps {
  presets: SceneData[];
  onLoadScene: (scene: SceneData) => void;
  onSaveCurrent: () => void;
}

const SceneSelector = ({ presets, onLoadScene, onSaveCurrent }: SceneSelectorProps) => {
  const { showSceneList, setShowSceneList, scenes, setScenes } = usePhysicsStore();

  const handleDeleteScene = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteScene(id);
    setScenes(scenes.filter((s) => s.id !== id));
  };

  const handleSaveScene = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveCurrent();
  };

  return (
    <AnimatePresence>
      {showSceneList && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSceneList(false)}
            className="fixed inset-0 bg-black/50 z-30"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[800px] max-h-[80vh] overflow-auto"
          >
            <div className="bg-[#1a1a2e] rounded-2xl border border-[#00f5d4]/20 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#3a3a4e]">
                <h2 className="text-xl font-bold text-white">场景库</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveScene}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00f5d4] text-[#1a1a2e] hover:bg-[#00d4b8] transition-colors text-sm font-medium"
                  >
                    <Save size={16} />
                    保存当前
                  </button>
                  <button
                    onClick={() => setShowSceneList(false)}
                    className="p-2 rounded-lg bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">预设场景</h3>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {presets.map((scene) => (
                    <motion.button
                      key={scene.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onLoadScene(scene);
                        setShowSceneList(false);
                      }}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-[#2a2a3e] border border-transparent hover:border-[#00f5d4]/50 transition-all"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold text-[#00f5d4]/30">
                          {scene.name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs text-white font-medium truncate">
                          {scene.name}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {scenes.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">我的场景</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {scenes.map((scene) => (
                        <motion.button
                          key={scene.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onLoadScene(scene);
                            setShowSceneList(false);
                          }}
                          className="group relative aspect-video rounded-xl overflow-hidden bg-[#2a2a3e] border border-transparent hover:border-[#9d4edd]/50 transition-all"
                        >
                          {scene.thumbnail ? (
                            <img
                              src={scene.thumbnail}
                              alt={scene.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-2xl font-bold text-[#9d4edd]/30">
                                {scene.name.charAt(0)}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-xs text-white font-medium truncate">
                              {scene.name}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteScene(scene.id, e)}
                            className="absolute top-2 right-2 p-1 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SceneSelector;
