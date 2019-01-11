'use strict';

const common = require('@metarhia/common');

const types = require('./types');

const ALL_TYPES = new Set(types.STANDARD_TYPES);

const MAX_LINE_LENGTH = 80;
const SECONDARY_OFFSET = 6;

const baseUrl = 'https://developer.mozilla.org/en-US/docs/';
const primitivesBaseUrl = 'Web/JavaScript/Data_structures#';
const globalObjectsBaseUrl = 'Web/JavaScript/Reference/Global_Objects/';

const primitivesLinks = types.PRIMITIVE_TYPES.map(type =>
  [type, `${baseUrl}${primitivesBaseUrl}${common.capitalize(type)}_type`]
);

const globalObjectsLinks = types.OBJECT_TYPES.map(type =>
  [type, `${baseUrl}${globalObjectsBaseUrl}${type}`]
);

const links = [
  ...globalObjectsLinks,
  ...primitivesLinks,
  [ 'Primitive', baseUrl + 'Glossary/Primitive' ],
  [ 'Iterable', baseUrl + 'Web/JavaScript/Reference/Iteration_protocols'],
  [ 'this', baseUrl + 'Web/JavaScript/Reference/Operators/this'],
];

const getLinks = (usedTypes, customLinks = []) => {
  usedTypes = new Set(usedTypes);
  const result = common.merge(customLinks, links)
    .filter(([type]) => usedTypes.has(type))
    .map(([type, link]) => '[`<' + type + '>`]: ' + link);
  return result;
};

const wrapType = (type, customTypes = []) => {
  const types = new Set(ALL_TYPES);
  customTypes.forEach(types.add, types);
  const usedTypes = [];
  const arrType = [
    type.slice(0, type.length - 2),
    type.slice(type.length - 2),
  ];

  if (types.has(type)) {
    usedTypes.push(type);
    type = '[`<' + type + '>`]';
  } else if (types.has(arrType[0]) && arrType[1] === '[]') {
    usedTypes.push(arrType[0]);
    type = '[`<' + arrType[0] + '[]>`][`<' + arrType[0] + '>`]';
  } else if (type.startsWith('[')) {
    const result = [];
    const nestedArr = [];
    let n = 0;
    type.slice(1, -1)
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
    type = result.map(t => {
      const res = wrapType(t, customTypes);
      usedTypes.push(...res.usedTypes);
      return res.type;
    })
      .join('`, `');
    type =  '`[ `' + type + '` ]`';
  } else {
    usedTypes.push(type);
    type = '`<' + type + '>`';
  }
  return { type, usedTypes };
};

const formatLine = (line, offset, secondaryOffset = SECONDARY_OFFSET) => {
  const maxLen = MAX_LINE_LENGTH - offset;
  const pad = ' '.repeat(offset);
  const secondaryPad = ' '.repeat(offset + secondaryOffset);

  line = line.replace(/ {2}/g, ' ');
  if (line.length <= maxLen) return pad + line;

  const result = [ pad ];
  line.split(' ').forEach(word => {
    if (result[result.length - 1].length + word.length <= MAX_LINE_LENGTH) {
      result[result.length - 1] += word + ' ';
    } else {
      result.push(secondaryPad + word + ' ');
    }
  });

  return result.map(line => line.trimRight()).join('\n');
};

const generateParameters = (parameters, customTypes) => {
  const usedTypes = [];
  const buf = [];
  if (!parameters || !parameters.length) return { buf, usedTypes };

  for (const parameter of parameters) {
    const types = common.merge(parameter.types, parameter.nonStandardTypes)
      .map(t => {
        const res = wrapType(t, customTypes);
        usedTypes.push(...res.usedTypes);
        return res.type;
      }).join('` | `');
    if (parameter.comment) {
      parameter.comment = ' ' + parameter.comment.trimLeft();
    }

    const line = '- `' + parameter.name + (types ? '`: ' : '` ') +
        types + parameter.comment;

    buf.push(formatLine(line.replace(/``/g, ''), parameter.offset));
  }
  return { buf, usedTypes };
};

const generateTypeLine = (comment, customTypes) => {
  const usedTypes = [];
  const typeLine = common.merge(comment.types, comment.nonStandardTypes)
    .map(t => {
      const res = wrapType(t, customTypes);
      usedTypes.push(...res.usedTypes);
      return res.type;
    })
    .join('` | `')
    .replace(/``/g, '');
  return { typeLine, usedTypes };
};

const generateReturns = (comments, customTypes) => {
  const buf = [];
  const usedTypes = [];
  const comment = comments.find(comment => comment.name === 'Returns');
  if (!comment) return { buf, usedTypes };

  let res = generateTypeLine(comment, customTypes);
  usedTypes.push(...res.usedTypes);
  let line = `*${comment.name}:* ${res.typeLine} ${comment.comment.trimLeft()}`;
  line = formatLine(line.split('\n').map(ln => ln.trim()).join(' '), 0, 4);

  res = generateParameters(comment.parameters, customTypes);
  usedTypes.push(...res.usedTypes);
  buf.push(line, ...res.buf, '');

  return { buf, usedTypes };
};

const generateRest = (comments, customTypes) => {
  const buf = [];
  const usedTypes = [];
  for (const comment of comments) {
    let line;
    if (comment.name === 'Throws') {
      const res = generateTypeLine(comment, customTypes);
      usedTypes.push(...res.usedTypes);
      line = `*${comment.name}:* ${res.typeLine} ${comment.comment.trimLeft()}`;
      line = formatLine(line.split('\n').map(ln => ln.trim()).join(' '), 0, 4);
    } else if (comment.name === 'Example' || comment.name === 'Result') {
      line = `*${comment.name}:* \n\`\`\`js\n${comment.comment}\n\`\`\``;
    } else if (comment.name !== 'Returns') {
      line = `*${comment.name}:* ${comment.comment}`;
      line = formatLine(line.split('\n').map(ln => ln.trim()).join(' '), 0, 4);
    }
    if (line) buf.push(line, '');
  }
  return { buf, usedTypes };
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
  const usedTypes = [];
  if (options.header) buf.push(options.header);
  for (const [name, methods] of inventory) {
    buf.push(`### Interface: ${name}\n`);
    for (const [method, signature] of methods) {
      const args = signature.parameters
        .filter(p => p.offset === 2)
        .map(p => p.name);

      buf.push(`#### ${method}(${args.join(', ')})\n`);

      let res = generateParameters(signature.parameters, options.customTypes);
      usedTypes.push(...res.usedTypes);
      buf.push(...res.buf, '');

      res = generateReturns(signature.comments, options.customTypes);
      usedTypes.push(...res.usedTypes);
      buf.push(...res.buf, '');

      if (signature.title) buf.push(signature.title, '');
      if (signature.description) buf.push(signature.description, '');

      res = generateRest(signature.comments, options.customTypes);
      usedTypes.push(...res.usedTypes);
      buf.push(...res.buf, '');
    }
  }
  if (options.footer) buf.push(options.footer + '\n');
  buf.push(...getLinks(usedTypes, options.customLinks), '');
  return buf.join('\n');
};

module.exports = { generateMd };
