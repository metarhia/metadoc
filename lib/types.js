'use strict';

const PRIMITIVE_TYPES = [
  'boolean',
  'null',
  'undefined',
  'number',
  'string',
  'symbol',
];

const OBJECT_TYPES = [
  'Object',
  'Date',
  'BigInt',
  'Function',
  'RegExp',
  'Promise',
  'DataView',
  'Proxy',

  'Map',
  'WeakMap',
  'Set',
  'WeakSet',

  'Array',
  'ArrayBuffer',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',

  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',

  'Intl.Collator',
  'Intl.DateTimeFormat',
  'Intl.ListFormat',
  'Intl.NumberFormat',
  'Intl.PluralRules',
  'Intl.RelativeTimeFormat',

  'WebAssembly.Global',
  'WebAssembly.Module',
  'WebAssembly.Instance',
  'WebAssembly.Memory',
  'WebAssembly.Table',
  'WebAssembly.CompileError',
  'WebAssembly.LinkError',
  'WebAssembly.RuntimeError',
];

const STANDARD_TYPES = [
  ...PRIMITIVE_TYPES,
  ...OBJECT_TYPES,
  'Primitive',
  'Iterable',
  'this',
];

const ALL_TYPES = [...STANDARD_TYPES, 'any'];

module.exports = {
  PRIMITIVE_TYPES,
  OBJECT_TYPES,
  STANDARD_TYPES,
  ALL_TYPES,
};
