import { type ChildProcess, execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Custom Shadcn Registry', () => {
  const rootDir = process.cwd();
  const registryJsonPath = path.join(rootDir, 'registry.json');
  const publicRDir = path.join(rootDir, 'public', 'r');

  it('contains a valid registry.json configuration', () => {
    expect(fs.existsSync(registryJsonPath)).toBe(true);
    const registryContent = fs.readFileSync(registryJsonPath, 'utf-8');
    const registryData = JSON.parse(registryContent);

    expect(registryData.name).toBe('@nextjob');
    expect(registryData.items).toBeDefined();
    expect(Array.isArray(registryData.items)).toBe(true);
    expect(registryData.items.length).toBeGreaterThan(0);

    const appCardItem = registryData.items.find(
      (item: { name: string }) => item.name === 'application-card'
    );
    expect(appCardItem).toBeDefined();
    expect(appCardItem.type).toBe('registry:component');
    expect(appCardItem.files).toBeDefined();
  });

  it('has source files for all declared registry items', () => {
    const registryContent = fs.readFileSync(registryJsonPath, 'utf-8');
    const registryData = JSON.parse(registryContent);

    for (const item of registryData.items) {
      for (const file of item.files) {
        const filePath = path.join(rootDir, file.path);
        expect(fs.existsSync(filePath)).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(0);
      }
    }
  });

  it('generates valid static JSON registry artifacts in public/r upon build', () => {
    expect(fs.existsSync(publicRDir)).toBe(true);

    const builtRegistryPath = path.join(publicRDir, 'registry.json');
    expect(fs.existsSync(builtRegistryPath)).toBe(true);

    const appCardArtifactPath = path.join(publicRDir, 'application-card.json');
    expect(fs.existsSync(appCardArtifactPath)).toBe(true);

    const appCardData = JSON.parse(fs.readFileSync(appCardArtifactPath, 'utf-8'));
    expect(appCardData.name).toBe('application-card');
    expect(appCardData.files).toBeDefined();
    expect(appCardData.files.length).toBeGreaterThan(0);
    expect(appCardData.files[0].content).toContain('export function ApplicationCard');
  });

  describe('CLI Installation Integration Test', () => {
    let serverProcess: ChildProcess;
    const PORT = 5173;

    beforeAll(async () => {
      serverProcess = spawn(
        'python3',
        ['-m', 'http.server', String(PORT), '--directory', 'public'],
        {
          cwd: rootDir,
          stdio: 'ignore',
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill();
      }
    });

    it('successfully installs @nextjob/application-card via shadcn CLI', () => {
      const installedComponentPath = path.join(
        rootDir,
        'src',
        'components',
        'application-card.tsx'
      );

      execSync('npx shadcn@latest add @nextjob/application-card -y -o', {
        cwd: rootDir,
        encoding: 'utf-8',
        env: { ...process.env },
      });

      expect(fs.existsSync(installedComponentPath)).toBe(true);
      const installedContent = fs.readFileSync(installedComponentPath, 'utf-8');
      expect(installedContent).toContain('export function ApplicationCard');
    });
  });
});
