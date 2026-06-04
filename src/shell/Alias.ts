import type { AliasMap } from './types'

export class AliasManager {
  private aliases: AliasMap = {}

  setAlias(name: string, value: string): void {
    this.aliases[name] = value
  }

  getAlias(name: string): string | undefined {
    return this.aliases[name]
  }

  removeAlias(name: string): void {
    delete this.aliases[name]
  }

  expandAliases(commandLine: string, visited: Set<string> = new Set()): string {
    const trimmed = commandLine.trim()
    if (!trimmed) return trimmed

    const firstSpace = trimmed.indexOf(' ')
    const firstWord = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)
    const rest = firstSpace === -1 ? '' : trimmed.slice(firstSpace)

    const aliasValue = this.aliases[firstWord]
    if (aliasValue === undefined) {
      return commandLine
    }

    if (visited.has(firstWord)) {
      return commandLine
    }

    visited.add(firstWord)

    const expanded = aliasValue + rest
    return this.expandAliases(expanded, visited)
  }

  getAllAliases(): AliasMap {
    return { ...this.aliases }
  }
}

export const aliasManager = new AliasManager()
