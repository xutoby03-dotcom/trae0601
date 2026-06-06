import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { saveProject, loadAllProjects, deleteProject, generateId } from '../utils/storage';
import { downloadBlob } from '../utils/mp3Encoder';
import type { DJProject, DeckState } from '../types';

interface ProjectManagerProps {
  deckA: DeckState;
  deckB: DeckState;
  onLoadProject: (project: DJProject) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  deckA,
  deckB,
  onLoadProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<DJProject[]>([]);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAllProjects().then(setProjects);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!deckA.audioBuffer && !deckB.audioBuffer) {
      alert('Please load at least one track before saving.');
      return;
    }

    const name = projectName.trim() || `Mix ${new Date().toLocaleString()}`;
    
    const project: DJProject = {
      id: await generateId(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deckA: {
        fileName: deckA.fileName,
        audioData: deckA.audioBuffer
          ? audioBufferToArrayBuffer(deckA.audioBuffer)
          : new ArrayBuffer(0),
        cuePoints: deckA.cuePoints,
        bpm: deckA.bpm,
      },
      deckB: {
        fileName: deckB.fileName,
        audioData: deckB.audioBuffer
          ? audioBufferToArrayBuffer(deckB.audioBuffer)
          : new ArrayBuffer(0),
        cuePoints: deckB.cuePoints,
        bpm: deckB.bpm,
      },
    };

    await saveProject(project);
    setProjects(await loadAllProjects());
    setProjectName('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      setProjects(await loadAllProjects());
    }
  };

  const audioBufferToArrayBuffer = (buffer: AudioBuffer): ArrayBuffer => {
    const channelData = buffer.getChannelData(0);
    const length = channelData.length * Float32Array.BYTES_PER_ELEMENT;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Float32Array(arrayBuffer);
    view.set(channelData);
    return arrayBuffer;
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all border-2 border-blue-400 shadow-lg shadow-blue-500/20"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all border-2 border-purple-400 shadow-lg shadow-purple-500/20"
        >
          <FolderOpen className="w-4 h-4" />
          Load
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="font-bold text-white">Saved Projects</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="p-3">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name..."
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white text-sm mb-3 focus:outline-none focus:border-blue-500"
            />
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {projects.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No saved projects
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(project.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          onLoadProject(project);
                          setIsOpen(false);
                        }}
                        className="p-1.5 rounded bg-green-600 hover:bg-green-500 transition-colors"
                      >
                        <FolderOpen className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 rounded bg-red-600 hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
