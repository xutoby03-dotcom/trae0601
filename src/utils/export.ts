import type { Project, Page, CanvasElement, Interaction, CustomComponent, ExportData } from '@/types'

export function exportProjectJSON(
  project: Project,
  pages: Page[],
  elements: Record<string, CanvasElement[]>,
  interactions: Interaction[],
  customComponents: CustomComponent[],
): void {
  const data: ExportData = {
    project,
    pages,
    elements,
    interactions,
    customComponents,
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.replace(/\s+/g, '_')}_wireframe.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function importProjectJSON(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString)

    if (
      !data ||
      typeof data !== 'object' ||
      !data.project ||
      !Array.isArray(data.pages) ||
      !data.elements ||
      typeof data.elements !== 'object' ||
      !Array.isArray(data.interactions) ||
      !Array.isArray(data.customComponents)
    ) {
      return null
    }

    return data as ExportData
  } catch {
    return null
  }
}

export function exportPageAsPNG(stageRef: any, pageName: string): void {
  const dataUrl = stageRef.toDataURL({ pixelRatio: 2 })

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${pageName.replace(/\s+/g, '_')}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
