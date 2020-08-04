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
const NOTATION_PRIVATE = '#private';

const findMatchingBracket = (str, startBraceIndex, startBrace, endBrace) => {
  let end = startBraceIndex + 1;
  for (let count = 1; end < str.length; end++) {
    const ch = str[end];
    if (ch === startBrace) {
      count++;
    } else if (ch === endBrace) {
      count--;
      if (count === 0) break;
    }
  }
  return end;
};

// Search `text` for `fn` occurrences
//   fn - <Function> | <RegExp>, to be searched
//   text - <string>, to be searched in
//   start - <number>, position to start searching from
// Returns: <Array>, lines of comments before function
const searchFunctionComments = (fn, text, start = 0) => {
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
      line =>
        line.length !== 0 &&
        !line.startsWith('eslint-disable') &&
        !line.startsWith('prettier-ignore')
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

const separateCommentTypes = comment => {
  const types = [];
  while (true) {
    if (comment.startsWith(' | ')) comment = comment.slice(3);
    else if (comment.startsWith('|')) comment = comment.slice(1);
    const start = 0;
    let end;
    if (comment[0] === '<') {
      end = findMatchingBracket(comment, start, '<', '>');
    } else if (comment[0] === '[') {
      end = findMatchingBracket(comment, start, '[', ']');
    } else {
      break;
    }
    types.push(comment.slice(start, end + 1));
    comment = comment.slice(end + 1);
  }

  if (comment.startsWith(',')) {
    comment = comment.slice(1).trimLeft();
  }

  return [types, comment];
};

const parseTypes = rest => {
  const types = [];
  const nonStandardTypes = [];
  const [allTypes, comment] = separateCommentTypes(rest);

  allTypes
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
    } else if (name === 'Properties' || name === 'Static properties') {
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

const findBoundsEnd = (str, startStr, endStr, offset = 0) => {
  const idx = str.indexOf(startStr, offset);
  if (idx === -1) return -1;

  let level = 0;
  for (let i = idx; i < str.length; i++) {
    if (str[i] === startStr) level++;
    else if (str[i] === endStr) level--;
    if (level === 0) return i;
  }
  return -1;
};

const findClassConstructor = str => {
  str = str.slice(str.indexOf('{') + 1, -1);
  const constructorStart = str.indexOf('constructor(');
  if (constructorStart === -1) return '';
  const paramsEnd = findBoundsEnd(str, '(', ')', constructorStart);
  const bodyEnd = findBoundsEnd(str, '{', '}', paramsEnd);
  return str.slice(constructorStart, bodyEnd + 1);
};

const getNativeParams = str => {
  if (str.startsWith('class')) str = findClassConstructor(str);
  if (str.startsWith('async')) str = str.slice(5).trim();
  if (
    !str.startsWith('(') &&
    !str.startsWith('function') &&
    !str.startsWith('class')
  ) {
    const lambdaIdx = str.indexOf('=>');
    str = str.slice(0, lambdaIdx).trim();
    if (str.indexOf('(') === -1 || str.indexOf(')') === -1) return str;
  }

  const startIdx = str.indexOf('(');
  if (startIdx === -1) return '';
  const endIdx = findBoundsEnd(str, '(', ')', startIdx);
  if (endIdx === -1) return '';
  return str.slice(startIdx + 1, endIdx);
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
  const fnStr = fn.toString();
  const sig = {
    title: '',
    description: '',
    isAsync: fn[Symbol.toStringTag] === 'AsyncFunction',
    isClass: fnStr.startsWith('class'),
    private: lines[0] && lines[0].startsWith(NOTATION_PRIVATE),
    parentClass: '',
    nativeParams: '',
    argsSignature: [],
    parameters: [],
    comments: [],
  };

  if (sig.private) lines.shift();

  const first = lines[0];
  if (
    first &&
    !isNamedLine(first) &&
    !first.startsWith('Signature:') &&
    !first.startsWith(' ')
  ) {
    sig.title = lines.shift();
  }

  if (lines.length > 0) {
    const { description, argsSignature, parameters, comments } = splitComments(
      lines
    );
    sig.description = description.join('\n');
    sig.parameters = parseParameters(parameters);
    sig.comments = parseRest(comments);
    if (argsSignature.length) {
      sig.argsSignature = argsSignature
        .join('\n')
        .slice(10)
        .split(SIGNATURE);
    }
  }

  if (typeof fn === 'function') {
    sig.nativeParams = getNativeParams(fnStr);
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
  parseFunction(fn, searchFunctionComments(fn, text, start));

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
      const fnType = typeof fn;
      if (fnType !== 'function') {
        if (
          fnType === 'object' &&
          fn !== null &&
          fn.constructor &&
          fn.constructor.name
        ) {
          const className = fn.constructor.name;
          if (className === 'Object' || className === 'Array') {
            const isArray = Array.isArray(fn);
            introspect(new Map([[method, fn]]), text).forEach(inv => {
              inv.forEach((val, methodName) => {
                if (isArray) entities.set(`${method}[${methodName}]`, val);
                else entities.set(`${method}.${methodName}`, val);
              });
            });
          } else {
            entities.set(method, { instance: true, className });
          }
        }
        continue;
      }
      const methodSig = parseSignature(fn, text);
      entities.set(method, methodSig);

      const start = text.indexOf(method.toString());
      const standardProps = ['length', 'name', 'prototype'];
      const props = Object.getOwnPropertyNames(fn)
        .filter(prop => !standardProps.includes(prop))
        .sort();

      for (const prop of props) {
        if (typeof fn[prop] === 'function') {
          const propName = `${method}.${prop}`;
          const propSig = parseSignature(fn[prop], text, start);
          propSig.private = propSig.private || methodSig.private;
          entities.set(propName, propSig);
        }
      }

      if (fn.prototype) {
        const props = Object.getOwnPropertyNames(fn.prototype).sort((a, b) => {
          if (b === 'constructor') return 1;
          if (a === 'constructor' || a < b) return -1;
          return 1;
        });
        for (const prop of props) {
          const propName = `${method}.prototype.${prop}`;
          if (prop === 'constructor') {
            const fnStr = fn.toString();
            if (!fnStr.startsWith('class')) continue;

            const lines = searchFunctionComments(
              findClassConstructor(fnStr),
              fnStr
            );
            let sig = parseFunction(fn, lines);
            if (
              !sig.title &&
              !sig.description &&
              !sig.parameters.length &&
              !sig.nativeParams.length &&
              !sig.argsSignature.length &&
              !sig.comments.length
            ) {
              sig = { ...methodSig, comments: [] };
              methodSig.argsSignature = [];
              methodSig.parameters = [];
              methodSig.nativeParams = '';
              methodSig.isClass = true;
            }
            sig.isClass = false;
            sig.private = methodSig.private;
            entities.set(propName, sig);
          } else {
            const desc = Object.getOwnPropertyDescriptor(fn.prototype, prop);
            if (typeof desc.value === 'function') {
              const propSig = parseSignature(desc.value, text, start);
              propSig.private = propSig.private || methodSig.private;
              entities.set(propName, propSig);
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
