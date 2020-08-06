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

- [introspect](#introspectnamespace-text)
- [parseSignature](#parsesignaturefn-text-start)
- [generateMd](#generatemdinventory-options)

#### introspect(namespace, text)

- `namespace`: [`<Map>`][map] hash of interfaces
- `text`: [`<string>`][string] data to parse

_Returns:_ [`<Map>`][map] hash of hash of records,
`{ title, description, parameters, comments }`

Introspect interface

#### parseSignature(fn, text, start)

- `fn`: [`<Function>`][function]|[`<RegExp>`][regexp] to be searched
- `text`: [`<string>`][string] to be searched in
- `start`: [`<number>`][number] position to start searching from

_Returns:_ [`<Object>`][object] function signature

- `title`: [`<string>`][string] short function description
- `description`: [`<string>`][string] extended function description
- `argsSignature`: [`<string>`][string] custom function signature
- `parameters`: [`<Object[]>`][object] function parameters,
  `{ name, types, nonStandardTypes, comment, offset }`
- `comments`: [`<Object[]>`][object] comments about returned value, thrown
  errors, deprecation and usage, `{ name, types, nonStandardTypes, comment }`

Parse function signature

#### generateMd(inventory, options)

- `inventory`: [`<Map>`][map] hash of map of records,
  `{ method, title, parameters }`
- `options`: [`<Object>`][object]
  - `header`: [`<string>`][string] text before api documentation
  - `footer`: [`<string>`][string] text after api documentation
  - `customTypes`: [`<string[]>`][string] custom types
  - `customLinks`: [`<Array[]>`][array] custom types links

_Returns:_ [`<string>`][string] md document

Generate md from interfaces inventory

## Contributors

See GitHub for a full [list of contributors](https://github.com/metarhia/metadoc/graphs/contributors)

## License

Licesed under MIT license. Copyright (c) 2018 Metarhia contributors

[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
