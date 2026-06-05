import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { Project, Page, CanvasElement, Interaction, CustomComponent } from '@/types'

interface WireframeDB extends DBSchema {
  projects: {
    key: string
    value: Project
  }
  pages: {
    key: string
    value: Page
    indexes: { projectId: string }
  }
  elements: {
    key: string
    value: CanvasElement
    indexes: { pageId: string }
  }
  interactions: {
    key: string
    value: Interaction
    indexes: { elementId: string }
  }
  customComponents: {
    key: string
    value: CustomComponent
    indexes: { projectId: string }
  }
}

let dbInstance: IDBPDatabase<WireframeDB> | null = null

export async function initDB(): Promise<IDBPDatabase<WireframeDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<WireframeDB>('wireframe-studio', 1, {
    upgrade(db) {
      db.createObjectStore('projects', { keyPath: 'id' })
      const pageStore = db.createObjectStore('pages', { keyPath: 'id' })
      pageStore.createIndex('projectId', 'projectId')
      const elementStore = db.createObjectStore('elements', { keyPath: 'id' })
      elementStore.createIndex('pageId', 'pageId')
      const interactionStore = db.createObjectStore('interactions', { keyPath: 'id' })
      interactionStore.createIndex('elementId', 'elementId')
      const componentStore = db.createObjectStore('customComponents', { keyPath: 'id' })
      componentStore.createIndex('projectId', 'projectId')
    },
  })
  return dbInstance
}

export async function saveProject(project: Project): Promise<void> {
  const db = await initDB()
  await db.put('projects', project)
}

export async function loadProjects(): Promise<Project[]> {
  const db = await initDB()
  return db.getAll('projects')
}

export async function deleteProjectFromDB(id: string): Promise<void> {
  const db = await initDB()
  await db.delete('projects', id)
}

export async function savePages(pages: Page[]): Promise<void> {
  const db = await initDB()
  const tx = db.transaction('pages', 'readwrite')
  for (const page of pages) {
    await tx.store.put(page)
  }
  await tx.done
}

export async function loadPages(projectId: string): Promise<Page[]> {
  const db = await initDB()
  return db.getAllFromIndex('pages', 'projectId', projectId)
}

export async function saveElements(pageId: string, elements: CanvasElement[]): Promise<void> {
  const db = await initDB()
  const tx = db.transaction('elements', 'readwrite')
  for (const el of elements) {
    await tx.store.put(el)
  }
  await tx.done
}

export async function loadElementsByProject(projectId: string): Promise<Record<string, CanvasElement[]>> {
  const db = await initDB()
  const pages = await db.getAllFromIndex('pages', 'projectId', projectId)
  const result: Record<string, CanvasElement[]> = {}
  for (const page of pages) {
    const els = await db.getAllFromIndex('elements', 'pageId', page.id)
    result[page.id] = els
  }
  return result
}

export async function saveInteractions(interactions: Interaction[]): Promise<void> {
  const db = await initDB()
  const tx = db.transaction('interactions', 'readwrite')
  for (const interaction of interactions) {
    await tx.store.put(interaction)
  }
  await tx.done
}

export async function loadInteractions(projectId: string): Promise<Interaction[]> {
  const db = await initDB()
  const pages = await db.getAllFromIndex('pages', 'projectId', projectId)
  const elementIds = new Set<string>()
  for (const page of pages) {
    const els = await db.getAllFromIndex('elements', 'pageId', page.id)
    for (const el of els) {
      elementIds.add(el.id)
    }
  }
  const all = await db.getAll('interactions')
  return all.filter((i) => elementIds.has(i.elementId))
}

export async function saveCustomComponents(components: CustomComponent[]): Promise<void> {
  const db = await initDB()
  const tx = db.transaction('customComponents', 'readwrite')
  for (const comp of components) {
    await tx.store.put(comp)
  }
  await tx.done
}

export async function loadCustomComponents(projectId: string): Promise<CustomComponent[]> {
  const db = await initDB()
  return db.getAllFromIndex('customComponents', 'projectId', projectId)
}
