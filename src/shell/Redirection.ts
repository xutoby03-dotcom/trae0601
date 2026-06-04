import type { Command, VFS } from './types'

export interface InputRedirectResult {
  input: string
  shouldExecute: boolean
}

export interface OutputRedirectResult {
  outputWritten: boolean
}

export async function handleInputRedirect(
  command: Command,
  vfs: VFS,
  cwd: string,
  input: string
): Promise<InputRedirectResult> {
  let result: InputRedirectResult = {
    input,
    shouldExecute: true
  }

  for (const redirect of command.redirects) {
    if (redirect.type === '<') {
      const targetPath = resolvePath(cwd, redirect.target)
      const exists = await vfs.exists(targetPath)
      if (exists) {
        result.input = await vfs.readFile(targetPath)
      } else {
        throw new Error(`No such file or directory: ${redirect.target}`)
      }
    }
  }

  return result
}

export async function handleOutputRedirect(
  command: Command,
  vfs: VFS,
  cwd: string,
  output: string
): Promise<OutputRedirectResult> {
  let result: OutputRedirectResult = {
    outputWritten: false
  }

  for (const redirect of command.redirects) {
    if (redirect.type === '>' || redirect.type === '>>') {
      const targetPath = resolvePath(cwd, redirect.target)

      if (redirect.type === '>') {
        await vfs.writeFile(targetPath, output)
      } else if (redirect.type === '>>') {
        const exists = await vfs.exists(targetPath)
        if (exists) {
          const existing = await vfs.readFile(targetPath)
          await vfs.writeFile(targetPath, existing + output)
        } else {
          await vfs.writeFile(targetPath, output)
        }
      }

      result.outputWritten = true
    }
  }

  return result
}

export function hasOutputRedirect(command: Command): boolean {
  return command.redirects.some(r => r.type === '>' || r.type === '>>')
}

function resolvePath(cwd: string, path: string): string {
  if (path.startsWith('/')) {
    return path
  }
  return `${cwd}/${path}`
}
