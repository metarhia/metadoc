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

const globalObjectsLinks = types.OBJECT_TYPES.map(type => {
  let link = baseUrl + globalObjectsBaseUrl;
  if (type.startsWith('Intl.')) {
    link += type.slice(5);
  } else if (type.startsWith('WebAssembly.')) {
    link += `WebAssembly/${type.slice(12)}`;
  } else {
    link += type;
  }
  return [type, link];
});

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
    type = result.map(t => wrapType(t, customTypes, usedTypes)).join(', ');
    type = `[ ${type} ]`;
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
    )
    .replace(/`{[\w.\s]+(\(\))?}`/, link => {
      link = link.slice(2, -2);
      if (customTypes.includes(link)) {
        usedTypes.add(link);
        return '[`' + link + '`][' + link.toLowerCase() + ']';
      }
      return '`{' + link + '}`';
    });

const generateParameters = (parameters, customTypes, usedTypes) => {
  const buf = [];
  if (!parameters || !parameters.length) return buf;

  for (const parameter of parameters) {
    if (
      parameter.offset < CODE_PARAMS_OFFSET ||
      parameter.offset % CODE_PARAMS_OFFSET !== 0
    ) {
      throw new Error(`Incorrect parameter: '${parameter.name}'`);
    }

    const types = common
      .merge(parameter.types, parameter.nonStandardTypes)
      .map(t => wrapType(t, customTypes, usedTypes))
      .join('|');
    if (parameter.comment) {
      parameter.comment =
        ' ' + wrapComment(parameter.comment, customTypes, usedTypes);
    }

    let line;
    if (parameter.name === 'Returns:') {
      line = '- _' + parameter.name + (types ? '_ ' : '_');
    } else {
      line = '- `' + parameter.name + (types ? '`: ' : '`');
    }
    line += types + parameter.comment;

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

const ESCAPE_MD_REGEXP = /[_[\]]/g;

const headerify = (str, level = 1) =>
  `${'#'.repeat(level)} ${str.replace(ESCAPE_MD_REGEXP, '\\$&')}`;

const generateProps = (method, comments, customTypes, usedTypes, level) => {
  const buf = [];
  let comment = comments.find(comment => comment.name === 'Static properties');

  if (comment) {
    for (const param of comment.parameters) {
      if (param.types.length === 0 && param.nonStandardTypes.length === 0) {
        console.error(
          `Static property ${param.name} of ${method} does not have types`
        );
        process.exit(1);
      }
      buf.push(headerify(`${method}.${param.name}\n`, level));
      let line = '- ' + generateTypeLine(param, customTypes, usedTypes);
      if (param.comment) {
        line += ' ' + wrapComment(param.comment, customTypes, usedTypes);
      }
      line = formatLine(line, 0);
      buf.push(line, '');
    }
  }

  comment = comments.find(comment => comment.name === 'Properties');
  if (!comment) return buf;

  for (const param of comment.parameters) {
    if (param.types.length === 0 && param.nonStandardTypes.length === 0) {
      console.error(`Property ${param.name} of ${method} does not have types`);
      process.exit(1);
    }
    buf.push(headerify(`${method}.prototype.${param.name}\n`, level));
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
    } else if (comment.name === 'Deprecated') {
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

const generateInstance = (name, sig, options, usedTypes) => [
  headerify(name, options.functionLevel),
  '',
  '- ' + wrapType(sig.className, options.customTypes, usedTypes),
  '',
];

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
  if (!options.customTypes) options.customTypes = [];
  if (options.header) buf.push(options.header);
  for (const [name, methods] of inventory) {
    if (!options.removeInterface) {
      buf.push(headerify(`Interface: ${name}\n`, options.interfaceLevel));
    }
    for (const [method, signature] of methods) {
      if (signature.private && !options.private) continue;
      if (signature.instance) {
        buf.push(...generateInstance(method, signature, options, usedTypes));
        continue;
      }

      const defaultArgs = signature.parameters
        .filter(p => p.offset === 2 && p.name !== 'Returns:')
        .map(p => p.name);
      let signatures = [defaultArgs];
      if (signature.argsSignature.length) {
        signatures = [];
        let compliant = false;
        signature.argsSignature.forEach(s => {
          const argsSignature = s.replace(/\s/g, '').split(',');
          signatures.push(argsSignature);
          if (checkArgsSignature(argsSignature, defaultArgs)) compliant = true;
        });
        if (!compliant) {
          console.warn(
            `Warning: No signatures for function '${method}' ` +
              `correspond to the actual parameters.`
          );
        }
      } else if (signature.parameters.length === 0) {
        const nativeArgs = signature.nativeParams
          .split(/[\r\n]/)
          .map(str => str.trim())
          .join('')
          .split(',')
          .map(param => param.trim())
          .filter(param => param);
        signatures = [nativeArgs];
      }
      const lastDotIndex = method.lastIndexOf('.');
      const asyncPrefix = signature.isAsync ? 'async ' : '';
      if (signature.isClass) {
        let header = headerify(`class ${method}`, options.classLevel);
        const parent = signature.parentClass;
        if (parent) {
          header += ` extends `;
          if (ALL_TYPES.has(parent) || options.customTypes.includes(parent)) {
            usedTypes.add(parent);
            header += `[${parent}][${parent.toLowerCase()}]`;
          } else {
            header += parent;
          }
        }
        buf.push(header, '');
      } else if (method.indexOf('.prototype.') !== -1) {
        signatures.forEach(args =>
          buf.push(
            headerify(
              `${asyncPrefix}${method}(${args.join(', ')})\n`,
              options.methodLevel
            )
          )
        );
      } else if (
        lastDotIndex !== -1 &&
        methods.has(method.substring(0, lastDotIndex))
      ) {
        signatures.forEach(args =>
          buf.push(
            headerify(
              `${asyncPrefix}${method}(${args.join(', ')})\n`,
              options.staticMethodLevel
            )
          )
        );
      } else {
        signatures.forEach(args =>
          buf.push(
            headerify(
              `${asyncPrefix}${method}(${args.join(', ')})\n`,
              options.functionLevel
            )
          )
        );
      }
      try {
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
      } catch (err) {
        console.error(`'${name}.${method}' generation failed: ${err.message}`);
        process.exit(1);
      }

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
        ...generateProps(
          method,
          signature.comments,
          options.customTypes,
          usedTypes,
          options.propertyLevel
        )
      );
    }
  }
  if (options.footer) buf.push(options.footer);
  buf.push(...getLinks(usedTypes, options.customLinks), '');
  return buf.join('\n');
};

module.exports = { generateMd };
