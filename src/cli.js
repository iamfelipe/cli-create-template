import arg from 'arg';
// import fs from 'fs';
// import path from 'path';
import yargs from 'yargs';
import inquirer from 'inquirer';
import { createProject } from './main';

// const CHOICES = fs.readdirSync(path.join(__dirname, '../templates'));

function parseArgumentsIntoOptions(rawArgs) {
  // Define the command line arguments
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'static-boilerplate';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [
    {
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: ['static-boilerplate'],
      default: defaultTemplate,
      when: () => !yargs.argv['template'],
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      default: false,
      when: () => !yargs.argv['git'],
    },
  ];

  // Prompt the user for options
  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}
