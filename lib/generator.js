'use strict';

const common = require('@metarhia/common');

const types = require('./types');

const { iter } = common;

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

const getLinks = (usedTypes, customLinks) =>
  iter(
    iter(links)
      .chain(customLinks)
      .filter(([type]) => usedTypes.has(type))
      .collectTo(Map)
  )
    .map(([type, link]) => '[' + type.toLowerCase() + ']: ' + link)
    .collectTo(Set);

const ESCAPE_MD_REGEXP = /[_[\]]/g;

const headerify = (str, level = 1) =>
  `${'#'.repeat(level)} ${str.replace(ESCAPE_MD_REGEXP, '\\$&')}`;

const wrapType = (type, opts) => {
  const types = new Set(ALL_TYPES);
  opts.customTypes.forEach(types.add, types);
  const arrType = [type.slice(0, type.length - 2), type.slice(type.length - 2)];

  if (types.has(type)) {
    opts.usedTypes.add(type);
    type = '[`<' + type + '>`][' + type.toLowerCase() + ']';
  } else if (types.has(arrType[0]) && arrType[1] === '[]') {
    opts.usedTypes.add(arrType[0]);
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
    type = result.map(t => wrapType(t, opts)).join(', ');
    type = `[ ${type} ]`;
  } else {
    opts.usedTypes.add(type);
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

const wrapComment = (comment, opts) =>
  comment
    .trimLeft()
    .replace(/<[\w.]+(\[])?>/g, type => wrapType(type.slice(1, -1), opts))
    .replace(/`{[\w.#\s]+(\(\))?}`/g, link => {
      link = link.slice(2, -2);
      if (opts.customTypes.includes(link)) {
        opts.usedTypes.add(link);
        return '[`' + link + '`][' + link.toLowerCase() + ']';
      }
      return '`{' + link + '}`';
    });

const genTypeLine = (comment, opts) =>
  common
    .merge(comment.types, comment.nonStandardTypes)
    .map(t => wrapType(t, opts))
    .join('|');

const genComment = (comment, opts, typeLine) => {
  const commentLine = wrapComment(comment.comment, opts);
  let line = `_${comment.name}:_ `;
  if (typeLine) line += typeLine + ' ';
  line += commentLine;
  return formatLine(line, 0, COMMENTS_SECONDARY_OFFSET);
};

const genHeaderLink = header =>
  '#' +
  header
    .toLowerCase()
    .replace(/^#*\s*/, '')
    .replace(/]\[[\w-]*]/, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-');

const genClassSig = (name, sig, opts) => {
  let header = headerify(`class ${name}`, opts.classLevel);
  const parent = sig.parentClass;
  if (parent) {
    header += ` extends `;
    if (ALL_TYPES.has(parent) || opts.customTypes.includes(parent)) {
      opts.usedTypes.add(parent);
      header += `[${parent}][${parent.toLowerCase()}]`;
    } else if (opts.customClasses.has(parent)) {
      const parentLink = opts.customClasses.get(parent);
      opts.usedTypes.add(parentLink);
      header += `[${parent}][${parentLink}]`;
    } else {
      header += parent;
    }
  }
  opts.customLinks.push([opts.customClasses.get(name), genHeaderLink(header)]);
  return [header, ''];
};

const checkArgsCompliance = (argsSignature, args) => {
  if (argsSignature.length !== args.length) return false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== argsSignature[i].replace(/[[\].]/g, '')) {
      return false;
    }
  }
  return true;
};

const getNativeArgs = str =>
  str
    .split(/[\r\n]/)
    .map(str => str.trim())
    .join('')
    .split(',')
    .map(param => param.trim())
    .filter(param => param);

const getSignatures = (name, sig) => {
  const defaultArgs = sig.parameters
    .filter(p => p.offset === 2 && p.name !== 'Returns:')
    .map(p => p.name);
  let signatures = [defaultArgs];

  if (sig.argsSignature.length) {
    let compliant = false;
    signatures = sig.argsSignature.map(s => {
      const argsSignature = s
        .replace(/\n\s*/g, ' ')
        .split(',')
        .map(s => s.trim());
      const argsSignatureNames = argsSignature.map(s => s.split('=')[0].trim());
      compliant =
        compliant || checkArgsCompliance(argsSignatureNames, defaultArgs);
      return argsSignature;
    });
    if (!compliant) {
      console.warn(
        `Warning: No signatures for method/function '${name}' ` +
          `correspond to the actual parameters.`
      );
    }
  } else if (sig.parameters.length === 0) {
    signatures = [getNativeArgs(sig.nativeParams)];
  }
  return signatures;
};

const getPropsParams = comment =>
  comment.parameters.reduce((props, prop) => {
    if (prop.offset === CODE_PARAMS_OFFSET) {
      props.push({ ...prop, parameters: [] });
    } else {
      props[props.length - 1].parameters.push(prop);
    }
    return props;
  }, []);

const generateInstance = (name, sig, opts) => [
  headerify(name, opts.functionLevel),
  '',
  '- ' + wrapType(sig.className, opts),
  '',
];

const generateSignatures = (name, sig, opts, methods) => {
  if (sig.isClass) return genClassSig(name, sig, opts);

  const signatures = getSignatures(name, sig, opts);

  const lastDotIndex = name.lastIndexOf('.');
  const asyncPrefix = sig.isAsync ? 'async ' : '';

  let level;
  if (name.indexOf('.prototype.') !== -1) {
    level = opts.methodLevel;
  } else if (
    lastDotIndex !== -1 &&
    methods.has(name.substring(0, lastDotIndex))
  ) {
    level = opts.staticMethodLevel;
  } else {
    level = opts.functionLevel;
  }

  return signatures.reduce((acc, args) => {
    acc.push(headerify(`${asyncPrefix}${name}(${args.join(', ')})`, level), '');
    return acc;
  }, []);
};

const generateParameters = (parameters, opts) => {
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
      .map(t => wrapType(t, opts))
      .join('|');
    if (parameter.comment) {
      parameter.comment = ' ' + wrapComment(parameter.comment, opts);
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

const generateReturns = (comments, opts) => {
  const comment = comments.find(comment => comment.name === 'Returns');
  if (!comment) return [];

  const typeLine = genTypeLine(comment, opts);
  const line = genComment(comment, opts, typeLine);
  const res = generateParameters(comment.parameters, opts);
  return [line, '', ...res];
};

const generateDescription = (sig, opts) => {
  const buf = [];
  if (!sig.title) return buf;

  const title = wrapComment(sig.title, opts);
  buf.push(formatLine(title, 0, COMMENTS_SECONDARY_OFFSET));

  if (sig.description) {
    if (opts.separateTitleDescription) buf.push('');
    const description = wrapComment(sig.description, opts);
    buf.push(formatLine(description, 0, COMMENTS_SECONDARY_OFFSET));
  }
  buf.push('');

  return buf;
};

const generateRestComments = (comments, opts) => {
  const buf = [];
  for (const comment of comments) {
    let line;
    if (comment.name === 'Example' || comment.name === 'Result') {
      let code = comment.comment.trimLeft();
      if (!code.endsWith(';')) code += ';';
      line = `_${comment.name}:_\n\n\`\`\`js\n${code}\n\`\`\``;
    } else if (comment.name === 'Throws') {
      line = genComment(comment, opts, genTypeLine(comment, opts));
    } else if (comment.name === 'Deprecated') {
      line = genComment(comment, opts);
    }
    if (line) buf.push(line, '');
  }
  return buf;
};

const generateStaticProperties = (method, comments, opts) => {
  const buf = [];
  const comment = comments.find(comm => comm.name === 'Static properties');
  if (!comment) return buf;

  const params = getPropsParams(comment);
  for (const param of params) {
    if (param.types.length === 0 && param.nonStandardTypes.length === 0) {
      console.error(
        `Static property ${param.name} of ${method} does not have types`
      );
      process.exit(1);
    }
    let line = '- ' + genTypeLine(param, opts);
    if (param.comment) line += ' ' + wrapComment(param.comment, opts);
    buf.push(
      headerify(`${method}.${param.name}`, opts.propertyLevel),
      '',
      formatLine(line, 0)
    );
    const propParams = generateParameters(param.parameters, opts);
    if (propParams.length === 0) buf.push('');
    else buf.push(...propParams);
  }
  return buf;
};

const generateProperties = (method, comments, opts) => {
  const buf = [];
  const comment = comments.find(comm => comm.name === 'Properties');
  if (!comment) return buf;

  const params = getPropsParams(comment);
  for (const param of params) {
    if (param.types.length === 0 && param.nonStandardTypes.length === 0) {
      console.error(`Property ${param.name} of ${method} does not have types`);
      process.exit(1);
    }
    let line = '- ' + genTypeLine(param, opts);
    if (param.comment) line += ' ' + wrapComment(param.comment, opts);
    buf.push(
      headerify(`${method}.prototype.${param.name}`, opts.propertyLevel),
      '',
      formatLine(line, 0)
    );
    const propParams = generateParameters(param.parameters, opts);
    if (propParams.length === 0) buf.push('');
    else buf.push(...propParams);
  }
  return buf;
};

const generateFunction = (name, sig, opts, methods) => {
  if (sig.private && !opts.private) return [];
  if (sig.instance) return generateInstance(name, sig, opts);

  return [
    ...generateSignatures(name, sig, opts, methods),
    ...generateParameters(sig.parameters, opts),
    ...generateReturns(sig.comments, opts),
    ...generateDescription(sig, opts),
    ...generateRestComments(sig.comments, opts),
    ...generateStaticProperties(name, sig.comments, opts),
    ...generateProperties(name, sig.comments, opts),
  ];
};

const generateContentsTable = (buf, levelLimit = 0) => {
  if (levelLimit === 0) levelLimit = 6;
  let minLevel = 6;
  buf = buf.map(([name, header]) => {
    const link = genHeaderLink(header);
    const [hashtags] = common.section(header, ' ');
    const level = hashtags.length;
    if (level < minLevel) minLevel = level;
    return [`- [${name}](${link})`, level];
  });
  return buf
    .map(([str, level]) => [str, level - minLevel])
    .filter(([, level]) => level < levelLimit)
    .map(([str, level]) => ' '.repeat(level * 2) + str);
};

const sortMethods = (methods, prioritizedEntries) => {
  const sortFn = ([a], [b]) => {
    if (a === b) return 0;
    let aIdx = prioritizedEntries.indexOf(a);
    let bIdx = prioritizedEntries.indexOf(b);
    if (aIdx === -1) aIdx = Infinity;
    if (bIdx === -1) bIdx = Infinity;
    if (aIdx < bIdx) return -1;
    if (aIdx > bIdx) return 1;
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
  const other = Symbol('other');
  const grouped = iter(methods).groupBy(
    ([m]) =>
      prioritizedEntries.find(e => m === e || m.startsWith(e + '.')) || other
  );
  let result = iter([]);
  for (const p of prioritizedEntries) {
    const entries = grouped.get(p);
    if (entries) {
      const [other, sorted] = iter(entries).partition(
        ([m]) => !!prioritizedEntries.find(e => m === e)
      );
      result = result.chain(sorted.sort(sortFn)).chain(other);
    }
  }
  result = result.chain(grouped.get(other));
  return result.collectTo(Map);
};

// Generate md from interfaces inventory
//   inventory - <Map>, hash of map of records, `{ method, title, parameters }`
//   options - <Object>
//     header - <string>, text before api documentation
//     footer - <string>, text after api documentation
//     customTypes - <string[]>, custom types
//     customLinks - <Array[]>, custom types links
// Returns: <string>, md document
const generateMd = (inventory, options) => {
  const opts = { ...options, usedTypes: new Set() };

  const buf = [];
  const contentsTable = [];

  for (const [name, methods] of inventory) {
    if (!opts.removeInterface) {
      const header = headerify(`Interface: ${name}`, opts.interfaceLevel);
      buf.push(header, '');
      contentsTable.push([`Interface ${name}`, header]);
    }
    opts.customClasses = new Map();
    methods.forEach((sig, method) => {
      if (sig.isClass) {
        opts.customClasses.set(method, `${name}-${method}`.toLowerCase());
      }
    });
    const sortedMethods = sortMethods(methods, opts.prioritizedEntries);
    for (const [method, signature] of sortedMethods) {
      let fnBuf;
      const fnName = opts.namespacePrefix ? `${name}.${method}` : method;
      try {
        fnBuf = generateFunction(fnName, signature, opts, methods);
      } catch (err) {
        console.error(`'${name}.${method}' generation failed: ${err.message}`);
        process.exit(1);
      }
      buf.push(...fnBuf);
      if (fnBuf[0]) contentsTable.push([method, fnBuf[0]]);
    }
  }

  if (opts.contentsTable >= 0) {
    buf.unshift(
      ...generateContentsTable(contentsTable, opts.contentsTable),
      ''
    );
  }
  if (opts.header) buf.unshift(opts.header);
  if (opts.footer) buf.push(options.footer);
  buf.push(...getLinks(opts.usedTypes, opts.customLinks));
  if (buf[buf.length - 1] !== '') buf.push('');
  return buf.join('\n');
};

module.exports = { generateMd };
