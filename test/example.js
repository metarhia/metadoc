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
// Signature: arg = 'abc', arr = []
// Signature: arg = 'abc'[, arr = []]
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
// Returns: <Promise>
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
// Links can have whitespace characters. And you still can use braces inside
// backticks to, for example, specify object `{ a: 1, b: 2 }`.
//   link <string> links can be also used across all comments and links names
//       can have parentheses at the end like `{introspect()}` or
//       `{ExampleClass#method1()}` or `{ExampleClass#getProp1}`.
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

// Function with function
//   fn <Function> function description
//     num <number> `fn` parameter
//   Returns: <number>
//   number <number>
// Returns: <number> result of `fn` execution
const functionWithFunction = (fn, number) => fn(Math.random() * number);

const arrayExportExample = (num1, num2) => {};

const functionsInFunctionParams = (
  lambda1 = () => {},
  lambda2 = () => 123,
  lambda3 = (...args) => {
    console.log(args);
  },
  lambda4 = a => {},
  fn = function(num) {
    console.log(num + num);
  }
) => {};

const lambdaInLambda = x => y => x + y;

// #private
// Undocumented function
// Documentation for functions that have `#private` notation will not be
// generated unless it is specified via cli or config file
const undocumentedFunction = (a, b, c) => {};

// ExampleClass description
// Static properties:
//   staticProp <string> static property
//   staticProp1 <Object> static property
//     staticProp2 <string> static property field
// Properties:
//   prop1 <string> property
//   prop2 <Object> prop description
//     field1 <number> prop field1 description
//       field2 <number> prop field2 description
//     field3
//     field4 <number>
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

  // #private
  // method3 description
  // Documentation for this method will not be generated unless it is specified
  // via cli or config file
  //   str <string>
  //   _num <number>
  _method3(str, _num) {}

  // #private
  // method4 description
  // Documentation for this static method will not be generated unless it is
  // specified via cli or config file
  static method4() {}

  // Property getter
  get getProp1() {
    return this.prop1;
  }

  set setProp1(val) {
    this.prop1 = val;
  }
}

// Properties:
//   prop <string>
class AnotherClass extends ExampleClass {
  constructor(...args) {
    super(...args);
  }

  // method4 description
  //   data <string>
  method4(data) {
    this.data = data;
  }
}

// #private
// Private class
// Documentation for this class and all its methods will not be generated
class UndocumentedClass extends AnotherClass {
  // UndocumentedClass constructor
  //   abc <number>
  constructor(abc) {
    super();
    this.abc = abc;
  }

  method5(str) {
    this.str = str;
  }
}

// Order1Class should be ordered correctly.
class Order1Class {
  constructor(abc) {}

  order1Method() {}

  order2Method() {}

  order3Method() {}
}

// Order2Class should be ordered correctly.
class Order2Class {
  constructor(abc) {}

  aMethod() {}

  order2Method() {}
}

// PrototypeClass description description
// Note that classes on prototypes will not have constructors and will be
// treated as a regular <function>.
//   arg1 <Object>
//   arg2 <string>
const PrototypeClass = function(arg1, arg2) {};

// method1 description
//   num <number>
PrototypeClass.prototype.method1 = function(num) {};

// method2 description
//   arr <Array>
PrototypeClass.method2 = function(num) {};

// functionWithComplexTypes
//   example <ExampleClass[]>
//   ff <Map> | <Object> | [<string>, <'b'>]
//   objs <Array<{ a: string; b: number }>>
//   map <Map<string, { a: 42 | 13 }>> | <Map<number, string>>
const functionWithComplexTypes = (examples, objs, map) => {};

// List of supported standard types:
//   `boolean`,
//   `null`,
//   `undefined`,
//   `number`,
//   `string`,
//   `symbol`,
//
//   `Object`,
//   `Date`,
//   `BigInt`,
//   `Function`,
//   `RegExp`,
//   `Promise`,
//   `DataView`,
//   `Proxy`,
//
//   `Map`,
//   `WeakMap`,
//   `Set`,
//   `WeakSet`,
//
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
//   `BigInt64Array`
//   `BigUint64Array`
//
//   `Error`,
//   `EvalError`,
//   `RangeError`,
//   `ReferenceError`,
//   `SyntaxError`,
//   `TypeError`,
//   `URIError`,
//
//   `Intl.Collator`,
//   `Intl.DateTimeFormat`,
//   `Intl.ListFormat`,
//   `Intl.NumberFormat`,
//   `Intl.PluralRules`,
//   `Intl.RelativeTimeFormat`,
//
//   `WebAssembly.Global`,
//   `WebAssembly.Module`,
//   `WebAssembly.Instance`,
//   `WebAssembly.Memory`,
//   `WebAssembly.Table`,
//   `WebAssembly.CompileError`,
//   `WebAssembly.LinkError`,
//   `WebAssembly.RuntimeError`,
//
//   `Primitive`,
//   `Iterable`,
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

  lambdas: {
    oneArgumentNested: {
      oneArgumentLambda,
      oneArgumentLambda2,
      oneArgumentAsyncLambda,
      oneArgumentAsyncLambda2,
    },
    asyncNestedFunctions: {
      asyncLambda,
      asyncFunc,
      asyncFunc2,
    },
  },

  arrayExport: [arrayExportExample],

  undocumentedArgumentFunction,
  undocumentedDestructureFn,
  undocumentedDefaultFn,
  linksExample,
  callAsyncFunction,
  functionWithFunction,
  undocumentedFunction,

  functionsInFunctionParams,
  lambdaInLambda,

  functionWithComplexTypes,

  ExampleClass,
  AnotherClass,
  PrototypeClass,
  UndocumentedClass,

  instances: {
    setInstance: new Set(),
    exampleClassInstance: new ExampleClass({}, ''),
  },

  nullObject: null,
  nullObjectCreate: Object.create(null),
  Order1Class,
  Order2Class,
};
