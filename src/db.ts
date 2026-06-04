import { Task, Dependency, CalendarConfig, ProjectData } from './types';

const DB_NAME = 'GanttProjectDB';
const DB_VERSION = 1;
const STORES = {
  TASKS: 'tasks',
  DEPENDENCIES: 'dependencies',
  CALENDAR: 'calendar',
  RESOURCES: 'resources',
};

let db: IDBDatabase | null = null;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const result = (event.target as IDBOpenDBRequest).result;

      if (!result.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = result.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        taskStore.createIndex('parentId', 'parentId');
        taskStore.createIndex('order', 'order');
      }

      if (!result.objectStoreNames.contains(STORES.DEPENDENCIES)) {
        const depStore = result.createObjectStore(STORES.DEPENDENCIES, { keyPath: 'id' });
        depStore.createIndex('sourceId', 'sourceId');
        depStore.createIndex('targetId', 'targetId');
      }

      if (!result.objectStoreNames.contains(STORES.CALENDAR)) {
        result.createObjectStore(STORES.CALENDAR, { keyPath: 'id' });
      }

      if (!result.objectStoreNames.contains(STORES.RESOURCES)) {
        result.createObjectStore(STORES.RESOURCES, { keyPath: 'name' });
      }
    };
  });
};

const getDB = (): IDBDatabase => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

export const saveTask = (task: Task): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.TASKS, 'readwrite');
    const store = tx.objectStore(STORES.TASKS);
    const request = store.put(task);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteTask = (taskId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.TASKS, 'readwrite');
    const store = tx.objectStore(STORES.TASKS);
    const request = store.delete(taskId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllTasks = (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.TASKS, 'readonly');
    const store = tx.objectStore(STORES.TASKS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveDependency = (dep: Dependency): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.DEPENDENCIES, 'readwrite');
    const store = tx.objectStore(STORES.DEPENDENCIES);
    const request = store.put(dep);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteDependency = (depId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.DEPENDENCIES, 'readwrite');
    const store = tx.objectStore(STORES.DEPENDENCIES);
    const request = store.delete(depId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllDependencies = (): Promise<Dependency[]> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.DEPENDENCIES, 'readonly');
    const store = tx.objectStore(STORES.DEPENDENCIES);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveCalendar = (calendar: CalendarConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.CALENDAR, 'readwrite');
    const store = tx.objectStore(STORES.CALENDAR);
    const request = store.put({ id: 'default', ...calendar });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getCalendar = (): Promise<CalendarConfig | null> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.CALENDAR, 'readonly');
    const store = tx.objectStore(STORES.CALENDAR);
    const request = store.get('default');
    request.onsuccess = () => {
      if (request.result) {
        const { id, ...rest } = request.result;
        resolve(rest);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveResource = (resource: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.RESOURCES, 'readwrite');
    const store = tx.objectStore(STORES.RESOURCES);
    const request = store.put({ name: resource });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllResources = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.RESOURCES, 'readonly');
    const store = tx.objectStore(STORES.RESOURCES);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.map((r) => r.name));
    request.onerror = () => reject(request.error);
  });
};

export const deleteResource = (resource: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORES.RESOURCES, 'readwrite');
    const store = tx.objectStore(STORES.RESOURCES);
    const request = store.delete(resource);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const saveAllProjectData = (data: ProjectData): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(
      [STORES.TASKS, STORES.DEPENDENCIES, STORES.CALENDAR, STORES.RESOURCES],
      'readwrite'
    );

    const taskStore = tx.objectStore(STORES.TASKS);
    taskStore.clear();
    data.tasks.forEach((task) => taskStore.put(task));

    const depStore = tx.objectStore(STORES.DEPENDENCIES);
    depStore.clear();
    data.dependencies.forEach((dep) => depStore.put(dep));

    const calStore = tx.objectStore(STORES.CALENDAR);
    calStore.clear();
    calStore.put({ id: 'default', ...data.calendar });

    const resStore = tx.objectStore(STORES.RESOURCES);
    resStore.clear();
    data.resources.forEach((r) => resStore.put({ name: r }));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllProjectData = (): Promise<ProjectData> => {
  return Promise.all([
    getAllTasks(),
    getAllDependencies(),
    getCalendar(),
    getAllResources(),
  ]).then(([tasks, dependencies, calendar, resources]) => ({
    tasks,
    dependencies,
    calendar: calendar || { workDays: [1, 2, 3, 4, 5], holidays: [] },
    resources,
  }));
};
