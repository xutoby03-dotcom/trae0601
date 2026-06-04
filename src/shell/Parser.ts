import type { Command, ParseResult, Redirect, RedirectType } from './types'
import { aliasManager } from './Alias'
import { expandVariables, expandWildcards } from './Expander'
import type { VFS } from './types'

interface Token {
  value: string
  quoted: boolean
  quoteType?: 'single' | 'double'
}

interface ParseContext {
  vfs: VFS
  cwd: string
  env: Record<string, string>
}

export async function parse(commandLine: string, context: ParseContext): Promise<ParseResult> {
  const expandedLine = aliasManager.expandAliases(commandLine)
  const commands = expandedLine.split(';').map(cmd => cmd.trim()).filter(Boolean)
  const parsedCommands: Command[] = []

  for (const cmd of commands) {
    const pipelineCmds = parsePipeline(cmd)
    for (const pipelineCmd of pipelineCmds) {
      parsedCommands.push(await parseSingleCommand(pipelineCmd, context))
    }
  }

  return { commands: parsedCommands }
}

function parsePipeline(commandLine: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let i = 0

  while (i < commandLine.length) {
    const char = commandLine[i]

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      current += char
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      current += char
    } else if (char === '|' && !inSingleQuote && !inDoubleQuote) {
      tokens.push(current.trim())
      current = ''
    } else {
      current += char
    }
    i++
  }

  if (current.trim()) {
    tokens.push(current.trim())
  }

  return tokens
}

export async function parseSingleCommand(cmd: string, context: ParseContext): Promise<Command> {
  const tokens = tokenize(cmd)
  const expandedTokens = await expandTokens(tokens, context)
  return buildCommand(expandedTokens)
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let hasQuote = false
  let quoteType: 'single' | 'double' | undefined

  let i = 0
  while (i < input.length) {
    const char = input[i]

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      hasQuote = true
      quoteType = 'single'
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      hasQuote = true
      quoteType = 'double'
    } else if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current || hasQuote) {
        tokens.push({ value: current, quoted: hasQuote, quoteType })
        current = ''
        hasQuote = false
        quoteType = undefined
      }
    } else {
      current += char
    }
    i++
  }

  if (current || hasQuote) {
    tokens.push({ value: current, quoted: hasQuote, quoteType })
  }

  return tokens
}

async function expandTokens(tokens: Token[], context: ParseContext): Promise<string[]> {
  const result: string[] = []
  const { vfs, cwd, env } = context

  for (const token of tokens) {
    if (token.quoted) {
      if (token.quoteType === 'double') {
        result.push(expandVariables(token.value, env))
      } else {
        result.push(token.value)
      }
    } else {
      let expanded = expandVariables(token.value, env)
      const wildcards = await expandWildcards(expanded, cwd, vfs)
      result.push(...wildcards)
    }
  }

  return result
}

function buildCommand(tokens: string[]): Command {
  const command: Command = {
    name: '',
    args: [],
    redirects: []
  }

  let i = 0
  let nameSet = false

  while (i < tokens.length) {
    const token = tokens[i]

    if ((token === '>' || token === '>>' || token === '<') && i + 1 < tokens.length) {
      const redirect: Redirect = {
        type: token as RedirectType,
        target: tokens[i + 1]
      }
      command.redirects.push(redirect)
      i += 2
      continue
    }

    if (!nameSet) {
      command.name = token
      nameSet = true
    } else {
      command.args.push(token)
    }
    i++
  }

  return command
}
