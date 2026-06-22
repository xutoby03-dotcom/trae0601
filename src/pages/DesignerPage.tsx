import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Play } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ElementType, CourseElement } from '@/types';
import CourseCanvas from '@/components/designer/CourseCanvas';
import Toolbar from '@/components/designer/Toolbar';
import PropertyPanel from '@/components/designer/PropertyPanel';
import { generateId } from '@/utils/id';

export default function DesignerPage() {
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse, deleteCourse, addElement, updateElement, deleteElement, selectedElementId, setSelectedElementId } = useAppStore();
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || '');
  const [newCourseName, setNewCourseName] = useState('');
  const [showNewCourse, setShowNewCourse] = useState(false);

  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const selectedElement = activeCourse?.elements.find((e) => e.id === selectedElementId) || null;

  const handleAddElement = (type: ElementType) => {
    if (!activeCourseId) return;

    const maxOrder = activeCourse?.elements
      .filter((e) => e.type === 'jump')
      .reduce((max, e) => Math.max(max, e.order), 0) || 0;

    const newElement: Omit<CourseElement, 'id'> = {
      type,
      x: 400,
      y: 300,
      order: type === 'jump' ? maxOrder + 1 : 0,
      ...(type === 'jump' && { label: String(maxOrder + 1) }),
      ...(type === 'arrow' && { rotation: 0 }),
      ...(type === 'step' && { steps: 6 }),
      ...(type === 'turn' && { radius: 50 }),
      ...(type === 'forbidden' && { width: 80, height: 60 }),
    };

    addElement(activeCourseId, newElement);
  };

  const handleUpdateElement = (id: string, updates: Partial<CourseElement>) => {
    updateElement(activeCourseId, id, updates);
  };

  const handleDeleteElement = () => {
    if (selectedElementId) {
      deleteElement(activeCourseId, selectedElementId);
    }
  };

  const handleCreateCourse = () => {
    if (newCourseName.trim()) {
      const newCourse = addCourse(newCourseName.trim());
      setActiveCourseId(newCourse.id);
      setNewCourseName('');
      setShowNewCourse(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('确定要删除这条路线吗？')) {
      deleteCourse(courseId);
      if (activeCourseId === courseId) {
        const remaining = courses.filter((c) => c.id !== courseId);
        setActiveCourseId(remaining[0]?.id || '');
      }
    }
  };

  const handleStartPractice = () => {
    if (activeCourseId) {
      navigate('/practice', { state: { courseId: activeCourseId } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-equestrian-brown-800">路线设计器</h2>
          <p className="text-equestrian-brown-500 text-sm mt-1">设计障碍路线，添加方向、步数和区域标记</p>
        </div>
        <button
          onClick={handleStartPractice}
          disabled={!activeCourse || activeCourse.elements.filter((e) => e.type === 'jump').length < 2}
          className="flex items-center gap-2 px-6 py-2.5 bg-equestrian-gold-500 text-equestrian-brown-800 rounded-lg font-medium hover:bg-equestrian-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          开始练习
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-elegant p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-equestrian-brown-700 font-serif font-bold">路线列表</h3>
              <button
                onClick={() => setShowNewCourse(!showNewCourse)}
                className="p-1.5 bg-equestrian-brown-100 text-equestrian-brown-600 rounded-lg hover:bg-equestrian-brown-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewCourse && (
              <div className="mb-3 space-y-2">
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="路线名称"
                  className="w-full px-3 py-2 border border-equestrian-brown-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
                />
                <button
                  onClick={handleCreateCourse}
                  className="w-full py-2 bg-equestrian-gold-500 text-equestrian-brown-800 rounded-lg text-sm font-medium hover:bg-equestrian-gold-600 transition-colors"
                >
                  创建路线
                </button>
              </div>
            )}

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeCourseId === course.id
                      ? 'bg-equestrian-gold-100 text-equestrian-brown-800'
                      : 'hover:bg-equestrian-sand-100 text-equestrian-brown-600'
                  }`}
                >
                  <span className="text-sm truncate flex-1">{course.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Toolbar onAddElement={handleAddElement} />
        </div>

        <div className="flex-1">
          {activeCourse ? (
            <CourseCanvas
              courseId={activeCourseId}
              elements={activeCourse.elements}
              selectedId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              mode="design"
            />
          ) : (
            <div className="bg-white rounded-xl shadow-elegant p-12 text-center">
              <p className="text-equestrian-brown-400">请选择或创建一条路线</p>
            </div>
          )}
        </div>

        <div className="w-64 flex-shrink-0">
          <PropertyPanel
            element={selectedElement}
            onUpdate={(updates) => selectedElementId && handleUpdateElement(selectedElementId, updates)}
            onDelete={handleDeleteElement}
          />
        </div>
      </div>
    </div>
  );
}
