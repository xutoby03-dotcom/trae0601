import type { Command, VFS } from './types'

export interface RedirectResult {
  input: string
  output: string
  shouldExecute: boolean
}

export async function handleRedirect(
  command: Command,
  vfs: VFS,
  cwd: string,
  input: string,
  output: string
): Promise<RedirectResult> {
  let result: RedirectResult = {
    input,
    output,
    shouldExecute: true
  }

  for (const redirect of command.redirects) {
    const targetPath = resolvePath(cwd, redirect.target)

    switch (redirect.type) {
      case '>':
        await vfs.writeFile(targetPath, result.output)
        result.output = ''
        break
      case '>>': {
        const exists = await vfs.exists(targetPath)
        if (exists) {
          const existing = await vfs.readFile(targetPath)
          await vfs.writeFile(targetPath, existing + result.output)
        } else {
          await vfs.writeFile(targetPath, result.output)
        }
        result.output = ''
        break
      }
      case '<': {
        const exists = await vfs.exists(targetPath)
        if (exists) {
          result.input = await vfs.readFile(targetPath)
        } else {
          throw new Error(`No such file or directory: ${redirect.target}`)
        }
        break
      }
    }
  }

  return result
}

function resolvePath(cwd: string, path: string): string {
  if (path.startsWith('/')) {
    return path
  }
  return `${cwd}/${path}`
}
