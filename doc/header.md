# Metarhia Documentation Generator

[![TravisCI](https://travis-ci.com/metarhia/metadoc.svg?branch=master)](https://travis-ci.com/metarhia/metadoc)

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
