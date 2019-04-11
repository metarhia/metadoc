# Interface: example

## methodName(num, str, arg, flag\[, arr\[, data\]\], obj, cb)

- `num`: [`<number>`][number] argument description
- `str`: [`<string>`][string] dash before and comma after types are optional
- `arg`: [`<Array>`][array]|[`<Date>`][date]|[`<Object>`][object] argument can
  have multiple types
- `flag`: [`<boolean>`][boolean] description of argument can have multiple
  lines, but there should be indentation of 4 spaces after beginning of the
  first line
- `arr`: [`<string[]>`][string] square braces can be added after `type` to
  specify that this is array of `type`s
- `data`: `<CustomType>` custom type can be specified. e.g. this can be instance
  of some class
- `obj`: [`<Object>`][object] its description
  - `field1`: [`<Object>`][object] fields of object can be nested but
    indentation should increase by 2 more spaces for each level
    - `field2`: `<any>`
  - `field3`: [`<symbol>`][symbol] comment is optional, but type is obligatory
- `cb`: [`<Function>`][function] function description and/or example of usage.
  e.g. cb(arg1, ...arg2)
  - `arg1`: [`<Map>`][map] arguments of function can also be nested using the
    same rules provided for `Object`
  - `arg2`: [`<Array>`][array]

_Returns:_ [`<Object>`][object] description of returned value. If this is an
object or function with defined structure, then it should be described by rules
defined above

- `numArr`: [`<number[]>`][number]
- `strArr`: [`<string[]>`][string]

One-liner function description.

Multi-line expanded function description. Note that all lines should have length
of 80 or less characters. To specify custom arguments signature `Signature:`
comment can be used. It also supports multiline. Backticks `are supported` and
they `` can be used `inside` code blocks ``. Note
that`text that is not`separated from backtick will stick to it if line exceeds
max length.

_Throws:_ [`<TypeError>`][typeerror] conditions causing error. Empty lines
between comments after parameters are optional

_Deprecated:_ should be added if this method was deprecated. Description should
have reason for deprecation and method to use instead if any. e.g. Removed due
to incompatibility with `moduleName` in version 2.0.0. Use `newMethodName`
instead.

_Example:_

```js
methodName(1, '2', {}, false, ['3'], data, {}, fn);
```

_Example:_

```js
methodName(
  123456789,
  'some text',
  {},
  false,
  ['array', 'of', 'strings'],
  data,
  {}
);
```

_Result:_

```js
{
  numArr: [4, 5, 6],
  strArr: ['4', '5', '6'],
};
```

## restFunc(arg, ...arr)

- `arg`: [`<string>`][string]
- `arr`: [`<number[]>`][number]

Function with rest arguments

## typeFunction(obj, arg1, arg2, arg3)

- `obj`: [`<Object>`][object]
  - `field`: [`<number>`][number]
- `arg1` comments can contain types like this: [`<string>`][string]
- `arg2`
- `arg3` arguments do not have to have type or comment

Description can also support types like [`<number>`][number]

## noArgumentsFunction()

_Returns:_ [`<string>`][string]

Function with no arguments

## noTitleFunction(str, num)

- `str`: [`<string>`][string]
- `num`: [`<number>`][number]

## noDescriptionFunction()

## async asyncFunc()

Async functions are supported

## undocumentedArgumentFunction(arg1, arg2, ...args)

## undocumentedDestructureFn(arg1, { a, b = 3, c = 'hello, world' })

## undocumentedDefaultFn(arg1, arg2 = 'hello, world')

## callAsyncFunction(fn)

- `fn`: [`<Function>`][function]
  - `a`: [`<boolean>`][boolean]
  - `b`: [`<string>`][string]

Call async function

_Example:_

```js
callAsyncFunction((a, b) => {
  if (a) {
    console.log(b);
  }
});
```

## class ExampleClass

ExampleClass description

### ExampleClass.prop1

- [`<string>`][string] property

### ExampleClass.prop2

- [`<Object>`][object]

### ExampleClass.method2(num)

- `num`: [`<number>`][number]

_Returns:_ [`<number>`][number] undescore and asterisk should be escaped: num \*
num

method2 description

### ExampleClass.prototype.constructor(arg1, arg2)

- `arg1`: [`<Object>`][object]
- `arg2`: [`<string>`][string]

ExampleClass constructor description

### ExampleClass.prototype.method1(arr)

- `arr`: [`<Array>`][array]

method1 description

### ExampleClass.prototype.\_method3(str, \_num)

- `str`: [`<string>`][string]
- `_num`: [`<number>`][number]

method3 description

### get ExampleClass.prototype.getProp1()

_Returns:_ [`<string>`][string]

Get `this.prop1`

### set ExampleClass.prototype.setProp1(val)

- `val`: [`<string>`][string]

Set `this.prop1`

## class PrototypeClass

PrototypeClass description and PrototypeClass constructor description

### PrototypeClass.method2(num)

- `num`: [`<number>`][number]

method1 description

### PrototypeClass.prototype.constructor(arg1, arg2)

- `arg1`: [`<Object>`][object]
- `arg2`: [`<string>`][string]

PrototypeClass description and PrototypeClass constructor description

### PrototypeClass.prototype.method1(num)

- `num`: [`<number>`][number]

method1 description

[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[typeerror]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[symbol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Symbol_type
