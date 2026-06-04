export type RedirectType = '>' | '>>' | '<'

export interface Redirect {
  type: RedirectType
  target: string
}

export interface Command {
  name: string
  args: string[]
  redirects: Redirect[]
}

export interface ParseResult {
  commands: Command[]
}

export interface VFS {
  readFile(path: string): Promise<string> | string
  writeFile(path: string, content: string): Promise<void> | void
  appendFile(path: string, content: string): Promise<void> | void
  exists(path: string): Promise<boolean> | boolean
  listDir(path: string): Promise<string[]> | string[]
  isDirectory(path: string): Promise<boolean> | boolean
}

export interface PipelineContext {
  vfs: VFS
  cwd: string
  env: Record<string, string>
  stdin: string
  stdout: (data: string) => void
  stderr: (data: string) => void
  executeCommand: (cmd: Command, ctx: PipelineContext) => Promise<number> | number
  paneId?: string
}

export interface ParseContext {
  vfs: VFS
  cwd: string
  env: Record<string, string>
}

export interface AliasMap {
  [name: string]: string
}
