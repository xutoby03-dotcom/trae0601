import type { Command, PipelineContext } from './types'
import { handleRedirect } from './Redirection'

export async function executePipeline(commands: Command[], context: PipelineContext): Promise<number> {
  let currentInput = context.stdin
  let lastExitCode = 0

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    const isLast = i === commands.length - 1

    const redirectResult = await handleRedirect(
      command,
      context.vfs,
      context.cwd,
      currentInput,
      ''
    )

    currentInput = redirectResult.input

    const cmdContext: PipelineContext = {
      ...context,
      stdin: currentInput,
      stdout: (data: string) => {
        if (isLast) {
          context.stdout(data)
        } else {
          currentInput += data
        }
      },
      stderr: context.stderr
    }

    const exitCode = await context.executeCommand(command, cmdContext)
    lastExitCode = typeof exitCode === 'number' ? exitCode : 0

    if (!isLast) {
      // 管道中命令失败不终止，类似bash行为
    }
  }

  return lastExitCode
}
