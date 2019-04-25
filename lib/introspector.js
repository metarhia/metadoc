'use strict';

const common = require('@metarhia/common');
const types = require('./types');
const ALL_TYPES = new Set(types.ALL_TYPES);

const NAMED_LINES = [
  'Returns:', // returned value
  'Properties:', // class instance/function properties
  'Static properties:', // class instance/function properties
  'Example:', // example of usage
  'Result:', // result of usage, should be used with `Example`
  'Throws:', // thrown errors
  'Deprecated:', // reasons for deprecation or previous names
];
const FOUR_SPACES = ' '.repeat(4);
const SIGNATURE = 'Signature:';

// Search `text` for `fn` occurrences
//   fn - <Function> | <RegExp>, to be searched
//   text - <string>, to be searched in
//   start - <number>, position to start searching from
// Returns: <Array>, lines of comments before function
const parseComments = (fn, text, start) => {
  if (start === -1) return [];

  text = text.slice(start);
  const fnIndex =
    fn instanceof RegExp ? text.search(fn) : text.indexOf(fn.toString());
  const lines = text
    .slice(0, fnIndex)
    .split('\n')
    .map(line => line.trim());
  const comments = [];

  for (let i = lines.length - 2; i >= 0; i--) {
    const line = lines[i].trimLeft();
    if (!line.startsWith('//')) break;
    comments.unshift(line.slice(3));
  }
  return comments
    .map(line => line.trimRight())
    .filter(
      line => line.length !== 0 && !line.startsWith('eslint-disable-next-line')
    );
};

const isNamedLine = line => NAMED_LINES.find(s => line.startsWith(s));

const splitAtIndex = (line, index) => [line.slice(0, index), line.slice(index)];

const splitComments = lines => {
  let i = 0;
  let hasSignature = false;
  while (i < lines.length) {
    if (lines[i].startsWith(' ') || isNamedLine(lines[i])) break;
    if (lines[i].startsWith(SIGNATURE)) {
      hasSignature = true;
      break;
    }
    i++;
  }
  const signatureStart = i;

  if (hasSignature) {
    i++;
    while (
      i < lines.length &&
      (lines[i].startsWith(FOUR_SPACES) || lines[i].startsWith(SIGNATURE))
    ) {
      i++;
    }
  }
  const paramStart = i;

  while (i < lines.length && !isNamedLine(lines[i])) i++;
  const commentsStart = i;

  const description = lines.slice(0, signatureStart);
  const argsSignature = lines.slice(signatureStart, paramStart);
  const parameters = lines.slice(paramStart, commentsStart);
  const comments = lines.slice(commentsStart);
  return { description, argsSignature, parameters, comments };
};

const parseTypes = rest => {
  const regex = new RegExp(/<[\w.]+(\[])?>/);
  const regexArr = new RegExp(/\[ ?<[\w.]+(\[])?>(, ?<[\w.]+(\[])?>)* ?]/);
  let comment = rest;
  let type = '';

  while (true) {
    if (
      comment.startsWith('<') ||
      (comment.startsWith(' | ') && comment.indexOf('<') === 3)
    ) {
      const start = comment.indexOf('<');
      const end = comment.indexOf('>') + 1;
      if (!regex.test(comment.slice(start, end))) break;
      type += comment.slice(0, end);
      comment = comment.slice(end);
    } else if (
      comment.startsWith('[') ||
      (comment.startsWith(' | ') && comment.indexOf('[') === 3)
    ) {
      const start = comment.indexOf('[');
      const end = comment.lastIndexOf(']') + 1;
      if (!regexArr.test(comment.slice(start, end))) break;
      type += comment.slice(0, end);
      comment = comment.slice(end);
    } else {
      break;
    }
  }

  if (comment.startsWith(',')) {
    comment = comment.slice(1, comment.length).trimLeft();
  }

  const types = [];
  const nonStandardTypes = [];
  type
    .split(' | ')
    .map(s => (s.startsWith('[') ? s : s.slice(1, -1)))
    .forEach(s => {
      const arrType = splitAtIndex(s, s.length - 2);
      if (
        ALL_TYPES.has(s) ||
        (ALL_TYPES.has(arrType[0]) && arrType[1] === '[]')
      ) {
        types.push(s);
      } else if (s) {
        nonStandardTypes.push(s);
      }
    });
  return [types, nonStandardTypes, comment];
};

const parseLine = (line = '') => {
  const trimmed = line.trimLeft();
  const offset = line.length - trimmed.length;
  const [name, comment] = common.section(trimmed, ' ');
  const rest = comment.startsWith('- ') ? comment.slice(2) : comment;
  return { name, rest, offset, trimmed };
};

const parseParameters = lines => {
  const result = [];
  let isPrevComment = false;
  let prevOffset = 2;
  for (let i = 0; i < lines.length; i++) {
    const { name, rest, offset, trimmed } = parseLine(lines[i]);
    const offsetDiff = offset - prevOffset;

    if (offsetDiff === 4 || (isPrevComment && offsetDiff === 0)) {
      isPrevComment = true;
      prevOffset = offset;
      result[result.length - 1].comment += ' ' + trimmed;
    } else {
      isPrevComment = false;
      prevOffset = offset;
      const [types, nonStandardTypes, comment] = parseTypes(rest);
      result.push({ name, types, nonStandardTypes, comment, offset });
    }
  }
  return result;
};

const splitRest = lines => {
  const result = [];
  for (const line of lines) {
    if (isNamedLine(line)) {
      result.push([line]);
    } else {
      result[result.length - 1].push(line);
    }
  }
  return result;
};

const parseRest = lines => {
  if (lines.length === 0) return [];
  const result = splitRest(lines).map(commentLines => {
    const [name, cmt] = common.section(commentLines.shift(), ':');
    let comment = cmt;
    let types = [];
    let nonStandardTypes = [];
    let parameters = null;

    if (name === 'Returns') {
      [types, nonStandardTypes, comment] = parseTypes(comment.trimLeft());
      const parameterLines = [comment, ...commentLines];
      const start = parameterLines.findIndex(
        line => line.startsWith('  ') && !line.startsWith(FOUR_SPACES)
      );
      if (start > 0) {
        parameters = parseParameters(parameterLines.slice(start));
        comment = parameterLines.slice(0, start).join('\n');
      } else {
        comment = parameterLines.join('\n');
      }
    } else if (name === 'Properties') {
      parameters = parseParameters(commentLines);
      comment = '';
    } else if (name === 'Static properties') {
      parameters = parseParameters(commentLines);
      comment = '';
    } else if (name === 'Throws') {
      [types, nonStandardTypes, comment] = parseTypes(comment.trimLeft());
      if (comment) commentLines.unshift(comment);
      comment = commentLines.join('\n');
    } else {
      if (comment) commentLines.unshift(comment);
      comment = commentLines.join('\n');
    }
    return { name, types, nonStandardTypes, comment, parameters };
  });
  return result;
};

// Parse comments related to function
//   fn - <Function>
//   lines - <string[]>
// Returns: <Object>, function signature
//   title - <string>, short function description
//   description - <string>, extended function description
//   isAsync - <boolean>, whether function is async
//   argsSignature - <string[]>, custom function signature
//   parameters - <Object[]>, function
//       parameters, `{ name, types, nonStandardTypes, comment, offset }`
//   comments - <Object[]>, comments about returned value,
//       thrown errors, deprecation and
//       usage, `{ name, types, nonStandardTypes, comment }`
const parseFunction = (fn, lines) => {
  const sig = {
    title: '',
    description: '',
    isAsync: fn[Symbol.toStringTag] === 'AsyncFunction',
    isClass: fn.toString().startsWith('class'),
    argsSignature: [],
    parentClass: '',
    parameters: [],
    nativeParams: '',
    comments: [],
  };

  const first = lines[0];
  if (
    first &&
    !first.startsWith('Signature:') &&
    !isNamedLine(first) &&
    !first.startsWith(' ')
  ) {
    sig.title = first;
    lines = lines.slice(1);
  }

  if (lines.length > 0) {
    const { description, argsSignature, parameters, comments } = splitComments(
      lines
    );
    sig.description = description.join('\n');
    if (argsSignature.length) {
      sig.argsSignature = argsSignature
        .join('\n')
        .slice(10)
        .split(SIGNATURE);
    }
    sig.parameters = parseParameters(parameters);
    sig.comments = parseRest(comments);
  }

  if (typeof fn === 'function') {
    let nativeParams = null;
    let fnStr = fn.toString();
    const nativeParamRegex = /\((.|\s)*?\)/;

    if (fnStr.startsWith('async')) fnStr = fnStr.slice(5).trim();

    const idx = fnStr.indexOf('=>');
    if (
      fnStr.startsWith('class') ||
      fnStr.startsWith('function') ||
      idx === -1
    ) {
      nativeParams = fnStr.match(nativeParamRegex);
    } else {
      fnStr = fnStr.slice(0, idx).trim();
      if (fnStr.indexOf('(') !== -1 && fnStr.indexOf(')') !== -1) {
        nativeParams = fnStr.match(nativeParamRegex);
      } else {
        sig.nativeParams = fnStr;
      }
    }

    if (nativeParams !== null) {
      sig.nativeParams = nativeParams[0].slice(1, -1);
    }

    if (sig.isClass) {
      const parent = Object.getPrototypeOf(fn.prototype);
      if (parent !== null && parent.constructor.name !== 'Object') {
        sig.parentClass = parent.constructor.name;
      }
    }
  }

  return sig;
};

// Parse function signature
//   fn - <Function> | <RegExp>, to be searched
//   text - <string>, to be searched in
//   start - <number>, position to start searching from
// Returns: <Object>, function signature
//   title - <string>, short function description
//   description - <string>, extended function description
//   argsSignature - <string>, custom function signature
//   parameters - <Object[]>, function
//       parameters, `{ name, types, nonStandardTypes, comment, offset }`
//   comments - <Object[]>, comments about returned value,
//       thrown errors, deprecation and
//       usage, `{ name, types, nonStandardTypes, comment }`
const parseSignature = (fn, text, start) =>
  parseFunction(fn, parseComments(fn, text, start));

// Introspect interface
//   namespace - <Map>, hash of interfaces
//   text - <string>, data to parse
// Returns: <Map>, hash of hash of
//     records, `{ title, description, parameters, comments }`
const introspect = (namespace, text) => {
  const inventory = new Map();
  for (const [name, value] of namespace) {
    const iface = typeof value === 'function' ? { [name]: value } : value;
    const entities = new Map();
    for (const method in iface) {
      const fn = iface[method];
      if (typeof fn !== 'function') continue;
      entities.set(method, parseSignature(fn, text));

      const start = text.indexOf(method.toString());
      const standardProps = ['length', 'name', 'prototype'];
      const props = Object.getOwnPropertyNames(fn).filter(
        prop => !standardProps.includes(prop)
      );

      for (const prop of props) {
        if (typeof fn[prop] === 'function') {
          const propName = `${method}.${prop}`;
          entities.set(propName, parseSignature(fn[prop], text, start));
        }
      }

      const constructorRegEx = /constructor\((.|\s)*?\)\s*{(.|\s)*}/g;

      if (fn.prototype) {
        const props = Object.getOwnPropertyNames(fn.prototype);
        for (const prop of props) {
          const propName = `${method}.prototype.${prop}`;
          if (prop === 'constructor') {
            let sig = parseSignature(
              constructorRegEx,
              iface[method].toString(),
              0
            );
            if (
              !sig.title &&
              !sig.description &&
              !sig.parameters.length &&
              !sig.nativeParams.length &&
              !sig.argsSignature.length &&
              !sig.comments.length
            ) {
              const classSig = entities.get(method);
              sig = {
                ...classSig,
                comments: [],
              };
              classSig.argsSignature = [];
              classSig.parameters = [];
              classSig.nativeParams = '';
              classSig.isClass = true;
            }
            sig.isClass = false;
            entities.set(propName, sig);
          } else {
            const desc = Object.getOwnPropertyDescriptor(fn.prototype, prop);
            if (typeof desc.value === 'function') {
              entities.set(propName, parseSignature(desc.value, text, start));
            }
          }
        }
      }
    }
    inventory.set(name, entities);
  }
  return inventory;
};

module.exports = {
  introspect,
  parseSignature,
};
