import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Command } from 'commander';
import { registerSetupCommand } from './setup.command';
import { SetupConfigWriterService } from '../../lib/setup/setup-config-writer.service';
import { SetupCryptoService } from '../../lib/setup/setup-crypto.service';
import { SetupCredentialStoreService } from '../../lib/setup/setup-credential-store.service';
import { SetupMigrationService } from '../../lib/setup/setup-migration.service';
import { SetupBootstrapService } from '../../lib/setup/setup-bootstrap.service';
import { SetupOllamaCheckService } from '../../lib/setup/setup-ollama-check.service';
import { SetupEcosystemService } from '../../lib/setup/setup-ecosystem.service';

describe('setup command flow', () => {
  it('blocks rerun when already configured and no --reset was passed', async () => {
    const originalIsConfigured = SetupConfigWriterService.prototype.isAlreadyConfigured;
    const originalWrite = process.stdout.write.bind(process.stdout);
    const output: string[] = [];

    SetupConfigWriterService.prototype.isAlreadyConfigured = () => true;
    (process.stdout.write as unknown as (chunk: string) => boolean) = ((chunk: string) => {
      output.push(chunk);
      return true;
    }) as never;

    try {
      const program = new Command();
      registerSetupCommand(program);

      await program.parseAsync(['setup', '--non-interactive'], {
        from: 'user',
      });

      assert.equal(output.join('').includes('Use --reset para reconfigurar'), true);
    } finally {
      SetupConfigWriterService.prototype.isAlreadyConfigured = originalIsConfigured;
      (process.stdout.write as unknown as (chunk: string) => boolean) = originalWrite as never;
    }
  });

  it('runs full setup flow in non-interactive mode', async () => {
    const originalIsConfigured = SetupConfigWriterService.prototype.isAlreadyConfigured;
    const originalWriteConfig = SetupConfigWriterService.prototype.writeConfig;
    const originalGenerate = SetupCryptoService.prototype.generate;
    const originalStoreClientSecret = SetupCredentialStoreService.prototype.storeClientSecret;
    const originalStorePrivateKey = SetupCredentialStoreService.prototype.storePrivateKey;
    const originalRunMigration = SetupMigrationService.prototype.run;
    const originalBootstrap = SetupBootstrapService.prototype.bootstrap;
    const originalCheckOllama = SetupOllamaCheckService.prototype.check;
    const originalWriteEcosystem = SetupEcosystemService.prototype.write;
    const originalWrite = process.stdout.write.bind(process.stdout);

    const output: string[] = [];
    let seededName = '';

    SetupConfigWriterService.prototype.isAlreadyConfigured = () => false;
    SetupConfigWriterService.prototype.writeConfig = () => ({
      configPath: 'C:/temp/.knowhub/config.json',
      publicKeyPath: 'C:/temp/.knowhub/public.pem',
      knowhubDir: 'C:/temp/.knowhub',
      dataDir: 'C:/temp/.knowhub/data',
    });
    SetupCryptoService.prototype.generate = () => ({
      clientId: 'client-1',
      clientSecret: 'secret-1',
      publicKeyPem: 'PUBLIC-PEM',
      privateKeyPem: 'PRIVATE-PEM',
    });
    SetupCredentialStoreService.prototype.storeClientSecret = async () => undefined;
    SetupCredentialStoreService.prototype.storePrivateKey = async () => undefined;
    SetupMigrationService.prototype.run = () => undefined;
    SetupBootstrapService.prototype.bootstrap = (_dbPath: string, userName: string) => {
      seededName = userName;
    };
    SetupOllamaCheckService.prototype.check = async () => ({
      available: true,
      message: 'Ollama OK',
    });
    SetupEcosystemService.prototype.write = () => 'C:/repo/ecosystem.config.js';
    (process.stdout.write as unknown as (chunk: string) => boolean) = ((chunk: string) => {
      output.push(chunk);
      return true;
    }) as never;

    try {
      const program = new Command();
      registerSetupCommand(program);
      await program.parseAsync(['setup', '--non-interactive', '--name', 'Ana'], {
        from: 'user',
      });

      assert.equal(seededName, 'Ana');
      const fullOutput = output.join('');
      assert.equal(fullOutput.includes('Setup concluido com sucesso.'), true);
      assert.equal(fullOutput.includes('URL: http://localhost:3000'), true);
      assert.equal(fullOutput.includes('clientId: client-1'), true);
      assert.equal(fullOutput.includes('pm2 start ecosystem.config.js'), true);
    } finally {
      SetupConfigWriterService.prototype.isAlreadyConfigured = originalIsConfigured;
      SetupConfigWriterService.prototype.writeConfig = originalWriteConfig;
      SetupCryptoService.prototype.generate = originalGenerate;
      SetupCredentialStoreService.prototype.storeClientSecret = originalStoreClientSecret;
      SetupCredentialStoreService.prototype.storePrivateKey = originalStorePrivateKey;
      SetupMigrationService.prototype.run = originalRunMigration;
      SetupBootstrapService.prototype.bootstrap = originalBootstrap;
      SetupOllamaCheckService.prototype.check = originalCheckOllama;
      SetupEcosystemService.prototype.write = originalWriteEcosystem;
      (process.stdout.write as unknown as (chunk: string) => boolean) = originalWrite as never;
    }
  });
});
