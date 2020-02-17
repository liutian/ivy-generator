# IvyGenerator

通过命令式api描述Angular组件，不需要依赖编译器直接生成Ivy代码，适合可视化搭建管理型页面的场景
> 注意该项目属于底层实现，需要你关注很多底层细节

## Usage
[more](./projects/ivy-generator/ivy.md)

## Demo

npm start
> 请查阅 `src/app/app.component.ts`

## hello world
```
// 生成ivy代码所需Angular API的引用集合
(<any>window).gc_apis = apis;

// 组件中使用到的所有指令，管道和子组件集合
const directiveMap = new Map();
const pipeMap = new Map();
const componentMap = new Map();

// 工厂类初始化
const factory = new CodeFactory(componentMap, directiveMap, pipeMap);

// 组件描述
const helloWorldComponentDef = new ComponentDef('div', [
  new TextNode('hello world')
]);

// 生成ivy代码
const componentDef = factory._createComponent(helloWorldComponentDef);

console.log('Ivy Code: \n\n' + helloWorldComponent._sourceCodes);

// 将组件呈现在页面上
const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentDef);
this.viewContainerRef.createComponent(componentFactory);
```

