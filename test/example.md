### Interface: example

#### methodName(num, str, arg, flag[, arr[, data]], obj, cb)

- `num`: [`<number>`] argument description
- `str`: [`<string>`] dash before and comma after types are optional
- `arg`: [`<Array>`]` | `[`<Date>`]` | `[`<Object>`] argument can have multiple
      types
- `flag`: [`<boolean>`] description of argument can have multiple lines, but
      there should be indentation of 4 spaces after beginning of the first line
- `arr`: [`<string[]>`][`<string>`] square braces can be added after `type` to
      specify that this is array of `type`s
- `data`: `<CustomType>` custom type can be specified. e.g. this can be instance
      of some class
- `obj`: [`<Object>`] its description
  - `field1`: [`<Object>`] fields of object can be nested but indentation should
        increase by 2 more spaces for each level
    - `field2`: `<any>`
  - `field3`: [`<symbol>`] comment is optional, but type is obligatory
- `cb`: [`<Function>`] function description and/or example of usage. e.g.
      cb(arg1, ...arg2)
  - `arg1`: [`<Map>`] arguments of function can also be nested using the same
        rules provided for `Object`
  - `arg2`: [`<Array>`]

_Returns:_ [`<Object>`] description of returned value. If this is an object or
    function with defined structure, then it should be described by rules
    defined above
- `numArr`: [`<number[]>`][`<number>`]
- `strArr`: [`<string[]>`][`<string>`]

One-liner function description

Multi-line expanded function description. Note that all lines should have
length of 80 or less characters
To specify custom arguments signature `Signature:` comment can be used. It
also supports multiline

_Throws:_ [`<TypeError>`] conditions causing error. Empty lines between comments
    after parameters are optional

_Deprecated:_ should be added if this method was deprecated. Description should
    have reason for deprecation and method to use instead if any. e.g. Removed
    due to incompatibility with `moduleName` in version 2.0.0. Use
    `newMethodName` instead.

_Example:_
```js
 methodName(1, '2', {}, false, ['3'], data, {}, fn);
```

_Example:_
```js

methodName(4, '5', {},
  false, ['6'], data, {});
```

_Result:_
```js

{
  numArr: [4, 5, 6],
  strArr: ['4', '5', '6'],
}
```


#### ExampleClass()

ExampleClass description


#### ExampleClass.method2(num)

- `num`: [`<number>`]

method2 description


#### ExampleClass.prototype.constructor(arg1, arg2)

- `arg1`: [`<Object>`]
- `arg2`: [`<string>`]

ExampleClass constructor description


#### ExampleClass.prototype.method1(arr)

- `arr`: [`<Array>`]

method1 description


#### PrototypeClass()

PrototypeClass description and PrototypeClass constructor description


#### PrototypeClass.method2(num)

- `num`: [`<number>`]

method1 description


#### PrototypeClass.prototype.constructor(arg1, arg2)

- `arg1`: [`<Object>`]
- `arg2`: [`<string>`]

PrototypeClass description and PrototypeClass constructor description


#### PrototypeClass.prototype.method1(num)

- `num`: [`<number>`]

method1 description


[`<Object>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[`<Date>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[`<Function>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[`<Map>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[`<Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[`<TypeError>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
[`<boolean>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[`<number>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`<string>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[`<symbol>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Symbol_type
