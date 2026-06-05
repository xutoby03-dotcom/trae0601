import { openDB, IDBPDatabase } from 'idb'
import { Project, Formula, Doc } from '../types'

const DB_NAME = 'latex-editor-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('formulas')) {
        const formulaStore = db.createObjectStore('formulas', { keyPath: 'id' })
        formulaStore.createIndex('projectId', 'projectId')
        formulaStore.createIndex('category', 'category')
      }
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' })
        docStore.createIndex('projectId', 'projectId')
      }
    },
  })
  return dbInstance
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB()
  return db.getAll('projects')
}

export async function createProject(project: Project): Promise<void> {
  const db = await getDB()
  await db.put('projects', project)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['projects', 'formulas', 'documents'], 'readwrite')
  await tx.objectStore('projects').delete(id)
  const formulaIndex = tx.objectStore('formulas').index('projectId')
  let fCursor = await formulaIndex.openCursor(id)
  while (fCursor) {
    await fCursor.delete()
    fCursor = await fCursor.continue()
  }
  const docIndex = tx.objectStore('documents').index('projectId')
  let dCursor = await docIndex.openCursor(id)
  while (dCursor) {
    await dCursor.delete()
    dCursor = await dCursor.continue()
  }
  await tx.done
}

export async function getAllFormulas(projectId?: string): Promise<Formula[]> {
  const db = await getDB()
  if (projectId) {
    return db.getAllFromIndex('formulas', 'projectId', projectId)
  }
  return db.getAll('formulas')
}

export async function saveFormula(formula: Formula): Promise<void> {
  const db = await getDB()
  await db.put('formulas', formula)
}

export async function deleteFormula(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('formulas', id)
}

export async function getAllDocs(projectId?: string): Promise<Doc[]> {
  const db = await getDB()
  if (projectId) {
    return db.getAllFromIndex('documents', 'projectId', projectId)
  }
  return db.getAll('documents')
}

export async function saveDoc(doc: Doc): Promise<void> {
  const db = await getDB()
  await db.put('documents', doc)
}

export async function deleteDoc(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('documents', id)
}

export async function exportFormulas(projectId?: string): Promise<string> {
  const formulas = await getAllFormulas(projectId)
  return JSON.stringify(formulas, null, 2)
}

export async function importFormulas(json: string, projectId: string): Promise<number> {
  const formulas: Formula[] = JSON.parse(json)
  const db = await getDB()
  let count = 0
  for (const f of formulas) {
    const newFormula = {
      ...f,
      id: crypto.randomUUID(),
      projectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.put('formulas', newFormula)
    count++
  }
  return count
}
