# Metarhia Documentation Generator

[![CI Status Badge](https://github.com/metarhia/metadoc/workflows/Testing%20CI/badge.svg)](https://github.com/metarhia/metadoc/actions?query=workflow%3A%22Testing+CI%22+branch%3Amaster)

## Installation

```shell
$ npm install -g @metarhia/doc
```

## Cli usage

```
metadoc [options] file.js [file.js...]

Options:
  --help                 Show help                                     [boolean]
  --version              Show version number                           [boolean]
  --header               header for the resulting doc file              [string]
  --footer               footer for the resulting doc file              [string]
  --header-file          file with header for the resulting doc file    [string]
  --footer-file          file with footer for the resulting doc file    [string]
  --write-to-stdout, -o  write output to stdout instead of files       [boolean]
  --output-dir, -d       output directory for separate doc files        [string]
  --output-file, -f      output directory for merged doc file           [string]
  --config, -c           custom config file                             [string]
```

## API

### Table of Contents
