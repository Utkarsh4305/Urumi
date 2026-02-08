import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger';

export const execAsync = promisify(exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function execCommand(
  command: string,
  options?: { cwd?: string; timeout?: number }
): Promise<ExecResult> {
  logger.debug(`Executing command: ${command}`, { cwd: options?.cwd });

  try {
    const result = await execAsync(command, {
      cwd: options?.cwd,
      timeout: options?.timeout || 300000, // 5 minutes default
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    logger.debug('Command executed successfully', {
      command,
      stdout: result.stdout.substring(0, 500),
      stderr: result.stderr.substring(0, 500)
    });

    return result;
  } catch (error: any) {
    logger.error('Command execution failed', {
      command,
      error: error.message,
      stdout: error.stdout?.substring(0, 500),
      stderr: error.stderr?.substring(0, 500)
    });
    throw error;
  }
}
