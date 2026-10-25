import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const registryJsonPath = path.join(rootDir, 'registry.json');
const publicRDir = path.join(rootDir, 'public', 'r');

type RegistryItem = { name: string; type: string; files: { path: string }[] };
type RegistryFile = { content: string; path: string };
type BuiltArtifact = { name: string; files: RegistryFile[] };

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

describe('Custom Shadcn Registry', () => {
  it('contains a valid registry.json configuration', () => {
    expect(fs.existsSync(registryJsonPath)).toBe(true);
    const registry = readJson<{ name: string; items: RegistryItem[] }>(registryJsonPath);

    expect(registry.name).toBe('@nextjob');
    expect(Array.isArray(registry.items)).toBe(true);
    expect(registry.items.length).toBeGreaterThan(0);

    for (const item of registry.items) {
      expect(item.name, 'every item needs a name').toBeTruthy();
      expect(item.type, `${item.name} needs a type`).toBeTruthy();
      expect(item.files.length, `${item.name} needs files`).toBeGreaterThan(0);
    }
  });

  it('has source files for all declared registry items', () => {
    const registry = readJson<{ items: RegistryItem[] }>(registryJsonPath);

    for (const item of registry.items) {
      for (const file of item.files) {
        const filePath = path.join(rootDir, file.path);
        expect(fs.existsSync(filePath), `missing source file ${file.path}`).toBe(true);
        expect(fs.statSync(filePath).size).toBeGreaterThan(0);
      }
    }
  });

  // Artifacts in public/r are built by `bun run registry:build` (unpinned shadcn
  // CLI, network) and committed so consumers get a static registry. This test
  // guards the committed output instead of shelling out to that CLI: an
  // `npx shadcn@latest add` in the unit suite was a 17s network call that
  // timed out at 5s and rewrote files under src/.
  it('ships a built artifact for every declared item', () => {
    expect(fs.existsSync(publicRDir)).toBe(true);
    expect(fs.existsSync(path.join(publicRDir, 'registry.json'))).toBe(true);

    const registry = readJson<{ items: RegistryItem[] }>(registryJsonPath);

    for (const item of registry.items) {
      const artifactPath = path.join(publicRDir, `${item.name}.json`);
      expect(fs.existsSync(artifactPath), `missing artifact for ${item.name}`).toBe(true);

      const artifact = readJson<BuiltArtifact>(artifactPath);
      expect(artifact.name).toBe(item.name);
      expect(artifact.files.length).toBeGreaterThan(0);

      for (const file of artifact.files) {
        expect(file.content.length).toBeGreaterThan(0);
        expect(file.content).toContain('export');
      }
    }
  });
});
