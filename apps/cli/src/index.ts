import { Command } from 'commander';
import { runSetupCheck } from './commands/setup-check';

const program = new Command();

program.name('knowhub').description('KnowHub AI Assistant CLI').version('0.1.0');

program
  .command('setup-check')
  .description('Run local setup readiness validation')
  .action(() => {
    const result = runSetupCheck(process.version);
    process.stdout.write(`${result}\n`);
  });

void program.parseAsync(process.argv);
