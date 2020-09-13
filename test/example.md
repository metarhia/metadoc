- [Interface example](#interface-example)
  - [Order2Class](#class-order2class)
    - [Order2Class.prototype.constructor](#order2classprototypeconstructorabc)
    - [Order2Class.prototype.aMethod](#order2classprototypeamethod)
    - [Order2Class.prototype.order2Method](#order2classprototypeorder2method)
  - [Order1Class](#class-order1class)
    - [Order1Class.prototype.order2Method](#order1classprototypeorder2method)
    - [Order1Class.prototype.order1Method](#order1classprototypeorder1method)
    - [Order1Class.prototype.constructor](#order1classprototypeconstructorabc)
    - [Order1Class.prototype.order3Method](#order1classprototypeorder3method)
  - [methodName](#methodnamenum-str-arg-flag-arr-data-obj-cb)
  - [noTitleFunction](#notitlefunctionstr-num)
  - [typeFunction](#typefunctionobj-arg1-arg2-arg3)
  - [ExampleClass](#class-exampleclass)
    - [ExampleClass.method2](#exampleclassmethod2num)
    - [ExampleClass.prototype.constructor](#exampleclassprototypeconstructorarg1-arg2)
    - [ExampleClass.prototype.method1](#exampleclassprototypemethod1arr)
  - [restFunc](#restfunc)
  - [noArgumentsFunction](#noargumentsfunction)
  - [noDescriptionFunction](#nodescriptionfunction)
  - [lambdas.oneArgumentNested.oneArgumentLambda](#lambdasoneargumentnestedoneargumentlambdaa)
  - [lambdas.oneArgumentNested.oneArgumentLambda2](#lambdasoneargumentnestedoneargumentlambda2a)
  - [lambdas.oneArgumentNested.oneArgumentAsyncLambda](#async-lambdasoneargumentnestedoneargumentasynclambdaa)
  - [lambdas.oneArgumentNested.oneArgumentAsyncLambda2](#async-lambdasoneargumentnestedoneargumentasynclambda2a)
  - [lambdas.asyncNestedFunctions.asyncLambda](#async-lambdasasyncnestedfunctionsasynclambda)
  - [lambdas.asyncNestedFunctions.asyncFunc](#async-lambdasasyncnestedfunctionsasyncfunc)
  - [lambdas.asyncNestedFunctions.asyncFunc2](#async-lambdasasyncnestedfunctionsasyncfunc2a)
  - [arrayExport[0]](#arrayexport0num1-num2)
  - [undocumentedArgumentFunction](#undocumentedargumentfunctionarg1-arg2-args)
  - [undocumentedDestructureFn](#undocumenteddestructurefnarg1--a-b--3-c--hello-world-)
  - [undocumentedDefaultFn](#undocumenteddefaultfnarg1-arg2--hello-world)
  - [linksExample](#linksexamplelink)
  - [callAsyncFunction](#callasyncfunctionfn)
  - [functionWithFunction](#functionwithfunctionfn-number)
  - [functionsInFunctionParams](#functionsinfunctionparamslambda1-----lambda2----123-lambda3--args--consolelogargs-lambda4--a---fn--functionnum-consolelognum--num)
  - [lambdaInLambda](#lambdainlambdax)
  - [functionWithComplexTypes](#functionwithcomplextypesexample-ff-objs-map)
  - [AnotherClass](#class-anotherclass-extends-exampleclass)
    - [AnotherClass.prototype.constructor](#anotherclassprototypeconstructorargs)
    - [AnotherClass.prototype.method4](#anotherclassprototypemethod4data)
  - [PrototypeClass](#prototypeclassarg1-arg2)
    - [PrototypeClass.method2](#prototypeclassmethod2num)
    - [PrototypeClass.prototype.method1](#prototypeclassprototypemethod1num)
  - [instances.setInstance](#instancessetinstance)
  - [instances.exampleClassInstance](#instancesexampleclassinstance)

# Interface: example

## class Order2Class

Order2Class should be ordered correctly.

### Order2Class.prototype.constructor(abc)

### Order2Class.prototype.aMethod()

### Order2Class.prototype.order2Method()

## class Order1Class

Order1Class should be ordered correctly.

### Order1Class.prototype.order2Method()

### Order1Class.prototype.order1Method()

### Order1Class.prototype.constructor(abc)

### Order1Class.prototype.order3Method()

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
  - `field4`: [ [`<Error>`][error], `<any>`, [`<Error>`][error], `<any>` ]
  - `field5`: [ `<any>`, [`<Error>`][error], `<any>`, [`<Error>`][error] ]
  - `field6`: [ `<any>`, [`<Error>`][error], [`<Error>`][error], `<any>` ]
  - `field7`: [ [`<Error>`][error], `<any>`, `<any>`, [`<Error>`][error] ]
  - `field8`: [ `<any>`, [ [`<Error>`][error], `<any>` ], [`<Error>`][error] ]
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

## noTitleFunction(str, num)

- `str`: [`<string>`][string]
- `num`: [`<number>`][number]

## typeFunction(obj, arg1, arg2, arg3)

- `obj`: [`<Object>`][object]
  - `field`: [`<number>`][number]
- `arg1` comments can contain types like this: [`<string>`][string]
- `arg2`
- `arg3` arguments do not have to have type or comment

Description can also support types like [`<number>`][number]

## class ExampleClass

ExampleClass description

### ExampleClass.staticProp

- [`<string>`][string] static property

### ExampleClass.staticProp1

- [`<Object>`][object] static property
  - `staticProp2`: [`<string>`][string] static property field

### ExampleClass.prototype.prop1

- [`<string>`][string] property

### ExampleClass.prototype.prop2

- [`<Object>`][object] prop description
  - `field1`: [`<number>`][number] prop field1 description
    - `field2`: [`<number>`][number] prop field2 description
  - `field3`
  - `field4`: [`<number>`][number]

### ExampleClass.prototype.getProp1

- [`<string>`][string] getter for `prop1`

### ExampleClass.prototype.setProp1

- [`<string>`][string] setter for `prop1`

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

## restFunc()

## restFunc(arg, ...arr)

## restFunc(arg, arr)

## restFunc(arg = 'abc', arr = \[\])

## restFunc(arg = 'abc'\[, arr = \[\]\])

- `arg`: [`<string>`][string]
- `arr`: [`<number[]>`][number]

Function with rest arguments

## noArgumentsFunction()

_Returns:_ [`<string>`][string]

Function with no arguments

## noDescriptionFunction()

## lambdas.oneArgumentNested.oneArgumentLambda(a)

## lambdas.oneArgumentNested.oneArgumentLambda2(a)

## async lambdas.oneArgumentNested.oneArgumentAsyncLambda(a)

## async lambdas.oneArgumentNested.oneArgumentAsyncLambda2(a)

## async lambdas.asyncNestedFunctions.asyncLambda()

## async lambdas.asyncNestedFunctions.asyncFunc()

_Returns:_ [`<Promise>`][promise]

Async functions are supported

## async lambdas.asyncNestedFunctions.asyncFunc2(a)

## arrayExport\[0\](num1, num2)

## undocumentedArgumentFunction(arg1, arg2, ...args)

## undocumentedDestructureFn(arg1, { a, b = 3, c = 'hello, world' })

## undocumentedDefaultFn(arg1, arg2 = 'hello, world')

## linksExample(link)

- `link`: [`<string>`][string] links can be also used across all comments and
  links names can have parentheses at the end like
  [`introspect()`][introspect()] or
  [`ExampleClass#method1()`][exampleclass#method1()] or
  [`ExampleClass#getProp1`][exampleclass#getprop1].

Example of links usage
To create a link the following format should be used: [`meta doc`][meta doc].
Links can have whitespace characters. And you still can use braces inside
backticks to, for example, specify object `{ a: 1, b: 2 }`.

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

## functionWithFunction(fn, number)

- `fn`: [`<Function>`][function] function description
  - `num`: [`<number>`][number] `fn` parameter
- _Returns:_ [`<number>`][number]
- `number`: [`<number>`][number]

_Returns:_ [`<number>`][number] result of `fn` execution

Function with function

## functionsInFunctionParams(lambda1 = () => {}, lambda2 = () => 123, lambda3 = (...args) => {console.log(args);}, lambda4 = a => {}, fn = function(num) {console.log(num + num);})

## lambdaInLambda(x)

## functionWithComplexTypes(example, ff, objs, map)

- `example`: `<ExampleClass[]>`
- `ff`: [`<Map>`][map]|[`<Object>`][object]|[ [`<string>`][string], `<'b'>` ]
- `objs`: `<Array<{ a: string; b: number }>>`
- `map`: `<Map<string, { a: 42 | 13 }>>`|`<Map<number, string>>`

functionWithComplexTypes

## class AnotherClass extends [ExampleClass][example-exampleclass]

### AnotherClass.prototype.prop

- [`<string>`][string]

### AnotherClass.prototype.constructor(...args)

### AnotherClass.prototype.method4(data)

- `data`: [`<string>`][string]

method4 description

## PrototypeClass(arg1, arg2)

- `arg1`: [`<Object>`][object]
- `arg2`: [`<string>`][string]

PrototypeClass description description
Note that classes on prototypes will not have constructors and will be treated
as a regular `<function>`.

### PrototypeClass.method2(num)

- `num`: [`<number>`][number]

method1 description

### PrototypeClass.prototype.method1(num)

- `num`: [`<number>`][number]

method1 description

## instances.setInstance

- [`<Set>`][set]

## instances.exampleClassInstance

- `<ExampleClass>`

[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[typeerror]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[symbol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Symbol_type
[meta doc]: https://github.com/metarhia/metadoc
[introspect()]: https://github.com/metarhia/metadoc#introspectnamespace-text
[exampleclass#method1()]: #prototypeclassprototypemethod1num
[exampleclass#getprop1]: #prototypeclassprototypegetprop1
[example-exampleclass]: #class-exampleclass
