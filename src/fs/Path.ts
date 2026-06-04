export const HOME_DIR = '/home/user';

export class Path {
  static isAbsolute(path: string): boolean {
    if (!path || typeof path !== 'string') {
      return false;
    }
    return path.startsWith('/');
  }

  static isHome(path: string): boolean {
    return path === '~' || path.startsWith('~/');
  }

  static expandHome(path: string): string {
    if (path === '~') {
      return HOME_DIR;
    }
    if (path.startsWith('~/')) {
      return HOME_DIR + path.slice(1);
    }
    return path;
  }

  static normalize(path: string, cwd: string = HOME_DIR): string {
    if (!path || typeof path !== 'string') {
      throw new Error('Path must be a non-empty string');
    }

    let expanded = this.expandHome(path);
    const isAbs = this.isAbsolute(expanded);

    if (!isAbs) {
      expanded = this.join(cwd, expanded);
    }

    const parts = expanded.split('/').filter((p) => p !== '');
    const stack: string[] = [];

    for (const part of parts) {
      if (part === '.') {
        continue;
      } else if (part === '..') {
        if (stack.length > 0) {
          stack.pop();
        }
      } else {
        stack.push(part);
      }
    }

    let normalized = '/' + stack.join('/');

    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    if (!normalized.startsWith('/')) {
      throw new Error('Path traversal attack detected');
    }

    return normalized;
  }

  static join(...parts: string[]): string {
    if (parts.length === 0) {
      return '/';
    }

    let result = parts[0];

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      if (result.endsWith('/') && part.startsWith('/')) {
        result += part.slice(1);
      } else if (!result.endsWith('/') && !part.startsWith('/')) {
        result += '/' + part;
      } else {
        result += part;
      }
    }

    return result;
  }

  static dirname(path: string): string {
    const normalized = this.normalize(path);
    if (normalized === '/') {
      return '/';
    }
    const parts = normalized.split('/');
    parts.pop();
    return parts.length === 1 ? '/' : parts.join('/');
  }

  static basename(path: string): string {
    const normalized = this.normalize(path);
    if (normalized === '/') {
      return '/';
    }
    const parts = normalized.split('/');
    return parts[parts.length - 1];
  }

  static extname(path: string): string {
    const base = this.basename(path);
    const dotIndex = base.lastIndexOf('.');
    if (dotIndex <= 0 || dotIndex === base.length - 1) {
      return '';
    }
    return base.slice(dotIndex);
  }

  static isWithinRoot(path: string): boolean {
    return path === '/' || path.startsWith('/');
  }

  static relative(from: string, to: string): string {
    const fromParts = this.normalize(from).split('/').filter(Boolean);
    const toParts = this.normalize(to).split('/').filter(Boolean);

    let commonLength = 0;
    while (
      commonLength < fromParts.length &&
      commonLength < toParts.length &&
      fromParts[commonLength] === toParts[commonLength]
    ) {
      commonLength++;
    }

    const upParts = fromParts.slice(commonLength).map(() => '..');
    const downParts = toParts.slice(commonLength);

    const result = [...upParts, ...downParts].join('/');
    return result || '.';
  }
}
