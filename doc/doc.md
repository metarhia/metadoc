# Metarhia Documentation Generator

[![TravisCI](https://travis-ci.com/metarhia/metadoc.svg?branch=master)](https://travis-ci.com/metarhia/metadoc)

## Installation

```cmd
$ npm install @metarhia/doc
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

### Interface: doc

#### introspect(namespace, text)

  - `namespace`: [`<Map>`] hash of interfaces
  - `text`: [`<string>`] data to parse

*Returns:* [`<Map>`] hash of hash of records, { title, description, parameters,
    comments }


Introspect interface


#### parseSignature(fn, text, start)

  - `fn`: [`<Function>`]` | `[`<RegExp>`] to be searched
  - `text`: [`<string>`] to be searched in
  - `start`: [`<number>`] position to start searching from

*Returns:* [`<Object>`] function signature
  - `title`: [`<string>`] short function description
  - `description`: [`<string>`] extended function description
  - `parameters`: [`<Object[]>`][`<Object>`] function parameters, { name, types,
        nonStandardTypes, comment, offset }
  - `comments`: [`<Object[]>`][`<Object>`] comments about returned value, thrown
        errors, deprecation and usage, { name, types, nonStandardTypes, comment
        }


Parse function signature


#### generateMd(inventory, options)

  - `inventory`: [`<Map>`] hash of map of records, { method, title, parameters }
  - `options`: [`<Object>`]
    - `header`: [`<string>`] text before api documentation
    - `footer`: [`<string>`] text after api documentation
    - `customTypes`: [`<string[]>`][`<string>`] custom types
    - `customLinks`: [`<Array[]>`][`<Array>`] custom types links

*Returns:* [`<string>`] md document


Generate md from interfaces inventory


## Contributors

See GitHub for a full [list of contributors](https://github.com/metarhia/metadoc/graphs/contributors)

## License

Licesed under MIT license. Copyright (c) 2018 Metarhia contributors


[`<Object>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[`<Function>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[`<RegExp>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[`<Map>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[`<number>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`<string>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
