'use strict';

const common = require('@metarhia/common');

const types = require('./types');

const ALL_TYPES = new Set(types.STANDARD_TYPES);

const MAX_LINE_LENGTH = 80;
const SECONDARY_OFFSET = 2;
const COMMENTS_SECONDARY_OFFSET = 0;
const CODE_PARAMS_OFFSET = 2;

const baseUrl = 'https://developer.mozilla.org/en-US/docs/';
const primitivesBaseUrl = 'Web/JavaScript/Data_structures#';
const globalObjectsBaseUrl = 'Web/JavaScript/Reference/Global_Objects/';

const primitivesLinks = types.PRIMITIVE_TYPES.map(type => [
  type,
  `${baseUrl}${primitivesBaseUrl}${common.capitalize(type)}_type`,
]);

const globalObjectsLinks = types.OBJECT_TYPES.map(type => [
  type,
  `${baseUrl}${globalObjectsBaseUrl}${type}`,
]);

const links = [
  ...globalObjectsLinks,
  ...primitivesLinks,
  ['Primitive', baseUrl + 'Glossary/Primitive'],
  ['Iterable', baseUrl + 'Web/JavaScript/Reference/Iteration_protocols'],
  ['this', baseUrl + 'Web/JavaScript/Reference/Operators/this'],
];

const getLinks = (usedTypes, customLinks = []) => {
  const result = common
    .merge(customLinks, links)
    .filter(([type]) => usedTypes.has(type))
    .map(([type, link]) => '[' + type.toLowerCase() + ']: ' + link);
  return result;
};

const wrapType = (type, customTypes = [], usedTypes) => {
  const types = new Set(ALL_TYPES);
  customTypes.forEach(types.add, types);
  const arrType = [type.slice(0, type.length - 2), type.slice(type.length - 2)];

  if (types.has(type)) {
    usedTypes.add(type);
    type = '[`<' + type + '>`][' + type.toLowerCase() + ']';
  } else if (types.has(arrType[0]) && arrType[1] === '[]') {
    usedTypes.add(arrType[0]);
    type = '[`<' + arrType[0] + '[]>`][' + arrType[0].toLowerCase() + ']';
  } else if (type.startsWith('[')) {
    const result = [];
    const nestedArr = [];
    let n = 0;
    type
      .slice(1, -1)
      .replace(/ /g, '')
      .split(',')
      .forEach(t => {
        if (n === 0 && !t.startsWith('[')) {
          result.push(t.slice(1, -1));
        } else {
          nestedArr.push(t);
          let i = 0;
          while (t[i++] === '[') n++;
          i = t.length - 1;
          while (t[i--] === ']') n--;

          if (n === 0) {
            result.push(nestedArr.join(','));
            nestedArr.length = 0;
          }
        }
      });
    type = result.map(t => wrapType(t, customTypes, usedTypes)).join('`, `');
    type = '`[ `' + type + '` ]`';
  } else {
    usedTypes.add(type);
    type = '`<' + type + '>`';
  }
  return type;
};

const splitEscaped = (line, sep = ' ') => {
  const result = [];
  let i = 0;
  let start = line.indexOf('`', i);
  while (i < line.length && start !== -1) {
    result.push(...line.slice(i, start).split(sep));

    let num = 1;
    while (line[start + num] === '`') num++;

    const wrap = line.slice(start, start + num);
    let end = line.indexOf(wrap, start + num);
    let ln = line.slice(start + num, end).trim();

    start = end + num;
    const sepIdx = line.indexOf(sep, start);
    end = sepIdx === -1 ? line.length : sepIdx;
    i = end + 1;

    if (ln.indexOf('`') !== -1) ln = ` ${ln} `;
    result[result.length - 1] += `${wrap}${ln}${wrap}${line.slice(start, end)}`;

    if (line.slice(end) === sep) result.push('');
    start = line.indexOf('`', i);
  }
  if (line.slice(i)) result.push(...line.slice(i).split(sep));
  return result;
};

const formatLine = (line, offset, secondaryOffset = SECONDARY_OFFSET) => {
  line = line
    .split('\n')
    .map(ln => ln.trim())
    .join(' ');
  const maxLen = MAX_LINE_LENGTH - offset;
  const pad = ' '.repeat(offset);
  const secondaryPad = ' '.repeat(offset + secondaryOffset);

  line = line.replace(/ {2}/g, ' ');
  if (line.length <= maxLen) return pad + line;

  const result = [pad];
  splitEscaped(line, ' ').forEach(word => {
    if (result[result.length - 1].length + word.length <= MAX_LINE_LENGTH) {
      result[result.length - 1] += word + ' ';
    } else {
      result.push(secondaryPad + word + ' ');
    }
  });

  return result.map(line => line.trimRight()).join('\n');
};

const wrapComment = (comment, customTypes, usedTypes) =>
  comment
    .trimLeft()
    .replace(/<[\w.]+(\[])?>/g, type =>
      wrapType(type.slice(1, -1), customTypes, usedTypes)
    );

const generateParameters = (parameters, customTypes, usedTypes) => {
  const buf = [];
  if (!parameters || !parameters.length) return buf;

  for (const parameter of parameters) {
    const types = common
      .merge(parameter.types, parameter.nonStandardTypes)
      .map(t => wrapType(t, customTypes, usedTypes))
      .join('|');
    if (parameter.comment) {
      parameter.comment =
        ' ' + wrapComment(parameter.comment, customTypes, usedTypes);
    }

    const line =
      '- `' +
      parameter.name +
      (types ? '`: ' : '`') +
      types +
      parameter.comment;

    buf.push(formatLine(line, parameter.offset - CODE_PARAMS_OFFSET));
  }
  if (buf.length !== 0) buf.push('');
  return buf;
};

const generateTypeLine = (comment, customTypes, usedTypes) =>
  common
    .merge(comment.types, comment.nonStandardTypes)
    .map(t => wrapType(t, customTypes, usedTypes))
    .join('|');

const generateComment = (comment, customTypes, usedTypes, typeLine) => {
  const commentLine = wrapComment(comment.comment, customTypes, usedTypes);
  let line = `_${comment.name}:_ `;
  if (typeLine) line += typeLine + ' ';
  line += commentLine;
  return formatLine(line, 0, COMMENTS_SECONDARY_OFFSET);
};

const generateReturns = (comments, customTypes, usedTypes) => {
  const comment = comments.find(comment => comment.name === 'Returns');
  if (!comment) return [];

  const typeLine = generateTypeLine(comment, customTypes, usedTypes);
  const line = generateComment(comment, customTypes, usedTypes, typeLine);
  const res = generateParameters(comment.parameters, customTypes, usedTypes);
  return [line, '', ...res];
};

const generateProperties = (method, comments, customTypes, usedTypes) => {
  const comment = comments.find(comment => comment.name === 'Properties');
  if (!comment) return [];

  const buf = [];

  for (const param of comment.parameters) {
    if (param.types.length === 0 && param.nonStandardTypes.length === 0) {
      console.error(`Property ${param.name} of ${method} does not have types`);
      process.exit(1);
    }
    buf.push(`#### ${method}.${param.name}\n`);
    let line = '- ' + generateTypeLine(param, customTypes, usedTypes);
    if (param.comment) {
      line += ' ' + wrapComment(param.comment, customTypes, usedTypes);
    }
    line = formatLine(line, 0);
    buf.push(line, '');
  }

  return buf;
};

const generateRest = (comments, customTypes, usedTypes) => {
  const buf = [];
  for (const comment of comments) {
    let line;
    if (comment.name === 'Example' || comment.name === 'Result') {
      let code = comment.comment.trimLeft();
      if (!code.endsWith(';')) code += ';';
      line = `_${comment.name}:_\n\n\`\`\`js\n${code}\n\`\`\``;
    } else if (comment.name === 'Throws') {
      const typeLine = generateTypeLine(comment, customTypes, usedTypes);
      line = generateComment(comment, customTypes, usedTypes, typeLine);
    } else if (comment.name !== 'Returns' && comment.name !== 'Properties') {
      line = generateComment(comment, customTypes, usedTypes);
    }
    if (line) buf.push(line, '');
  }
  return buf;
};

const checkArgsSignature = (argsSignature, args) => {
  if (argsSignature.length !== args.length) return false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== argsSignature[i].replace(/[[\].]/g, '')) {
      return false;
    }
  }
  return true;
};

// Generate md from interfaces inventory
//   inventory - <Map>, hash of map of records, `{ method, title, parameters }`
//   options - <Object>
//     header - <string>, text before api documentation
//     footer - <string>, text after api documentation
//     customTypes - <string[]>, custom types
//     customLinks - <Array[]>, custom types links
// Returns: <string>, md document
const generateMd = (inventory, options = {}) => {
  const buf = [];
  const usedTypes = new Set();
  if (options.header) buf.push(options.header);
  for (const [name, methods] of inventory) {
    if (!options.removeInterface) buf.push(`### Interface: ${name}\n`);
    for (const [method, signature] of methods) {
      let args = signature.parameters
        .filter(p => p.offset === 2)
        .map(p => p.name);
      if (signature.argsSignature) {
        const signatureArgs = signature.argsSignature
          .replace(/\s/g, '')
          .split(',');
        if (checkArgsSignature(signatureArgs, args)) {
          args = signatureArgs;
        } else {
          console.error(
            `Arguments signature for function ${method} ` +
              `does not correspond to the actual parameters. ` +
              `Falling back to default arguments signature`
          );
        }
      }
      if (args.length === 0) {
        args = signature.nativeParams
          .split(/[\r\n]/)
          .map(str => str.trim())
          .join('')
          .split(',')
          .map(param => param.trim())
          .filter(param => param);
      }
      const asyncPrefix = signature.isAsync ? 'async ' : '';
      if (signature.isClass) {
        buf.push(`#### class ${method}\n`);
      } else {
        buf.push(`#### ${asyncPrefix}${method}(${args.join(', ')})\n`);
      }
      buf.push(
        ...generateParameters(
          signature.parameters,
          options.customTypes,
          usedTypes
        )
      );
      buf.push(
        ...generateReturns(signature.comments, options.customTypes, usedTypes)
      );

      if (signature.title) {
        buf.push(
          formatLine(
            wrapComment(signature.title, options.customTypes, usedTypes),
            0,
            COMMENTS_SECONDARY_OFFSET
          ),
          ''
        );
      }
      if (signature.description) {
        buf.push(
          formatLine(
            wrapComment(signature.description, options.customTypes, usedTypes),
            0,
            COMMENTS_SECONDARY_OFFSET
          ),
          ''
        );
      }
      buf.push(
        ...generateRest(signature.comments, options.customTypes, usedTypes)
      );
      buf.push(
        ...generateProperties(
          method,
          signature.comments,
          options.customTypes,
          usedTypes
        )
      );
    }
  }
  if (options.footer) buf.push(options.footer);
  buf.push(...getLinks(usedTypes, options.customLinks), '');
  return buf.join('\n');
};

module.exports = { generateMd };
