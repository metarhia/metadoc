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
  .option('private', {
    type: 'boolean',
    describe: 'Generate documentation for methods that have #private notation',
  })
  .option('contents-table', {
    type: 'number',
    describe: 'Generate contents table for API',
  })
  .option('separate-title-description', {
    type: 'boolean',
    describe: 'Generate separated title and description',
  })
  .option('remove-interface', {
    type: 'boolean',
    describe: 'do not add interface header',
  })
  .option('namespace-prefix', {
    type: 'boolean',
    describe: 'generate namespace prefix',
  })
  .option('min-header-level', {
    type: 'number',
    describe: 'minimal header level',
  })
  .option('interface-level', {
    type: 'number',
    describe: 'Set interface header level',
  })
  .option('function-level', {
    type: 'number',
    describe: 'Set top-level functions header level',
  })
  .option('class-level', {
    type: 'number',
    describe: 'Set class header level',
  })
  .option('method-level', {
    type: 'number',
    describe: 'Set class methods header level',
  })
  .option('static-method-level', {
    type: 'number',
    describe: 'Set class static methods header level',
  })
  .option('property-level', {
    type: 'number',
    describe: 'Set properties header level',
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
  .option('no-config', {
    type: 'boolean',
    describe: 'do not look for a configuration file',
  }).argv;

const loadFiles = files => {
  const result = [];
  files
    .map(file => {
      if (fs.existsSync(file + '.js')) {
        return file + '.js';
      } else if (fs.existsSync(file)) {
        return file;
      } else {
        console.error('File does not exist:', file);
        process.exit(1);
        return '';
      }
    })
    .forEach(file => {
      if (fs.statSync(file).isDirectory()) {
        const subfiles = fs.readdirSync(file).map(f => path.join(file, f));
        result.push(...loadFiles(subfiles));
      } else if (common.fileExt(file) === 'js') {
        result.push(file);
      }
    });
  return result;
};

const select = (...args) => args.find(a => a !== undefined);

const mergeConfigs = (args, cfg, defaultCfg) => {
  const result = {};
  Object.entries(defaultCfg).forEach(
    ([key, defaultVal]) =>
      (result[key] = Array.isArray(defaultVal)
        ? common.merge(args[key] || [], cfg[key] || [], defaultVal)
        : select(args[key], cfg[key], defaultVal))
  );
  return result;
};

const getConfig = args => {
  let cfg = {};
  if (Array.isArray(args.config)) args.config = args.config.pop();
  if (args.config !== false) {
    const configFile = args.config || '.metadocrc';
    if (fs.existsSync(configFile)) {
      cfg = JSON.parse(fs.readFileSync(configFile));
    }
  }

  const level = args.minHeaderLevel || cfg.minHeaderLevel || 1;
  const defaultConfig = {
    header: '',
    footer: '',
    files: [],
    customTypes: [],
    prioritizedEntries: [],
    private: false,
    contentsTable: 0,
    separateTitleDescription: true,
    removeInterface: false,
    namespacePrefix: false,
    interfaceLevel: level,
    functionLevel: level + 1,
    classLevel: level + 1,
    methodLevel: level + 2,
    staticMethodLevel: level + 2,
    propertyLevel: level + 2,
  };

  args.files = args._;
  const config = {
    ...mergeConfigs(args, cfg, defaultConfig),
    customLinks: [],
    outputDir: args.outputDir,
    outputFile: args.outputFile,
  };

  if (config.contentsTable === true) config.contentsTable = 0;
  else if (config.contentsTable === false) config.contentsTable = -1;

  const headerFile = args.headerFile || cfg.headerFile;
  if (headerFile && fs.existsSync(headerFile)) {
    config.header += fs.readFileSync(headerFile, 'utf8');
  }

  const footerFile = args.footerFile || cfg.footerFile;
  if (footerFile && fs.existsSync(footerFile)) {
    config.footer += fs.readFileSync(footerFile, 'utf8');
  }

  if (config.files.length === 0 && fs.existsSync('package.json')) {
    const pkg = require(path.resolve('./package.json'));
    if (pkg.main && fs.existsSync(pkg.main)) {
      config.files.push(path.resolve(pkg.main));
    }
  } else {
    config.files = loadFiles(config.files).map(file => path.resolve(file));
  }

  if (cfg.customLinks) {
    config.customTypes = Object.keys(cfg.customLinks);
    config.customLinks = Object.entries(cfg.customLinks);
  }

  if (args.outputFile || args.outputDir) {
    config.outputDir = args.outputDir;
    config.outputFile = args.outputFile;
  } else {
    config.outputDir = cfg.outputDir;
    config.outputFile = cfg.outputFile;
  }

  config.writeToStdout =
    args.writeToStdout || !(config.outputFile || config.outputDir);

  return config;
};

const getData = () => {
  let data = '';
  for (const module in require.cache) {
    if (
      !module.includes('node_modules') &&
      module !== __filename &&
      fs.existsSync(module) &&
      common.fileExt(module) !== 'node'
    ) {
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
  config.outputDir = path.dirname(config.outputFile);
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
  common.mkdirp(config.outputDir, err => {
    if (err) {
      console.error('Cannot create output directory', err);
      return;
    }
    for (const [file, data] of output) {
      fs.writeFileSync(file, data);
      console.log(file);
    }
  });
}
