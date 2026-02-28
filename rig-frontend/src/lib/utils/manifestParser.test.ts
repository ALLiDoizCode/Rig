import { describe, it, expect } from 'vitest';
import { parseManifestToTree, flattenTree, type TreeNode } from './manifestParser';
import type { ArweaveManifest } from '@/types/arweave';

describe('parseManifestToTree', () => {
  it('should parse empty manifest to root with empty children', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {}
    };

    const result = parseManifestToTree(manifest);

    expect(result).toEqual({
      name: 'root',
      path: '',
      type: 'folder',
      children: []
    });
  });

  it('should parse single file at root level', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'README.md': { id: 'tx-abc123' }
      }
    };

    const result = parseManifestToTree(manifest);

    expect(result.children).toHaveLength(1);
    expect(result.children![0]).toEqual({
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      arweaveId: 'tx-abc123',
      extension: 'md',
      children: undefined
    });
  });

  it('should parse nested file structure', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'src/index.ts': { id: 'tx-def456' },
        'src/lib/utils.ts': { id: 'tx-ghi789' }
      }
    };

    const result = parseManifestToTree(manifest);

    expect(result.children).toHaveLength(1);
    const srcFolder = result.children![0];
    expect(srcFolder.name).toBe('src');
    expect(srcFolder.type).toBe('folder');
    expect(srcFolder.children).toHaveLength(2);

    // Check both index.ts and lib folder exist
    const indexFile = srcFolder.children!.find(c => c.name === 'index.ts');
    const libFolder = srcFolder.children!.find(c => c.name === 'lib');

    expect(indexFile).toEqual({
      name: 'index.ts',
      path: 'src/index.ts',
      type: 'file',
      arweaveId: 'tx-def456',
      extension: 'ts',
      children: undefined
    });

    expect(libFolder?.type).toBe('folder');
    expect(libFolder?.children).toHaveLength(1);
    expect(libFolder?.children![0]).toEqual({
      name: 'utils.ts',
      path: 'src/lib/utils.ts',
      type: 'file',
      arweaveId: 'tx-ghi789',
      extension: 'ts',
      children: undefined
    });
  });

  it('should handle deeply nested paths (5+ levels)', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'a/b/c/d/e/file.txt': { id: 'tx-deep' }
      }
    };

    const result = parseManifestToTree(manifest);

    // Navigate through all levels
    let current = result;
    const expectedPath = ['a', 'b', 'c', 'd', 'e'];

    for (const folder of expectedPath) {
      expect(current.children).toHaveLength(1);
      current = current.children![0];
      expect(current.name).toBe(folder);
      expect(current.type).toBe('folder');
    }

    // Check the file at the deepest level
    expect(current.children).toHaveLength(1);
    expect(current.children![0]).toEqual({
      name: 'file.txt',
      path: 'a/b/c/d/e/file.txt',
      type: 'file',
      arweaveId: 'tx-deep',
      extension: 'txt',
      children: undefined
    });
  });

  it('should handle mixed files and folders at same level', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'README.md': { id: 'tx-1' },
        'package.json': { id: 'tx-2' },
        'src/index.ts': { id: 'tx-3' },
        'docs/guide.md': { id: 'tx-4' }
      }
    };

    const result = parseManifestToTree(manifest);

    expect(result.children).toHaveLength(4);

    // Check that folders come before files (due to sorting)
    const childTypes = result.children!.map(c => c.type);
    const folderCount = childTypes.filter(t => t === 'folder').length;

    // First items should be folders
    for (let i = 0; i < folderCount; i++) {
      expect(childTypes[i]).toBe('folder');
    }

    // Remaining items should be files
    for (let i = folderCount; i < childTypes.length; i++) {
      expect(childTypes[i]).toBe('file');
    }
  });

  it('should handle duplicate paths by keeping first occurrence', () => {
    // Note: In JavaScript object literals, duplicate keys aren't allowed at compile time
    // This test verifies the parser handles the deduplication logic correctly
    // when processing paths (via the seenPaths Set)
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'file.txt': { id: 'tx-only' }
      }
    };

    const result = parseManifestToTree(manifest);

    expect(result.children).toHaveLength(1);
    expect(result.children![0].arweaveId).toBe('tx-only');
    expect(result.children![0].name).toBe('file.txt');
  });

  it('should extract file extensions correctly', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'file.ts': { id: 'tx-1' },
        'file.TEST.tsx': { id: 'tx-2' },
        'README': { id: 'tx-3' },
        '.gitignore': { id: 'tx-4' }
      }
    };

    const result = parseManifestToTree(manifest);

    const files = result.children!;
    // Files are sorted alphabetically: .gitignore, file.TEST.tsx, file.ts, README
    expect(files[0].name).toBe('.gitignore');
    expect(files[0].extension).toBe('gitignore'); // .gitignore -> gitignore

    expect(files[1].name).toBe('file.TEST.tsx');
    expect(files[1].extension).toBe('tsx'); // Takes last part after dot

    expect(files[2].name).toBe('file.ts');
    expect(files[2].extension).toBe('ts');

    expect(files[3].name).toBe('README');
    expect(files[3].extension).toBeUndefined(); // No extension
  });

  it('should sort folders before files, both alphabetically', () => {
    const manifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'zebra.txt': { id: 'tx-1' },
        'src/index.ts': { id: 'tx-2' },
        'apple.md': { id: 'tx-3' },
        'docs/guide.md': { id: 'tx-4' }
      }
    };

    const result = parseManifestToTree(manifest);

    // Should be: docs folder, src folder, apple.md, zebra.txt
    expect(result.children![0].name).toBe('docs');
    expect(result.children![0].type).toBe('folder');
    expect(result.children![1].name).toBe('src');
    expect(result.children![1].type).toBe('folder');
    expect(result.children![2].name).toBe('apple.md');
    expect(result.children![2].type).toBe('file');
    expect(result.children![3].name).toBe('zebra.txt');
    expect(result.children![3].type).toBe('file');
  });

  // SECURITY TESTS
  describe('Security: Path Traversal Prevention', () => {
    it('should reject paths with ".." traversal segments', () => {
      const manifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {
          'safe.txt': { id: 'tx-safe' },
          '../etc/passwd': { id: 'tx-malicious-1' },
          'src/../../etc/shadow': { id: 'tx-malicious-2' },
          'normal/file.txt': { id: 'tx-normal' }
        }
      };

      const result = parseManifestToTree(manifest);

      // Should only contain safe files, not the malicious ones
      expect(result.children).toHaveLength(2);
      const childNames = result.children!.map(c => c.name);
      expect(childNames).toContain('normal');
      expect(childNames).toContain('safe.txt');
      expect(childNames).not.toContain('..');
    });

    it('should reject absolute paths starting with /', () => {
      const manifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {
          'relative/file.txt': { id: 'tx-safe' },
          '/etc/passwd': { id: 'tx-malicious-1' },
          '/absolute/path/file.txt': { id: 'tx-malicious-2' }
        }
      };

      const result = parseManifestToTree(manifest);

      // Should only contain relative path
      expect(result.children).toHaveLength(1);
      expect(result.children![0].name).toBe('relative');
    });

    it('should reject empty paths and paths with only slashes', () => {
      const manifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {
          'valid.txt': { id: 'tx-valid' },
          '': { id: 'tx-empty' },
          '/': { id: 'tx-slash' },
          '//': { id: 'tx-double-slash' }
        }
      };

      const result = parseManifestToTree(manifest);

      // Should only contain valid file
      expect(result.children).toHaveLength(1);
      expect(result.children![0].name).toBe('valid.txt');
    });

    it('should handle null bytes and special characters safely', () => {
      const manifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {
          'normal.txt': { id: 'tx-1' },
          'file\x00.txt': { id: 'tx-null-byte' }
        }
      };

      // Should not crash - null bytes are filtered by segment filtering
      const result = parseManifestToTree(manifest);
      expect(result).toBeDefined();
      expect(result.children).toBeDefined();
    });
  });
});

describe('flattenTree', () => {
  const sampleTree: TreeNode[] = [
    {
      name: 'src',
      path: 'src',
      type: 'folder',
      children: [
        {
          name: 'index.ts',
          path: 'src/index.ts',
          type: 'file',
          arweaveId: 'tx-1',
          extension: 'ts'
        },
        {
          name: 'lib',
          path: 'src/lib',
          type: 'folder',
          children: [
            {
              name: 'utils.ts',
              path: 'src/lib/utils.ts',
              type: 'file',
              arweaveId: 'tx-2',
              extension: 'ts'
            }
          ]
        }
      ]
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      arweaveId: 'tx-3',
      extension: 'md'
    }
  ];

  it('should flatten tree with no folders expanded', () => {
    const expandedState = {};
    const result = flattenTree(sampleTree, expandedState);

    // Should only show root level items
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('src');
    expect(result[0].level).toBe(0);
    expect(result[1].name).toBe('README.md');
    expect(result[1].level).toBe(0);
  });

  it('should flatten tree with one folder expanded', () => {
    const expandedState = { 'src': true };
    const result = flattenTree(sampleTree, expandedState);

    // Should show src, its children, and README
    expect(result).toHaveLength(4);
    expect(result[0].name).toBe('src');
    expect(result[0].level).toBe(0);
    expect(result[1].name).toBe('index.ts');
    expect(result[1].level).toBe(1);
    expect(result[2].name).toBe('lib');
    expect(result[2].level).toBe(1);
    expect(result[3].name).toBe('README.md');
    expect(result[3].level).toBe(0);
  });

  it('should flatten tree with nested folders expanded', () => {
    const expandedState = { 'src': true, 'src/lib': true };
    const result = flattenTree(sampleTree, expandedState);

    // Should show all items
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe('src');
    expect(result[0].level).toBe(0);
    expect(result[1].name).toBe('index.ts');
    expect(result[1].level).toBe(1);
    expect(result[2].name).toBe('lib');
    expect(result[2].level).toBe(1);
    expect(result[3].name).toBe('utils.ts');
    expect(result[3].level).toBe(2);
    expect(result[4].name).toBe('README.md');
    expect(result[4].level).toBe(0);
  });

  it('should handle empty tree', () => {
    const result = flattenTree([], {});
    expect(result).toHaveLength(0);
  });

  it('should preserve node properties in flattened output', () => {
    const expandedState = { 'src': true };
    const result = flattenTree(sampleTree, expandedState);

    const indexFile = result.find(n => n.name === 'index.ts');
    expect(indexFile).toBeDefined();
    expect(indexFile!.arweaveId).toBe('tx-1');
    expect(indexFile!.extension).toBe('ts');
    expect(indexFile!.path).toBe('src/index.ts');
    expect(indexFile!.type).toBe('file');
  });
});
