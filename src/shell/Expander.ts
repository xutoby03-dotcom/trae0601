import type { VFS } from './types'

export function expandVariables(str: string, env: Record<string, string>): string {
  return str.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, braceName, dollarName) => {
    const name = braceName || dollarName
    return env[name] || ''
  })
}

export async function expandWildcards(pattern: string, cwd: string, vfs: VFS): Promise<string[]> {
  if (!pattern.includes('*') && !pattern.includes('?')) {
    return [pattern]
  }

  const parts = pattern.split('/')
  const results: string[] = []

  async function expand(remaining: string[], currentPath: string): Promise<void> {
    if (remaining.length === 0) {
      results.push(currentPath || '.')
      return
    }

    const [part, ...rest] = remaining
    const isLast = rest.length === 0

    if (!part.includes('*') && !part.includes('?')) {
      const nextPath = currentPath ? `${currentPath}/${part}` : part
      const fullPath = resolvePath(cwd, nextPath)
      const exists = await vfs.exists(fullPath)
      if (exists) {
        const isDir = await vfs.isDirectory(fullPath)
        if (isLast || isDir) {
          await expand(rest, nextPath)
        }
      }
      return
    }

    const searchPath = currentPath ? resolvePath(cwd, currentPath) : cwd
    const exists = await vfs.exists(searchPath)
    const isDir = await vfs.isDirectory(searchPath)
    if (!exists || !isDir) {
      return
    }

    const entries = await vfs.listDir(searchPath)
    const regex = wildcardToRegex(part)

    for (const entry of entries) {
      if (regex.test(entry)) {
        const nextPath = currentPath ? `${currentPath}/${entry}` : entry
        const fullPath = resolvePath(cwd, nextPath)
        if (isLast) {
          results.push(nextPath)
        } else {
          const entryIsDir = await vfs.isDirectory(fullPath)
          if (entryIsDir) {
            await expand(rest, nextPath)
          }
        }
      }
    }
  }

  await expand(parts, '')

  return results.length > 0 ? results : [pattern]
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.')
  return new RegExp(`^${regexStr}$`)
}

function resolvePath(cwd: string, path: string): string {
  if (path.startsWith('/')) {
    return path
  }
  return `${cwd}/${path}`
}
