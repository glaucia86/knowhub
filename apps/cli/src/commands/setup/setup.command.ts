import { createInterface } from 'node:readline';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import ora from 'ora';
import { SetupBootstrapService } from '../../lib/setup/setup-bootstrap.service';
import { SetupConfigWriterService } from '../../lib/setup/setup-config-writer.service';
import { SetupCredentialStoreService } from '../../lib/setup/setup-credential-store.service';
import { SetupCryptoService } from '../../lib/setup/setup-crypto.service';
import { SetupEcosystemService } from '../../lib/setup/setup-ecosystem.service';
import { SetupMigrationService } from '../../lib/setup/setup-migration.service';
import { SetupOllamaCheckService } from '../../lib/setup/setup-ollama-check.service';

interface SetupOptions {
  reset?: boolean;
  nonInteractive?: boolean;
  name?: string;
}

async function askUserName(): Promise<string> {
  const rl = createInterface({
    input: process.stdin as never,
    output: process.stdout as never,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('Nome do usuario [Usuario]: ', (value) => resolve(value.trim()));
  });
  rl.close();
  return answer || 'Usuario';
}

async function askOverwriteConfirmation(): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin as never,
    output: process.stdout as never,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('Configuracao existente detectada. Deseja sobrescrever? [y/N]: ', (value) =>
      resolve(value.trim().toLowerCase()),
    );
  });
  rl.close();
  return answer === 'y' || answer === 'yes' || answer === 's' || answer === 'sim';
}

export function registerSetupCommand(program: Command): void {
  program
    .command('setup')
    .description('Configura o ambiente local do KnowHub em um comando')
    .option('--reset', 'forca reconfiguracao local')
    .option('--non-interactive', 'executa sem prompts interativos')
    .option('--name <name>', 'nome do usuario padrao local')
    .action(async (options: SetupOptions) => {
      const configWriter = new SetupConfigWriterService();
      const existingClientId = configWriter.readExistingClientId();
      let shouldResetStorage = options.reset ?? false;

      if (configWriter.isAlreadyConfigured() && !options.reset) {
        if (options.nonInteractive) {
          process.stdout.write(
            'KnowHub ja configurado. Use --reset para reconfigurar em modo nao interativo.\n',
          );
          return;
        }

        const confirmed = await askOverwriteConfirmation();
        if (!confirmed) {
          process.stdout.write('Operacao cancelada. Configuracao existente mantida.\n');
          return;
        }
        shouldResetStorage = true;
      }

      let userName = options.name?.trim() || 'Usuario';
      if (!options.nonInteractive && !options.name) {
        userName = await askUserName();
      }

      const cryptoService = new SetupCryptoService();
      const credentialStoreService = new SetupCredentialStoreService();
      const migrationService = new SetupMigrationService();
      const bootstrapService = new SetupBootstrapService();
      const ollamaCheckService = new SetupOllamaCheckService();
      const ecosystemService = new SetupEcosystemService();

      if (shouldResetStorage && existingClientId) {
        const secretCleanupSpinner = ora(
          'Cleaning up old credentials from OS Credential Store...',
        ).start();
        try {
          await credentialStoreService.cleanupClientCredentials(existingClientId);
          secretCleanupSpinner.succeed('Old credentials removed from OS Credential Store.');
        } catch {
          secretCleanupSpinner.warn(
            'Could not remove all old credentials. Setup will continue normally.',
          );
        }
      }

      const setupSpinner = ora('Generating local identity and secrets...').start();
      const crypto = cryptoService.generate();
      let writeResult: ReturnType<SetupConfigWriterService['writeConfig']>;
      try {
        await credentialStoreService.storeClientSecret(crypto.clientId, crypto.clientSecret);
        await credentialStoreService.storePrivateKey(crypto.clientId, crypto.privateKeyPem);
        writeResult = configWriter.writeConfig(crypto.clientId, crypto.publicKeyPem);
        setupSpinner.succeed('Secrets successfully stored in the OS Credential Store.');
      } catch (error) {
        setupSpinner.fail('Failed to store secrets in the OS Credential Store.');
        throw error;
      }

      const dbPath = path.resolve(writeResult.dataDir, 'knowhub.db');
      if (shouldResetStorage) {
        const cleanupSpinner = ora('Cleaning up previous local database...').start();
        const filesToRemove = [`${dbPath}`, `${dbPath}-wal`, `${dbPath}-shm`];
        for (const filePath of filesToRemove) {
          if (existsSync(filePath)) {
            rmSync(filePath, { force: true });
          }
        }
        cleanupSpinner.succeed('Previous local database removed.');
      }

      const migrationSpinner = ora('Applying local database migrations...').start();
      migrationService.run(dbPath);
      migrationSpinner.succeed('Local database migrations applied successfully.');

      const seedSpinner = ora('Provisioning default user...').start();
      bootstrapService.bootstrap(dbPath, userName);
      seedSpinner.succeed('Default user provisioned.');

      const ollamaSpinner = ora('Detecting Ollama...').start();
      const ollama = await ollamaCheckService.check();
      if (ollama.available) {
        ollamaSpinner.succeed(ollama.message);
      } else {
        ollamaSpinner.warn(`${ollama.message} Install at https://ollama.ai/download`);
      }

      const ecosystemPath = ecosystemService.write(process.cwd(), dbPath);

      process.stdout.write('Setup completed successfully.\n');
      process.stdout.write('Web URL: http://localhost:3000\n');
      process.stdout.write('API URL: http://localhost:3001\n');
      process.stdout.write(`clientId: ${crypto.clientId}\n`);
      process.stdout.write(
        'Security note: clientId is not a secret. clientSecret is stored in the OS Credential Store and is never printed.\n',
      );
      process.stdout.write(`config: ${writeResult.configPath}\n`);
      process.stdout.write(`database: ${dbPath}\n`);
      process.stdout.write(`ecosystem: ${ecosystemPath}\n`);
      process.stdout.write('Next step: pm2 start ecosystem.config.js\n');
      process.stdout.write('Then run npm run dev and npm run dev:web.\n');
    });
}
