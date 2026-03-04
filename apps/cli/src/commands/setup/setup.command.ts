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
          'Limpando credenciais antigas no OS Credential Store...',
        ).start();
        try {
          await credentialStoreService.cleanupClientCredentials(existingClientId);
          secretCleanupSpinner.succeed('Credenciais antigas removidas do OS Credential Store.');
        } catch {
          secretCleanupSpinner.warn(
            'Nao foi possivel remover todas as credenciais antigas. O setup continuara normalmente.',
          );
        }
      }

      const setupSpinner = ora('Gerando identidade e segredos locais...').start();
      const crypto = cryptoService.generate();
      await credentialStoreService.storeClientSecret(crypto.clientId, crypto.clientSecret);
      await credentialStoreService.storePrivateKey(crypto.clientId, crypto.privateKeyPem);
      const writeResult = configWriter.writeConfig(crypto.clientId, crypto.publicKeyPem);
      setupSpinner.succeed('Segredos armazenados no OS Credential Store com sucesso.');

      const dbPath = path.resolve(writeResult.dataDir, 'knowhub.db');
      if (shouldResetStorage) {
        const cleanupSpinner = ora('Limpando banco local anterior...').start();
        const filesToRemove = [`${dbPath}`, `${dbPath}-wal`, `${dbPath}-shm`];
        for (const filePath of filesToRemove) {
          if (existsSync(filePath)) {
            rmSync(filePath, { force: true });
          }
        }
        cleanupSpinner.succeed('Banco local anterior removido.');
      }

      const migrationSpinner = ora('Aplicando migrations do banco local...').start();
      migrationService.run(dbPath);
      migrationSpinner.succeed('Migrations aplicadas com sucesso.');

      const seedSpinner = ora('Provisionando usuario padrao...').start();
      bootstrapService.bootstrap(dbPath, userName);
      seedSpinner.succeed('Usuario padrao provisionado.');

      const ollamaSpinner = ora('Detectando Ollama...').start();
      const ollama = await ollamaCheckService.check();
      if (ollama.available) {
        ollamaSpinner.succeed(ollama.message);
      } else {
        ollamaSpinner.warn(`${ollama.message} Instale em https://ollama.ai/download`);
      }

      const ecosystemPath = ecosystemService.write(process.cwd());

      process.stdout.write('Setup concluido com sucesso.\n');
      process.stdout.write(`URL: http://localhost:3000\n`);
      process.stdout.write(`clientId: ${crypto.clientId}\n`);
      process.stdout.write(`config: ${writeResult.configPath}\n`);
      process.stdout.write(`database: ${dbPath}\n`);
      process.stdout.write(`ecosystem: ${ecosystemPath}\n`);
      process.stdout.write('Proximo passo: pm2 start ecosystem.config.js\n');
      process.stdout.write('Depois execute npm run dev e npm run dev:web.\n');
    });
}
