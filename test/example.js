'use strict';

/* eslint-disable no-unused-vars */

// One-liner function description.
// Multi-line expanded function description. Note that all lines should have
// length of 80 or less characters.
// To specify custom arguments signature `Signature:` comment can be used. It
// also supports multiline.
// Backticks `are supported` and they ``can be used `inside` code blocks``.
// Note that`text that is not`separated from backtick will stick to it if line
// exceeds max length.
// Signature: num, str,
//     arg,
//     flag[, arr[, data]], obj,
//     cb
//   num <number> argument description
//   str - <string>, dash before and comma after types are optional
//   arg <Array> | <Date> | <Object> argument can have multiple types
//   flag <boolean> description of argument can have multiple lines, but
//       there should be indentation of 4 spaces after beginning of
//       the first line
//   arr <string[]> square braces can be added after `type` to
//       specify that this is array of `type`s
//   data <CustomType> custom type can be specified. e.g. this can be
//       instance of some class
//   obj <Object> its description
//     field1 <Object> fields of object can be nested but indentation
//         should increase by 2 more spaces for each level
//       field2 <any>
//     field3 <symbol> comment is optional, but type is obligatory
//     field4 [<Error>, <any>, <Error>, <any>]
//     field5 [<any>, <Error>, <any>, <Error>]
//     field6 [<any>, <Error>, <Error>, <any>]
//     field7 [<Error>, <any>, <any>, <Error>]
//     field8 [<any>, [<Error>, <any>], <Error>]
//   cb <Function> function description and/or example of
//       usage. e.g. cb(arg1, ...arg2)
//     arg1 <Map> arguments of function can also be nested using the
//         same rules provided for `Object`
//     arg2 <Array>
// Returns: <Object> description
//     of returned value. If this is
//     an object or function with defined structure, then it should
//     be described by rules defined above
//   numArr <number[]>
//   strArr <string[]>
//
// Throws: <TypeError> conditions causing error. Empty lines between
//     comments after parameters are optional
//
// Deprecated: should be added if this method was deprecated. Description
//     should have reason for deprecation and method to use instead if any. e.g.
//     Removed due to incompatibility with `moduleName` in version 2.0.0. Use
//     `newMethodName` instead.
//
// Example: methodName(1, '2', {}, false, ['3'], data, {}, fn);
//
// Example:
// methodName(
//   123456789,
//   'some text',
//   {},
//   false,
//   ['array', 'of', 'strings'],
//   data,
//   {}
// );
//
// Result:
// {
//   numArr: [4, 5, 6],
//   strArr: ['4', '5', '6'],
// }
const methodName = (num, str, arg, flag, arr, data, obj, cb) => {};

// Function with rest arguments
// Signature:
// Signature: arg, ...arr
// Signature: arg, arr
//   arg <string>
//   arr <number[]>
const restFunc = (arg, ...arr) => {};

// Description can also support types like <number>
//   obj <Object>
//     field <number>
//   arg1 comments can contain types like this: <string>
//   arg2
//   arg3 arguments do not have to have type or comment
const typeFunction = (obj, arg1, arg2, arg3) => {};

// Function with no arguments
// Returns: <string>
const noArgumentsFunction = () => 'str';

//   str <string>
//   num <number>
const noTitleFunction = (str, num) => str + num;

const noDescriptionFunction = () => {};

const oneArgumentLambda = a => (a + 2) ** 2;

const oneArgumentLambda2 = a => {
  console.log('a: ', a);
};

const oneArgumentAsyncLambda = async a => (a + 2) ** 2;

const oneArgumentAsyncLambda2 = async a => {
  console.log('a: ', a);
};

const asyncLambda = async () => {};

// Async functions are supported
const asyncFunc = async function() {};

const asyncFunc2 = async function(a) {
  console.log(a);
};

const undocumentedArgumentFunction = (arg1, arg2, ...args) => {};

const undocumentedDestructureFn = (
  arg1,
  { a, b = 3, c = 'hello, world' }
) => {};

const undocumentedDefaultFn = (arg1, arg2 = 'hello, world') => {};

// Example of links usage
// To create a link the following format should be used: `{meta doc}`.
// Links can have whitespace characters.
//   link <string> links can be also used across all comments and links names
//       can have parentheses at the end like `{introspect()}`.
const linksExample = link => console.log('Link:', link);

// Call async function
//   fn <Function>
//     a <boolean>
//     b <string>
// Example:
// callAsyncFunction((a, b) => {
//   if (a) {
//     console.log(b);
//   }
// })
const callAsyncFunction = fn =>
  process.nextTick(() => fn(!!Math.floor(Math.random() * 2), 'Yay!'));

// ExampleClass description
// Properties:
//   prop1 <string> property
//   prop2 <Object>
//   getProp1 <string> getter for `prop1`
//   setProp1 <string> setter for `prop1`
class ExampleClass {
  // ExampleClass constructor description
  //   arg1 <Object>
  //   arg2 <string>
  constructor(arg1, arg2) {
    this.prop1 = arg2;
    this.prop2 = arg1;
  }

  // method1 description
  //   arr <Array>
  method1(arr) {}

  // method2 description
  //   num <number>
  // Returns: <number> undescore and asterisk should be escaped: num \* num
  static method2(num) {
    return num * num;
  }

  // method3 description
  //   str <string>
  //   _num <number>
  _method3(str, _num) {}

  get getProp1() {
    return this.prop1;
  }

  set setProp1(val) {
    this.prop1 = val;
  }
}

class AnotherClass extends ExampleClass {
  // method4 description
  //   data <string>
  method4(data) {
    this.data = data;
  }
}

// PrototypeClass description and PrototypeClass constructor description
//   arg1 <Object>
//   arg2 <string>
const PrototypeClass = function(arg1, arg2) {};

// method1 description
//   num <number>
PrototypeClass.prototype.method1 = function(num) {};

// method2 description
//   arr <Array>
PrototypeClass.method2 = function(num) {};

// List of supported standard types:
//   `Primitive`
//   `boolean`,
//   `null`,
//   `undefined`,
//   `number`,
//   `string`,
//   `symbol`,
//   `Object`,
//   `Date`,
//   `BigInt`,
//   `Function`,
//   `RegExp`,
//   `DataView`,
//   `Map`,
//   `WeakMap`,
//   `Set`,
//   `WeakSet`,
//   `Array`,
//   `ArrayBuffer`,
//   `Int8Array`,
//   `Uint8Array`,
//   `Uint8ClampedArray`,
//   `Int16Array`,
//   `Uint16Array`,
//   `Int32Array`,
//   `Uint32Array`,
//   `Float32Array`,
//   `Float64Array`,
//   `Error`,
//   `EvalError`,
//   `TypeError`,
//   `RangeError`,
//   `SyntaxError`,
//   `ReferenceError`,
//   `this`
//
// List of supported non-standard types:
//   `any`

module.exports = {
  methodName,
  restFunc,
  typeFunction,

  noArgumentsFunction,
  noTitleFunction,
  noDescriptionFunction,

  oneArgumentLambda,
  oneArgumentLambda2,
  oneArgumentAsyncLambda,
  oneArgumentAsyncLambda2,
  asyncLambda,
  asyncFunc,
  asyncFunc2,

  undocumentedArgumentFunction,
  undocumentedDestructureFn,
  undocumentedDefaultFn,
  linksExample,
  callAsyncFunction,
  ExampleClass,
  AnotherClass,
  PrototypeClass,
};
