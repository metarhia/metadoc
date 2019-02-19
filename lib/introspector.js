'use strict';

const common = require('@metarhia/common');
const types = require('./types');
const ALL_TYPES = new Set(types.ALL_TYPES);

const NAMED_LINES = [
  'Returns:', // returned value
  'Example:', // example of usage
  'Result:', // result of usage, should be used with `Example`
  'Throws:', // thrown errors
  'Deprecated:', // reasons for deprecation or previous names
];

// Search `text` for `fn` occurrences
//   fn - <Function> | <RegExp>, to be searched
//   text - <string>, to be searched in
//   start - <number>, position to start searching from
// Returns: <Array>, lines of comments before function
const parseComments = (fn, text, start) => {
  if (start === -1) return [];

  text = text.slice(start);
  const fnIndex = fn instanceof RegExp ?
    text.search(fn) :
    text.indexOf(fn.toString());
  const lines = text.slice(0, fnIndex)
    .split('\n')
    .map(line => line.trim());
  const comments = [];

  for (let i = lines.length - 2; i >= 0; i--) {
    const line = lines[i].trimLeft();
    if (!line.startsWith('//')) break;
    comments.unshift(line.slice(3));
  }
  return comments.map(line => line.trimRight())
    .filter(line =>
      line.length !== 0 && !line.startsWith('eslint-disable-next-line')
    );
};

const isNamedLine = line => NAMED_LINES.find(s => line.startsWith(s));

const splitAtIndex = (line, index) => [line.slice(0, index), line.slice(index)];

const splitComments = lines => {
  let i = 1;
  let hasSignature = false;
  while (i < lines.length && !lines[i].startsWith(' ')) {
    if (lines[i].startsWith('Signature:')) {
      hasSignature = true;
      break;
    }
    i++;
  }
  const signatureStart = i;

  let paramStart = i;
  if (hasSignature) {
    i++;
    while (i < lines.length && lines[i].startsWith(' '.repeat(4))) i++;
    paramStart = i;
  }

  while (i < lines.length && !isNamedLine(lines[i])) i++;
  const commentsStart = i;

  const description = lines.slice(1, signatureStart);
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
    if (comment.startsWith('<') ||
      (comment.startsWith(' | ') && comment.indexOf('<') === 3)) {
      const start = comment.indexOf('<');
      const end = comment.indexOf('>') + 1;
      if (!regex.test(comment.slice(start, end))) break;
      type += comment.slice(0, end);
      comment = comment.slice(end);
    } else if (comment.startsWith('[') ||
      (comment.startsWith(' | ') && comment.indexOf('[') === 3)) {
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
  type.split(' | ')
    .map(s => (s.startsWith('[') ? s : s.slice(1, -1)))
    .forEach(s => {
      const arrType = splitAtIndex(s, s.length - 2);
      if (ALL_TYPES.has(s) ||
        (ALL_TYPES.has(arrType[0]) && arrType[1] === '[]')) {
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
  const rest = comment.startsWith('- ') ?
    comment.slice(2) :
    comment;
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

const parseRest = lines => {
  if (lines.length === 0) return [];
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (isNamedLine(lines[i])) {
      const [name, cmt] = common.section(lines[i], ':');
      let types = [];
      let comment = cmt;
      let nonStandardTypes = [];
      if (name === 'Returns' || name === 'Throws') {
        [types, nonStandardTypes, comment] = parseTypes(comment.trimLeft());
      }
      result.push({ name, types, nonStandardTypes, comment });
    } else {
      result[result.length - 1].comment += '\n' + lines[i];
    }
  }
  if (result[0].name === 'Returns') {
    const parameterLines = result[0].comment.split('\n');
    const start = parameterLines.findIndex(
      line => line.startsWith('  ') && !line.startsWith(' '.repeat(4)));
    if (start > 0) {
      result[0].parameters = parseParameters(parameterLines.slice(start));
      result[0].comment = parameterLines.slice(0, start).join('\n');
    }
  }
  return result;
};

// Parse comments related to function
//   lines - <string[]>
// Returns: <Object>, function signature
//   title - <string>, short function description
//   description - <string>, extended function description
//   argsSignature - <string>, custom function signature
//   parameters - <Object[]>, function
//       parameters, `{ name, types, nonStandardTypes, comment, offset }`
//   comments - <Object[]>, comments about returned value,
//       thrown errors, deprecation and
//       usage, `{ name, types, nonStandardTypes, comment }`
const parseFunction = lines => {
  const sig = {
    title: '',
    description: '',
    argsSignature: '',
    parameters: [],
    comments: [],
  };

  if (lines[0] && !lines[0].startsWith('Signature:')) sig.title = lines[0];

  if (lines.length > 1) {
    const { description, argsSignature, parameters, comments } =
      splitComments(lines);
    sig.description = description.join('\n');
    sig.argsSignature = argsSignature.join('\n').slice(10);
    sig.parameters = parseParameters(parameters);
    sig.comments = parseRest(comments);
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
  parseFunction(parseComments(fn, text, start));

// Introspect interface
//   namespace - <Map>, hash of interfaces
//   text - <string>, data to parse
// Returns: <Map>, hash of hash of
//     records, `{ title, description, parameters, comments }`
const introspect = (namespace, text) => {
  const inventory = new Map();
  for (const [name, value] of namespace) {
    const iface = value;
    const entities = new Map();
    for (const method in iface) {
      const fn = iface[method];
      if (typeof fn !== 'function') continue;
      entities.set(method, parseSignature(fn, text));

      const start = text.indexOf(method.toString());
      const standardProps = [ 'length', 'name', 'prototype' ];
      const props = Object.getOwnPropertyNames(fn)
        .filter(prop => !standardProps.includes(prop));

      for (const prop of props) {
        const propName = `${method}.${prop}`;
        entities.set(propName, parseSignature(fn[prop], text, start));
      }

      const constructorRegEx = /constructor\([\w\s,]*\)\s*{(.|\s)*}/g;

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
            if (sig.title ||
              sig.description ||
              sig.parameters.length ||
              sig.comments.length
            ) {
              entities.set(propName, sig);
            } else {
              sig = entities.get(method);
              entities.set(propName, sig);
              entities.set(method, {
                title: sig.title,
                description: sig.description,
                parameters: [],
                comments: [],
              });
            }
          } else {
            entities.set(propName,
              parseSignature(fn.prototype[prop], text, start));
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
