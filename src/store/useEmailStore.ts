import { create } from 'zustand';
import { EmailComponent, EmailTemplate, PreviewMode, VariableValues, DEFAULT_VARIABLES, ComponentType } from '@/types/email';
import { generateId } from '@/utils/id';
import { getComponentDefaultProps } from '@/utils/exportHtml';
import { createTemplateFromPreset } from '@/utils/templates';
import { saveTemplate, loadAllTemplates, deleteTemplate as deleteTemplateFromDb } from '@/utils/db';
import { generateThumbnail } from '@/utils/thumbnail';

interface HistoryEntry {
  components: EmailComponent[];
  backgroundColor: string;
}

interface EmailStore {
  currentTemplate: EmailTemplate;
  selectedComponentId: string | null;
  previewMode: PreviewMode;
  showVariables: boolean;
  variables: VariableValues;
  history: HistoryEntry[];
  historyIndex: number;
  savedTemplates: EmailTemplate[];
  showExportModal: boolean;
  showSendModal: boolean;
  showTemplateLibrary: boolean;
  showSavedList: boolean;
  showVariableInsert: boolean;
  variableInsertTarget: { componentId: string; property: string } | null;
  dragOverInfo: { parentId?: string; columnIndex?: number; insertIndex: number } | null;

  setPreviewMode: (mode: PreviewMode) => void;
  toggleVariables: () => void;
  setVariable: (key: string, value: string) => void;
  selectComponent: (id: string | null) => void;
  addComponent: (type: ComponentType, insertIndex?: number, parentId?: string, columnIndex?: number) => void;
  removeComponent: (id: string, parentId?: string, columnIndex?: number) => void;
  moveComponent: (fromIndex: number, toIndex: number, parentId?: string, columnIndex?: number) => void;
  moveComponentBetweenContainers: (
    fromParentId: string | undefined, fromColumnIndex: number | undefined, fromIndex: number,
    toParentId: string | undefined, toColumnIndex: number | undefined, toIndex: number
  ) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  setBackgroundColor: (color: string) => void;
  setTemplateName: (name: string) => void;
  loadPresetTemplate: (index: number) => void;
  saveCurrentTemplate: () => Promise<void>;
  loadSavedTemplates: () => Promise<void>;
  loadSavedTemplate: (id: string) => Promise<void>;
  deleteSavedTemplate: (id: string) => Promise<void>;
  newTemplate: () => void;
  duplicateComponent: (id: string) => void;
  setShowExportModal: (show: boolean) => void;
  setShowSendModal: (show: boolean) => void;
  setShowTemplateLibrary: (show: boolean) => void;
  setShowSavedList: (show: boolean) => void;
  setShowVariableInsert: (show: boolean, target?: { componentId: string; property: string } | null) => void;
  setDragOverInfo: (info: { parentId?: string; columnIndex?: number; insertIndex: number } | null) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  insertVariable: (varKey: string) => void;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function findComponentById(components: EmailComponent[], id: string): EmailComponent | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      for (const col of comp.children) {
        const found = findComponentById(col, id);
        if (found) return found;
      }
    }
  }
  return null;
}

function findParentOfComponent(components: EmailComponent[], id: string): { parent?: EmailComponent; columnIndex?: number; index: number } | null {
  for (let i = 0; i < components.length; i++) {
    if (components[i].id === id) return { index: i };
    if (components[i].children) {
      for (let ci = 0; ci < components[i].children!.length; ci++) {
        const found = findParentOfComponent(components[i].children![ci], id);
        if (found) return { parent: components[i], columnIndex: ci, index: found.index };
      }
    }
  }
  return null;
}

function removeComponentFromList(components: EmailComponent[], id: string): EmailComponent[] {
  return components
    .filter(c => c.id !== id)
    .map(c => {
      if (c.children) {
        return { ...c, children: c.children.map(col => removeComponentFromList(col, id)) };
      }
      return c;
    });
}

function insertComponentInList(components: EmailComponent[], comp: EmailComponent, index: number): EmailComponent[] {
  const result = [...components];
  result.splice(index, 0, comp);
  return result;
}

function updateComponentInList(components: EmailComponent[], id: string, props: Record<string, any>): EmailComponent[] {
  return components.map(c => {
    if (c.id === id) {
      return { ...c, properties: { ...c.properties, ...props } };
    }
    if (c.children) {
      return { ...c, children: c.children.map(col => updateComponentInList(col, id, props)) };
    }
    return c;
  });
}

function duplicateInList(components: EmailComponent[], id: string): EmailComponent[] {
  const result: EmailComponent[] = [];
  for (const c of components) {
    result.push(c);
    if (c.id === id) {
      const dup = deepClone(c);
      dup.id = generateId();
      if (dup.children) {
        dup.children = dup.children.map((col: EmailComponent[]) =>
          col.map((child: EmailComponent) => ({ ...deepClone(child), id: generateId() }))
        );
      }
      result.push(dup);
    }
  }
  return result;
}

function createBlankTemplate(): EmailTemplate {
  return {
    id: generateId(),
    name: '未命名模板',
    backgroundColor: '#f3f4f6',
    components: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: '',
  };
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  currentTemplate: createBlankTemplate(),
  selectedComponentId: null,
  previewMode: 'desktop',
  showVariables: false,
  variables: { ...DEFAULT_VARIABLES },
  history: [{ components: [], backgroundColor: '#f3f4f6' }],
  historyIndex: 0,
  savedTemplates: [],
  showExportModal: false,
  showSendModal: false,
  showTemplateLibrary: false,
  showSavedList: false,
  showVariableInsert: false,
  variableInsertTarget: null,
  dragOverInfo: null,

  pushHistory: () => {
    const state = get();
    const entry: HistoryEntry = {
      components: deepClone(state.currentTemplate.components),
      backgroundColor: state.currentTemplate.backgroundColor,
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      set({
        historyIndex: newIndex,
        currentTemplate: { ...state.currentTemplate, components: deepClone(entry.components), backgroundColor: entry.backgroundColor },
        selectedComponentId: null,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];
      set({
        historyIndex: newIndex,
        currentTemplate: { ...state.currentTemplate, components: deepClone(entry.components), backgroundColor: entry.backgroundColor },
        selectedComponentId: null,
      });
    }
  },

  setPreviewMode: (mode) => set({ previewMode: mode }),
  toggleVariables: () => set((s) => ({ showVariables: !s.showVariables })),
  setVariable: (key, value) => set((s) => ({ variables: { ...s.variables, [key]: value } })),

  selectComponent: (id) => set({ selectedComponentId: id }),

  addComponent: (type, insertIndex, parentId, columnIndex) => {
    const state = get();
    state.pushHistory();
    const defaultProps = getComponentDefaultProps(type);
    const newComp: EmailComponent = {
      id: generateId(),
      type,
      properties: { ...defaultProps },
      ...(type === 'two-column' ? { children: [[], []] } : {}),
      ...(type === 'three-column' ? { children: [[], [], []] } : {}),
    };

    let newComponents: EmailComponent[];
    if (parentId && columnIndex !== undefined) {
      newComponents = state.currentTemplate.components.map(c => {
        if (c.id === parentId && c.children) {
          const newChildren = c.children.map((col, i) => {
            if (i === columnIndex) {
              const newCol = [...col];
              newCol.splice(insertIndex ?? newCol.length, 0, newComp);
              return newCol;
            }
            return col;
          });
          return { ...c, children: newChildren };
        }
        return c;
      });
    } else {
      newComponents = [...state.currentTemplate.components];
      newComponents.splice(insertIndex ?? newComponents.length, 0, newComp);
    }

    set({
      currentTemplate: { ...state.currentTemplate, components: newComponents },
      selectedComponentId: newComp.id,
    });
  },

  removeComponent: (id, parentId, columnIndex) => {
    const state = get();
    state.pushHistory();
    let newComponents: EmailComponent[];
    if (parentId && columnIndex !== undefined) {
      newComponents = state.currentTemplate.components.map(c => {
        if (c.id === parentId && c.children) {
          const newChildren = c.children.map((col, i) => {
            if (i === columnIndex) return col.filter(child => child.id !== id);
            return col;
          });
          return { ...c, children: newChildren };
        }
        return c;
      });
    } else {
      newComponents = removeComponentFromList(state.currentTemplate.components, id);
    }
    set({
      currentTemplate: { ...state.currentTemplate, components: newComponents },
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    });
  },

  moveComponent: (fromIndex, toIndex, parentId, columnIndex) => {
    const state = get();
    state.pushHistory();
    let newComponents: EmailComponent[];
    if (parentId && columnIndex !== undefined) {
      newComponents = state.currentTemplate.components.map(c => {
        if (c.id === parentId && c.children) {
          const newChildren = c.children.map((col, i) => {
            if (i === columnIndex) {
              const newCol = [...col];
              const [moved] = newCol.splice(fromIndex, 1);
              newCol.splice(toIndex, 0, moved);
              return newCol;
            }
            return col;
          });
          return { ...c, children: newChildren };
        }
        return c;
      });
    } else {
      newComponents = [...state.currentTemplate.components];
      const [moved] = newComponents.splice(fromIndex, 1);
      newComponents.splice(toIndex, 0, moved);
    }
    set({ currentTemplate: { ...state.currentTemplate, components: newComponents } });
  },

  moveComponentBetweenContainers: (fromParentId, fromColumnIndex, fromIndex, toParentId, toColumnIndex, toIndex) => {
    const state = get();
    state.pushHistory();

    let componentToMove: EmailComponent | null = null;

    const tempComponents = deepClone(state.currentTemplate.components);

    if (fromParentId && fromColumnIndex !== undefined) {
      const parent = findComponentById(tempComponents, fromParentId);
      if (parent && parent.children && parent.children[fromColumnIndex]) {
        componentToMove = parent.children[fromColumnIndex][fromIndex];
        parent.children[fromColumnIndex].splice(fromIndex, 1);
      }
    } else {
      componentToMove = tempComponents[fromIndex];
      tempComponents.splice(fromIndex, 1);
    }

    if (!componentToMove) return;

    if (toParentId && toColumnIndex !== undefined) {
      const parent = findComponentById(tempComponents, toParentId);
      if (parent && parent.children && parent.children[toColumnIndex]) {
        parent.children[toColumnIndex].splice(toIndex, 0, componentToMove);
      }
    } else {
      tempComponents.splice(toIndex, 0, componentToMove);
    }

    set({ currentTemplate: { ...state.currentTemplate, components: tempComponents } });
  },

  updateComponentProps: (id, props) => {
    const state = get();
    const newComponents = updateComponentInList(state.currentTemplate.components, id, props);
    set({ currentTemplate: { ...state.currentTemplate, components: newComponents } });
  },

  setBackgroundColor: (color) => {
    const state = get();
    state.pushHistory();
    set({ currentTemplate: { ...state.currentTemplate, backgroundColor: color } });
  },

  setTemplateName: (name) => {
    set({ currentTemplate: { ...get().currentTemplate, name } });
  },

  loadPresetTemplate: (index) => {
    const state = get();
    state.pushHistory();
    const template = createTemplateFromPreset(index);
    set({
      currentTemplate: template,
      selectedComponentId: null,
      history: [{ components: deepClone(template.components), backgroundColor: template.backgroundColor }],
      historyIndex: 0,
    });
  },

  saveCurrentTemplate: async () => {
    const state = get();
    const thumbnail = generateThumbnail(state.currentTemplate.components, state.currentTemplate.backgroundColor);
    const template = { ...state.currentTemplate, updatedAt: Date.now(), thumbnail };
    await saveTemplate(template);
    await state.loadSavedTemplates();
  },

  loadSavedTemplates: async () => {
    const templates = await loadAllTemplates();
    set({ savedTemplates: templates });
  },

  loadSavedTemplate: async (id) => {
    const template = await loadAllTemplates();
    const found = template.find(t => t.id === id);
    if (found) {
      const state = get();
      state.pushHistory();
      set({
        currentTemplate: found,
        selectedComponentId: null,
        history: [{ components: deepClone(found.components), backgroundColor: found.backgroundColor }],
        historyIndex: 0,
      });
    }
  },

  deleteSavedTemplate: async (id) => {
    await deleteTemplateFromDb(id);
    await get().loadSavedTemplates();
  },

  newTemplate: () => {
    const state = get();
    state.pushHistory();
    const t = createBlankTemplate();
    set({
      currentTemplate: t,
      selectedComponentId: null,
      history: [{ components: [], backgroundColor: '#f3f4f6' }],
      historyIndex: 0,
    });
  },

  duplicateComponent: (id) => {
    const state = get();
    state.pushHistory();
    const newComponents = duplicateInList(state.currentTemplate.components, id);
    set({ currentTemplate: { ...state.currentTemplate, components: newComponents } });
  },

  setShowExportModal: (show) => set({ showExportModal: show }),
  setShowSendModal: (show) => set({ showSendModal: show }),
  setShowTemplateLibrary: (show) => set({ showTemplateLibrary: show }),
  setShowSavedList: (show) => set({ showSavedList: show }),
  setShowVariableInsert: (show, target) => set({ showVariableInsert: show, variableInsertTarget: target || null }),
  setDragOverInfo: (info) => set({ dragOverInfo: info }),

  insertVariable: (varKey) => {
    const state = get();
    const target = state.variableInsertTarget;
    if (!target) return;
    const comp = findComponentById(state.currentTemplate.components, target.componentId);
    if (!comp) return;
    const currentText = comp.properties[target.property] || '';
    const newText = currentText + `{{${varKey}}}`;
    state.updateComponentProps(target.componentId, { [target.property]: newText });
    set({ showVariableInsert: false, variableInsertTarget: null });
  },
}));
