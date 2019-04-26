# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][unreleased]

### Added

- Support for parameter function `Returns:` comment.
- Support for `Promise` type.
- This CHANGELOG.md file.

### Fixed

- Custom embedded comments links.

## [0.5.2][] - 2019-04-26

### Added

- Support for static properties.
- Support for multiple signatures.

### Fixed

- Class constructor comments parsing

## [0.5.1][] - 2019-04-24

### Added

- Support for custom comments links.
- Support for functions in `namespace`.
- Allow specifying headers level. Headers level for interface name, top-level
  functions, classes, class methods, class static methods, properties can be
  specified individually via `--interface-level`, `--function-level`,
  `--class-level`, `--method-level`, `--static-method-level`,
  `--property-level` cli options or `interfaceLevel`, `functionLevel`,
  `classLevel`, `methodLevel`, `staticMethodLevel`, `propertyLevel` config
  options.

### Changed

- Create output directory if it does not exist.

### Fixed

- One argument lambda functions parsing.
- Complex array type generation.

## [0.5.0][] - 2019-04-15

### Added

- Support for class inheritance.
- Support for getters and setters. They can be specified via `Properties:`
  comment.

## [0.4.1][] - 2019-04-11

### Added

- Allow to specify minimal header level via `--min-header-level` cli option or
  `minHeaderLevel` config option.

## [0.4.0][] - 2019-04-10

### Added

- Support for functions native arguments generation. If neither `Signature:`
  comment nor parameters were specified arguments from function code will be
  used instead.

### Changed

- Escape underscore in headers.
- Add a semicolon at the end of `Example` and `Result` if there is no one.
- Generate class prefix.

### Fixed

- Embeded code generation.

## [0.3.0][] - 2019-04-05

### Changed

- Md generation will be compatible with `prettier`.

## [0.2.1][] - 2019-03-25

### Added

- `--no-config` cli option.
- Support for class properties via `Properties:` comment.
- Support for async functions.

### Changed

- Title is optional.
- Add explicit brackets after types links.
- Use `.metadocrc` as default config.
- Do not generate extra empty lines between functions.

### Removed

- Dropped support for Node.js 6.

### Fixed

- Folders which should be parsed can be specified along with files in cli and
  via config `files` option.

## [0.2.0][] - 2019-02-16

### Added

- Function arguments signature can be specified via `Signature:` comment. It
  will overwrite arguments based on parameters comments.
- Interface name generation can be disabled via `--remove-interface` cli
  option or `removeInterface` config option.
- Support for rest operator.
- Support for `BigInt` type.
- Support for `eslint-disable-next-line`.

### Changed

- Type(s) in function arguments are optional.
- Comments in function arguments are optional.
- Type(s) in title, description, function comments and arguments comments will
  be wrapped in markdown.

### Fixed

- Array type parsing.
- Cli arguments priority.
- Do not generate extra empty line after arguments.
- Empty class constructor parsing.

## [0.1.0][] - 2019-01-18

### Added

- The first implementation of the package.

[unreleased]: https://github.com/metarhia/metadoc/compare/v0.5.2...HEAD
[0.5.2]: https://github.com/metarhia/metadoc/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/metarhia/metadoc/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/metarhia/metadoc/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/metarhia/metadoc/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/metarhia/metadoc/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/metarhia/metadoc/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/metarhia/metadoc/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/metarhia/metadoc/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/metarhia/metadoc/releases/tag/v0.1.0
