import type { Command, PipelineContext } from './types'
import { handleInputRedirect, handleOutputRedirect, hasOutputRedirect } from './Redirection'

export async function executePipeline(commands: Command[], context: PipelineContext): Promise<number> {
  let currentInput = context.stdin
  let lastExitCode = 0

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    const isLast = i === commands.length - 1
    const hasOutput = hasOutputRedirect(command)

    const inputRedirectResult = await handleInputRedirect(
      command,
      context.vfs,
      context.cwd,
      currentInput
    )

    currentInput = inputRedirectResult.input

    let collectedOutput = ''

    const cmdContext: PipelineContext = {
      ...context,
      stdin: currentInput,
      stdout: (data: string) => {
        if (isLast && !hasOutput) {
          context.stdout(data)
        } else if (isLast && hasOutput) {
          collectedOutput += data
        } else if (!isLast) {
          currentInput += data
        }
      },
      stderr: context.stderr
    }

    const exitCode = await context.executeCommand(command, cmdContext)
    lastExitCode = typeof exitCode === 'number' ? exitCode : 0

    if (isLast && hasOutput) {
      await handleOutputRedirect(
        command,
        context.vfs,
        context.cwd,
        collectedOutput
      )
    }

    if (!isLast) {
      // 管道中命令失败不终止，类似bash行为
    }
  }

  return lastExitCode
}
