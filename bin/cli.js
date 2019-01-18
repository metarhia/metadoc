#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const common = require('@metarhia/common');

const doc = require('..');

const args = yargs
  .usage('$0 [options] file.js [file.js...]')
  .option('header', {
    type: 'string',
    describe: 'header for the resulting doc file',
  })
  .option('footer', {
    type: 'string',
    describe: 'footer for the resulting doc file',
  })
  .option('header-file', {
    type: 'string',
    describe: 'file with header for the resulting doc file',
  })
  .option('footer-file', {
    type: 'string',
    describe: 'file with footer for the resulting doc file',
  })
  .option('write-to-stdout', {
    alias: 'o',
    type: 'boolean',
    describe: 'write output to stdout instead of files',
  })
  .option('output-dir', {
    alias: 'd',
    type: 'string',
    describe: 'output directory for separate doc files',
  })
  .option('output-file', {
    alias: 'f',
    type: 'string',
    describe: 'output directory for merged doc file',
  })
  .option('config', {
    alias: 'c',
    type: 'string',
    describe: 'custom config file',
  })
  .argv;

const getConfig = args => {
  let cfg = {};
  if (args.config && fs.existsSync(args.config)) {
    cfg = JSON.parse(fs.readFileSync(args.config));
  } else if (args.config === '') {
    cfg = JSON.parse(fs.readFileSync('.metadocrc'));
  }

  const config = {
    header: cfg.header || args.header || '',
    footer: cfg.footer || args.footer || '',
    files: common.merge(args._, cfg.files || []),
    customLinks: [],
    outputDir: args.outputDir,
    outputFile: args.outputFile,
  };

  const headerFile = args.headerFile || cfg.headerFile;
  if (headerFile && fs.existsSync(headerFile)) {
    config.header += fs.readFileSync(headerFile, 'utf8');
  }

  const footerFile = args.footerFile || cfg.footerFile;
  if (footerFile && fs.existsSync(footerFile)) {
    config.footer += fs.readFileSync(footerFile, 'utf8');
  }

  config.files = config.files.map(file => path.resolve(file));

  if (cfg.customLinks) {
    config.customTypes = Object.getOwnPropertyNames(cfg.customLinks);
    for (const type in cfg.customLinks) {
      config.customLinks.push([type, cfg.customLinks[type]]);
    }
  }

  if (args.outputFile || args.outputDir) {
    config.outputDir = args.outputDir;
    config.outputFile = args.outputFile;
  } else {
    config.outputDir = cfg.outputDir;
    config.outputFile = cfg.outputFile;
  }

  config.writeToStdout = args.writeToStdout ||
    !(config.outputFile || config.outputDir);

  return config;
};

const getData = () => {
  let data = '';
  for (const module in require.cache) {
    if (!module.includes('node_modules') &&
      module !== __filename &&
      fs.existsSync(module) &&
      common.fileExt(module) !== 'node') {
      data += fs.readFileSync(module, 'utf8') + '\n';
    }
  }
  return data;
};

const config = getConfig(args);
if (config.outputDir && config.outputFile) {
  console.error('Both outputFile and outputDir specified. Exiting...');
  process.exit(1);
} else if (config.files.length === 0) {
  console.error('No files were specified. Exiting...');
  process.exit(1);
}

const namespace = new Map(
  config.files.map(file => [path.basename(file, '.js'), require(file)])
);
const inventory = doc.introspect(namespace, getData());
const output = new Map();

if (config.outputDir) {
  for (const [name, value] of inventory) {
    const md = doc.generateMd(new Map([[name, value]]), config);
    output.set(path.join(config.outputDir, name + '.md'), md);
  }
} else {
  const md = doc.generateMd(inventory, config);
  output.set(config.outputFile, md);
}

if (config.writeToStdout) {
  const sep = '='.repeat(process.stdout.columns);
  console.log('write-to-file flag was not specified\n');
  console.log('Writting to stdout...\n');
  for (const [file, data] of output) {
    console.log(`${sep}\nDocumentation for ${file}:\n\n${data}\n`);
  }
} else {
  console.log('Writting output to following files...');
  for (const [file, data] of output) {
    fs.writeFileSync(file, data);
    console.log(file);
  }
}