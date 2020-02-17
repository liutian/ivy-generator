
### 常用数据
- `decls` 静态内容的数量，包括普通dom节点（元素和文本），模板变量，文本插值中的管道，ng-template
- `vars` 动态内容的数量，包括属性绑定，双向绑定，文本插值数量和文本插值中用到的管道（x2）以及管道的参数，ng-template
- `index` dom节点，模板变量，管道在模板中位置索引
- `ɵɵpipeBindX(index,slotOffset)` 插值表达式中使用管道，index:管道的索引，slotOffset:数据偏移量，该值为组件范围内上一次使用的偏移量 + 上一次函数的管道参数（不包括第一个参数） + 2，该字段初始值为差值文本出现的个数

*** 表达式中不能出现对象字面量值，例如：{'xx':yy}
*** ng-content不能嵌套在ng-template或者结构性指令中时会有问题
*** 禁止style.xxx.yyy
*** 禁止style.lineHeight,使用style.line-height代替


### example
```typescript
export const apis: API = {
  // angular ivy api需要事先枚举引用
  ng_ɵɵelementStart: ɵɵelementStart,
  ng_ɵɵelementEnd: ɵɵelementEnd,
  ng_ɵɵtext: ɵɵtext,
  ng_ɵɵlistener: ɵɵlistener,
  ...
  // 组件中使用的指令，组件，管道，服务需要事先枚举引用
  ng_NgForOf: NgForOf,
  ng_NgIf: NgIf,
  ng_NgModel: NgModel,
  ng_DefaultValueAccessor: DefaultValueAccessor,
  ng_NgControlStatus: NgControlStatus,
}

(<any>window).gc_apis = apis;

const directiveMap = new Map();
const pipeMap = new Map();
const componentMap = new Map();
directiveMap.set('ngForOf', ['ng_NgForOf']);
directiveMap.set('ngIf', ['ng_NgIf']);
directiveMap.set('ngModel', ['ng_NgModel', 'ng_DefaultValueAccessor', 'ng_NgControlStatus']);

const factory = new CodeFactory(componentMap, directiveMap, pipeMap, {
  // 可省略默认配置项
  namespace: 'gc',
  apiPath: 'window.gc_apis'
});

// 定义模板节点
const containerNode = new Node('div', [], [
  new TextNode('Hello world!')
]);

// 创建组件定义对象
const demoComponentDef = new ComponentDef('Demo', [
  containerNode
]);

// 创建组件模型
const demoComponent = factory._createComponent(demoComponentDef);

// 将组件模型载入视图
const componentFactory = this.componentFactoryResolver.resolveComponentFactory(demoComponent);
viewContainerRef.createComponent(componentFactory);
```

### 元素嵌套
```html
<div>
  <h3>employee list</h3>
  <ul>
    <li>Tom</li>
    <li>Jack</li>
    <li>David</li>
  </ul>
</div>
```

usage
```typescript
const containerNode = new Node('div', [], [
  new Node('h3', [], [
    new TextNode('employee list')
  ]),
  new Node('ul', [], [
    new Node('li', [], [new TextNode('Tom')]),
    new Node('li', [], [new TextNode('Jack')]),
    new Node('li', [], [new TextNode('David')])
  ])
]);
```

compile
```javascript
decls: 10
vars: 0

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng["ɵɵelementStart"](0, "div");
    ng["ɵɵelementStart"](1, "h3");
    ng["ɵɵtext"](2, "employee list");
    ng["ɵɵelementEnd"]();
    ng["ɵɵelementStart"](3, "ul");
    ng["ɵɵelementStart"](4, "li");
    ng["ɵɵtext"](5, "Tom");
    ng["ɵɵelementEnd"]();
    ng["ɵɵelementStart"](6, "li");
    ng["ɵɵtext"](7, "Jack");
    ng["ɵɵelementEnd"]();
    ng["ɵɵelementStart"](8, "li");
    ng["ɵɵtext"](9, "David");
    ng["ɵɵelementEnd"]();
    ng["ɵɵelementEnd"]();
    ng["ɵɵelementEnd"]();
  }
}
```



### 普通属性
```html
<input type="text" name="newName" maxlength="10">
```

usage
```typescript
const inputNode = new Node('input', [
  new NodeAttr('type', 'text'),
  new NodeAttr('name', 'newName'),
  new NodeAttr('maxlength', '10')
]);
```

compile
```javascript
consts: [["type", "text", "name", "newName", "maxlength", "10"]],
decls: 1
vars: 0

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng["ɵɵelement"](0, "input", 0);
  }
}
```



### 属性绑定
```html
<input type="text" name="newName" maxlength="10" [placeholder]="placeholder">
```

usage
```typescript
const inputNode = new Node('input', [
  new NodeAttr('type', 'text'),
  new NodeAttr('name', 'newName'),
  new NodeAttr('maxlength', '10'),
  new NodeAttr('[placeholder]', 'placeholder')
]);

const demoComponentDef = new ComponentDef('Demo', [
  inputNode
]);

demoComponentDef.classConstructor = `
  this.placeholder = 'please input new name';
`;
```

compile
```javascript
class AppComponent {
  constructor(){
    this.placeholder = 'please input new name';
  }
}

consts: [["type", "text", "name", "newName", "maxlength", "10", 3, "placeholder"]]
decls: 1
vars: 1

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng["ɵɵelement"](0, "input", 0);
  }
  if (rf & 2) {
    ng["ɵɵproperty"]("placeholder", ctx.placeholder);
  }
}
```



### 事件监听
```html
<input type="text" name="newName" maxlength="10" [placeholder]="placeholder" (blur)="onBlur()">
```

usage
```typescript
const inputNode = new Node('input', [
  new NodeAttr('type', 'text'),
  new NodeAttr('name', 'newName'),
  new NodeAttr('maxlength', '10'),
  new NodeAttr('[placeholder]', 'placeholder'),
  new NodeAttr('(blur)', 'onBlur()')
]);

const demoComponentDef = new ComponentDef('Demo', [
  inputNode
]);

demoComponentDef.classConstructor = `
  this.placeholder = 'please input new name';
`;

demoComponentDef.classMethods = [
  `onBlur(){
    alert('input new name');
  }`
];
```

compile
```javascript
class AppComponent {
  constructor(){
    this.placeholder = 'please input new name';
  }

  onBlur(){
    alert('input new name');
  }
}

consts: [["type", "text", "name", "newName", "maxlength", "10", 3, "placeholder", "blur"]]
decls: 1
vars: 1

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng["ɵɵelementStart"](0, "input", 0);
    ng["ɵɵlistener"]("blur", function AppComponent_Template_input_blur_0_listener($event) { return ctx.onBlur(); });
    ng["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    ng["ɵɵproperty"]("placeholder", ctx.placeholder);
  }
}
```



### 双向绑定
```html
<input type="text" name="newName" maxlength="10" [placeholder]="placeholder" (blur)="onBlur()" [(ngModel)]="newName">
{{newName}}
```

usage
```typescript
const inputNode = new Node('input', [
  new NodeAttr('type', 'text'),
  new NodeAttr('name', 'newName'),
  new NodeAttr('maxlength', '10'),
  new NodeAttr('[placeholder]', 'placeholder'),
  new NodeAttr('(blur)', 'onBlur()'),
  new NodeAttr('[(ngModel)]', 'newName')
]);

const demoComponentDef = new ComponentDef('Demo', [
  inputNode, new TextNode('{{newName}}')
]);

demoComponentDef.classConstructor = `
  this.placeholder = 'please input new name';
`;

demoComponentDef.classMethods = [
  `onBlur(){
    alert('input new name');
  }`
];
```

compile
```javascript
class AppComponent {
  constructor(){
    this.placeholder = 'please input new name';
  }

  onBlur(){
    alert(`input new name`);
  }
}

consts: [["type", "text", "name", "newName", "maxlength", "10", 3, "placeholder", "ngModel", "blur", "ngModelChange"]]
decls: 2
vars: 3

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng["ɵɵelementStart"](0, "input", 0);
    ng["ɵɵlistener"]("blur", function AppComponent_Template_input_blur_0_listener($event) { return ctx.onBlur(); });
    ng["ɵɵlistener"]("ngModelChange", function AppComponent_Template_input_ngModelChange_0_listener($event) { return ctx.newName = $event; });
    ng["ɵɵelementEnd"]();
    ng["ɵɵtext"](1);
  }
  if (rf & 2) {
    ng["ɵɵproperty"]("placeholder", ctx.placeholder)("ngModel", ctx.newName);
    ng["ɵɵadvance"](1);
    ng["ɵɵtextInterpolate1"]("", ctx.newName, "\n");
  }
}

directives: [
  ng["DefaultValueAccessor"], ng["MaxLengthValidator"], ng["NgControlStatus"], ng["NgModel"]
]
```



### 文本节点多个差值多个管道多个参数
```html
text:{{text}} || {{text | lowercase | titlecase | slice:2:10}} || {{'hello world' | lowercase | titlecase | slice:2:10}}
```

usage
```typescript
pipeMap.set('lowercase', ['ng_LowerCasePipe']);
pipeMap.set('titlecase', ['ng_TitleCasePipe']);
pipeMap.set('slice', ['ng_SlicePipe']);

const factory = new CodeFactory(componentMap, directiveMap, pipeMap);

const demoComponentDef = new ComponentDef('Demo', [
  new TextNode("text:{{text}} || {{text | lowercase | titlecase | slice:2:10}} || {{'hello world' | lowercase | titlecase | slice:2:10}}")
]);

demoComponentDef.classConstructor = `
  this.text = 'hello world';
`;
```

compile
```javascript
class AppComponent {
  constructor(){
    this.text = 'hello world';
  }
}

decls: 7
vars: 19

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵtext"](0);
    ng_["ɵɵpipe"](1, "slice");
    ng_["ɵɵpipe"](2, "titlecase");
    ng_["ɵɵpipe"](3, "lowercase");
    ng_["ɵɵpipe"](4, "slice");
    ng_["ɵɵpipe"](5, "titlecase");
    ng_["ɵɵpipe"](6, "lowercase");
  } if (rf & 2) {
    ng_["ɵɵtextInterpolate3"](
      "text:", 
      ctx.placeholder, 
      " || ", 
      ng_["ɵɵpipeBind3"](1, 3, ng_["ɵɵpipeBind1"](2, 7, ng_["ɵɵpipeBind1"](3, 9, ctx.placeholder)), 2, 10), 
      " || ", 
      ng_["ɵɵpipeBind3"](4, 11, ng_["ɵɵpipeBind1"](5, 15, ng_["ɵɵpipeBind1"](6, 17, "hello world")), 2, 10), 
      " "
      );
  }
}
pipes: [
  ng_["SlicePipe"], 
  ng_["TitleCasePipe"], 
  ng_["LowerCasePipe"]
]
```



### 属性多个差值多个管道多个参数
```html
  <input type="text"
  placeholder="text:{{text}} || {{text | lowercase | titlecase | slice:2:10}} || {{'hello world' | lowercase | titlecase | slice:2:10}}">
```

usage
```typescript
pipeMap.set('lowercase', ['ng_LowerCasePipe']);
pipeMap.set('titlecase', ['ng_TitleCasePipe']);
pipeMap.set('slice', ['ng_SlicePipe']);

const factory = new CodeFactory(componentMap, directiveMap, pipeMap);

const demoComponentDef = new ComponentDef('Demo', [
  new Node('input', [
    new NodeAttr('type', 'text'),
    new NodeAttr('placeholder', "text:{{text}} || {{text | lowercase | titlecase | slice:2:10}} || {{'hello world' | lowercase | titlecase | slice:2:10}}")
  ])
]);

demoComponentDef.classConstructor = `
  this.text = 'hello world';
`;
```

compile
```javascript
class AppComponent {
  constructor(){
    this.text = 'hello world';
  }
}

consts: [["type", "text", 3, "placeholder"]]
decls: 7
vars: 19

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelement"](0, "input", 0);
    ng_["ɵɵpipe"](1, "slice");
    ng_["ɵɵpipe"](2, "titlecase");
    ng_["ɵɵpipe"](3, "lowercase");
    ng_["ɵɵpipe"](4, "slice");
    ng_["ɵɵpipe"](5, "titlecase");
    ng_["ɵɵpipe"](6, "lowercase");
  } if (rf & 2) {
    ng_["ɵɵpropertyInterpolate3"](
      "placeholder", 
      "text:", 
      ctx.text, 
      " || ", 
      ng_["ɵɵpipeBind3"](1, 3, ng_["ɵɵpipeBind1"](2, 7, ng_["ɵɵpipeBind1"](3, 9, ctx.placeholder)), 2, 10), 
      " || ", 
      ng_["ɵɵpipeBind3"](4, 11, ng_["ɵɵpipeBind1"](5, 15, ng_["ɵɵpipeBind1"](6, 17, "hello world")), 2, 10), 
      ""
      );
  }
}
pipes: [
  ng_["SlicePipe"], 
  ng_["TitleCasePipe"], 
  ng_["LowerCasePipe"]
], 
```



### *ngIf
```html
<button (click)="show = !show">toggle</button>
<div *ngIf="show">
  <a href="http://www.google.com">link...</a>
</div>
```

usage
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new Node('button', [
    new NodeAttr('(click)', 'show = !show')
  ], [new TextNode('toggle')]),
  new Node('div', [
    new NodeAttr('*ngIf', 'show')
  ], [
    new Node('a', [new NodeAttr('href', 'http://www.google.com')], [new TextNode('link...')])
  ])
]);
```

compile
```javascript
function AppComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "div");
    ng_["ɵɵelementStart"](1, "a", 2);
    ng_["ɵɵtext"](2, "link...");
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵelementEnd"]();
  }
}

consts: [[3, "click"], [4, "ngIf"], ["href", "http://www.google.com"]]
decls: 3
vars: 1

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
      ng_["ɵɵelementStart"](0, "button", 0);
      ng_["ɵɵlistener"]("click", function AppComponent_Template_button_click_0_listener($event) {
          return ctx.show = !ctx.show;
      });
      ng_["ɵɵtext"](1, "toggle");
      ng_["ɵɵelementEnd"]();
      ng_["ɵɵtemplate"](2, AppComponent_div_2_Template, 3, 0, "div", 1);
  }
  if (rf & 2) {
      ng_["ɵɵadvance"](2);
      ng_["ɵɵproperty"]("ngIf", ctx.show);
  }
}
directives: [ng["NgIf"]]
```



### *ngFor
```html
{{title}}
<ul>
  <li *ngFor="let item of list;let i = index;trackBy: trackById" #refLi>
  {{refLi}} --- {{item}} --- {{i}}
  </li>
</ul>
```

usage
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new TextNode('{{title}}'),
  new Node('ul', [], [
    new Node('li', [
      new NodeAttr('*ngFor', 'let item of list;let i = index;trackBy: trackById'),
      new NodeAttr('#refLi')
    ], [new TextNode('{{refLi}} --- {{item}} --- {{i}}')])
  ])
]);

demoComponentDef.classConstructor = `
  this.title = 'xxx';
  this.list = ['tom', 'jack', 'david'];
`;

demoComponentDef.classMethods = [
  `
    trackById(index,item) {
      return item;
    }
  `
];
```

compile
```javascript
function AppComponent_li_2_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "li", null, 1);
    ng_["ɵɵtext"](2);
    ng_["ɵɵelementEnd"]();
  } 
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    const i_r2 = ctx.index;
    const _r3 = ng_["ɵɵreference"](1);
    ng_["ɵɵadvance"](2);
    ng_["ɵɵtextInterpolate3"]("", _r3, " --- ", item_r1, " --- ", i_r2, "");
  }
}

class AppComponent {
  constructor() {
    this.title = 'xxx';
    this.list = ['tom', 'jack', 'david'];
  }
  trackById(index,item) {
    return item;
  }
}

consts: [[4, "ngFor", "ngForOf", "ngForTrackBy"], ["refLi", ""]]
decls: 3
vars: 3

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵtext"](0);
    ng_["ɵɵelementStart"](1, "ul");
    ng_["ɵɵtemplate"](2, AppComponent_li_2_Template, 3, 3, "li", 0);
    ng_["ɵɵelementEnd"]();
  } 
  if (rf & 2) {
    ng_["ɵɵtextInterpolate1"](" ", ctx.title, " ");
    ng_["ɵɵadvance"](2);
    ng_["ɵɵproperty"]("ngForOf", ctx.list)("ngForTrackBy", ctx.trackById);
  }
}, 
directives: [ng_["NgForOf"]], 
```


### 组件以及生命周期
```typescript
class AppComponent implements OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes...');
  }
}
```

usage
```typescript
demoComponentDef.classMethods = [
  `
  ngOnChanges(changes) {
    console.log('changes...');
  }
  `
]
```

compile
```javascript
class AppComponent{
  ngOnChanges(changes) {
    console.log('changes...');
  }
}

features: [ng_["ɵɵNgOnChangesFeature"]()], 
```




### @ContentChild() @ContentChildren()
```typescript
class AppComponent {
  @ContentChildren('contents') content1;
  @ContentChildren(ContentTypeA, { read: ContentReadTypeA, descendants: true }) content2;
  @ContentChild(ContentTypeB, { static: false, read: ContentReadTypeB }) content3;
  @ContentChild('content-one', { static: true }) content4;
}
```

usage
```typescript
(<any>window).gc_apis = apis;

(apis as any).ct_ContentTypeA = ContentTypeA;
(apis as any).ct_ContentTypeB = ContentTypeB;
(apis as any).ct_ContentReadTypeA = ContentReadTypeA;
(apis as any).ct_ContentReadTypeB = ContentReadTypeB;

demoComponentDef.contentQueries = [
  new ContentQuery(false, 'contents', 'content1'),
  new ContentQuery(false, `@${apiPath_p}.ct_ContentTypeA`, 'content2', { read: `${apiPath_p}.ct_ContentReadTypeA`, descendants: true }),
  new ContentQuery(true, `@${apiPath_p}.ct_ContentTypeB`, 'content3', { read: `${apiPath_p}.ct_ContentReadTypeB`, static: false }),
  new ContentQuery(true, 'content-one', 'content4', { static: true })
]
```

compile
```javascript
contentQueries: function AppComponent_ContentQueries(rf, ctx, dirIndex) {
  if (rf & 1) {
    ng_["ɵɵcontentQuery"](dirIndex, ContentTypeB, true, ContentReadTypeB);
    ng_["ɵɵstaticContentQuery"](dirIndex, ["content-one"], true);
    ng_["ɵɵcontentQuery"](dirIndex, ["contents"], false);
    ng_["ɵɵcontentQuery"](dirIndex, ContentTypeA, true, ContentReadTypeA);
  } 
  if (rf & 2) {
    var _t;
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.content3 = _t.first);
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.content4 = _t.first);
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.content1 = _t);
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.content2 = _t);
  }
},
```


### @ViewChild() @ViewChildren()
```typescript
class AppComponent {
  @ViewChildren('views') view1;
  @ViewChildren(ViewTypeA, { read: ViewReadTypeA }) view2;
  @ViewChild(ViewTypeB, { static: false, read: ViewReadTypeB }) view3;
  @ViewChild('view-one', { static: true }) view4;
}
```

usage
```typescript
(<any>window).gc_apis = apis;

(apis as any).ct_ViewTypeA = ViewTypeA;
(apis as any).ct_ViewTypeB = ViewTypeB;
(apis as any).ct_ViewReadTypeA = ViewReadTypeA;
(apis as any).ct_ViewReadTypeB = ViewReadTypeB;

demoComponentDef.viewQueries = [
  new ViewQuery(false, 'views', 'view1'),
  new ViewQuery(false, `@${apiPath_p}.ct_ViewTypeA`, 'view2', { read: `${apiPath_p}.ct_ViewReadTypeA` }),
  new ViewQuery(true, `@${apiPath_p}.ct_ViewTypeB`, 'view3', { read: `${apiPath_p}.ct_ViewReadTypeB`, static: false }),
  new ViewQuery(true, 'view-one', 'view4', { static: true })
]
```

compile
```javascript
viewQuery: function AppComponent_Query(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵviewQuery"](ViewTypeB, true, ViewReadTypeB);
    ng_["ɵɵstaticViewQuery"](["view-one"], true);
    ng_["ɵɵviewQuery"](["views"], true);
    ng_["ɵɵviewQuery"](ViewTypeA, true, ViewReadTypeA);
  }
  if (rf & 2) {
    var _t;
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.view3 = _t.first);
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.view4 = _t.first);
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.view1 = _t);
    ng_["ɵɵqueryRefresh"](_t = ng_["ɵɵloadQuery"]()) && (ctx.view2 = _t);
  }
}
```


### constructor 依赖注入
```typescript
class AppComponent {
  constructor(
    private httpClient: HttpClient,
    @Optional() @SkipSelf() private injector: Injector,
    @Optional() @Inject(APP_BASE_HREF) private appBaseHref: string,
    @Optional() @Self() private elementRef: ElementRef,
    @Optional() private demoService: DemoService) {
  }
}
```

usage
```typescript
(apis as any).ct_DemoService = DemoService;

demoComponentDef.dependencies = [
  new ClassDep('httpClient', `${apiPath_p}.ng_HttpClient`),
  new ClassDep('injector', `${apiPath_p}.ng_Injector`, ['Optional', 'SkipSelf']),
  new ClassDep('appBaseHref', `${apiPath_p}.ng_APP_BASE_HREF`, ['Optional']),
  new ClassDep('elementRef', `${apiPath_p}.ng_ElementRef`, ['Optional', 'Self']),
  new ClassDep('demoService', `${apiPath_p}.ct_DemoService`, ['Optional'])
]
```

compile
```javascript
class AppComponent {
  constructor(httpClient, injector, appBaseHref, elementRef, demoService) {
    this.httpClient = httpClient;
    this.injector = injector;
    this.appBaseHref = appBaseHref;
    this.elementRef = elementRef;
    this.demoService = demoService;
  }
}

AppComponent.ɵfac: function AppComponent_Factory(t) {
  return new (t || AppComponent)(
      ng_["ɵɵdirectiveInject"](ng_["HttpClient"]),
      ng_["ɵɵdirectiveInject"](ng_["Injector"], 12),
      ng_["ɵɵdirectiveInject"](ng_["APP_BASE_HREF"], 8),
      ng_["ɵɵdirectiveInject"](ng_["ElementRef"], 10),
      ng_["ɵɵdirectiveInject"](DemoService, 8)
  );
}
```

### 模板变量
```html
<input type="text" [(ngModel)]="name" #test="ngModel">
{{test}}
<ul>
  <li *ngFor="let item of list;let test = index">
    {{test}}
  </li>
</ul>
```
```typescript 
class AppComponent {
  name = '111';
  list = ['xxx']
}
```

usage --- 异常
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new Node('input', [
    new NodeAttr('type', 'text'),
    new NodeAttr('[(ngModel)]', 'name'),
    new NodeAttr('#test', 'ngModel')
  ]),
  new TextNode('{{test}}'),
  new Node('ul', [], [
    new Node('li', [
      new NodeAttr('*ngFor', 'let item of list;let test = index')
    ], [new TextNode('{{test}}')])
  ])
]);

demoComponentDef.classConstructor = `
  this.name = '111';
  this.list = ['xxx'];
`;
```

compile
```javascript
function AppComponent_li_4_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "li");
    ng_["ɵɵtext"](1);
    ng_["ɵɵelementEnd"]();
  } if (rf & 2) {
    const test_r3 = ctx.index;
    ng_["ɵɵadvance"](1);
    ng_["ɵɵtextInterpolate1"](" ", test_r3, " ");
  }
}

consts: [["type", "text", 3, "ngModel", "ngModelChange"], ["test", "ngModel"], [4, "ngFor", "ngForOf"]]
decls: 5, 
vars: 3,

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "input", 0, 1);
    ng_["ɵɵlistener"]("ngModelChange", function AppComponent_Template_input_ngModelChange_0_listener($event) { 
      return ctx.name = $event; 
    });
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵtext"](2);
    ng_["ɵɵelementStart"](3, "ul");
    ng_["ɵɵtemplate"](4, AppComponent_li_4_Template, 2, 1, "li", 2);
    ng_["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const _r0 = ng_["ɵɵreference"](1);
    ng_["ɵɵproperty"]("ngModel", ctx.name);
    ng_["ɵɵadvance"](2);
    ng_["ɵɵtextInterpolate1"]("\n", _r0, "\n");
    ng_["ɵɵadvance"](2);
    ng_["ɵɵproperty"]("ngForOf", ctx.list);
  }
},
directives: [
  ng_["DefaultValueAccessor"],
  ng_["NgControlStatus"],
  ng_["NgModel"],
  ng_["NgForOf"]
],
```


### ng-template
```html
{{title}}
<ng-template ngFor let-item [ngForOf]="list" let-i="index" [ngForTrackBy]="trackById" #title>
  <span>{{title}} --- {{item}} --- {{i}}</span>
</ng-template>
```
```typescript
class AppComponent {
  title = 'xxx';
  list = ['Tom', 'Jack', 'David'];

  trackById(index, item) {
    return item;
  }
}
```

usage
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new TextNode('{{title}}'),
  new Node('ng-template', [
    new NodeAttr('ngFor'),
    new NodeAttr('let-item'),
    new NodeAttr('[ngForOf]', 'list'),
    new NodeAttr('let-i', 'index'),
    new NodeAttr('[ngForTrackBy]', 'trackById'),
    new NodeAttr('#title')
  ], [
    new Node('span', [], [
      new TextNode('{{title}} --- {{item}} --- {{i}}')
    ])
  ])
]);

demoComponentDef.classConstructor = `
  this.title = 'xxx';
  this.list = ['Tom', 'Jack', 'David'];
`;

demoComponentDef.classMethods = [
  `
  trackById(index, item) {
    return item;
  }
  `
]
```

compile
```javascript
function AppComponent_ng_template_1_Template(rf, ctx) { 
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "span");
    ng_["ɵɵtext"](1);
    ng_["ɵɵelementEnd"]();
  } 
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const i_r3 = ctx.index;
    ng_["ɵɵnextContext"]();
    const _r0 = ng_["ɵɵreference"](2);
    ng_["ɵɵadvance"](1);
    ng_["ɵɵtextInterpolate3"]("", _r0, " --- ", item_r2, " --- ", i_r3, "");
  } 
}

class AppComponent {
  constructor() {
    this.title = 'xxx';
    this.list = ['Tom', 'Jack', 'David'];
  }
  trackById(index, item) {
    return item;
  }
}

consts: [["ngFor", "", 3, "ngForOf", "ngForTrackBy"], ["title", ""]]
decls: 3
vars: 3

template: function AppComponent_Template(rf, ctx) { 
  if (rf & 1) {
    ng_["ɵɵtext"](0);
    ng_["ɵɵtemplate"](1, AppComponent_ng_template_1_Template, 2, 3, "ng-template", 0, 1, ng_["ɵɵtemplateRefExtractor"]);
  } 
  if (rf & 2) {
    const _r0 = ng_["ɵɵreference"](2);
    ng_["ɵɵtextInterpolate1"]("", _r0, "\n");
    ng_["ɵɵadvance"](1);
    ng_["ɵɵproperty"]("ngForOf", ctx.list)("ngForTrackBy", ctx.trackById);
  }
}
directives: [ng_["NgForOf"]], 
```



### ng-container
```html
<div>head: {{title}}</div>
<ng-container *ngFor="let item of list;let i = index;" #title>
  <div>ngFor: {{title}}</div>
  <ng-container *ngIf="i % 2 === 0" #title>
    <div>index: {{i}}</div>
    <div>name: {{item}}</div>
    <div>ngIf: {{title}}</div>
  </ng-container>
</ng-container>
```

```typescript
class AppComponent {
  title = 'xxx';
  list = ['Tom', 'Jack', 'David'];
}
```

usage
```typescript 
const demoComponentDef = new ComponentDef('Demo', [
  new Node('div', [], [
    new TextNode('head: {{title}}')
  ]),
  new Node('ng-container', [
    new NodeAttr('*ngFor', 'let item of list;let i = index;'),
    new NodeAttr('#title')
  ], [
    new Node('div', [], [new TextNode('ngFor: {{title}}')]),
    new Node('ng-container', [
      new NodeAttr('*ngIf', 'i % 2 === 0'),
      new NodeAttr('#title')
    ], [
      new Node('div', [], [new TextNode('index: {{i}}')]),
      new Node('div', [], [new TextNode('name: {{item}}')]),
      new Node('div', [], [new TextNode('ngIf: {{title}}')])
    ])
  ])
]);

demoComponentDef.classConstructor = `
  this.title = 'xxx';
  this.list = ['Tom', 'Jack', 'David'];
`;
```

compile
```javascript
function AppComponent_ng_container_2_ng_container_4_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementContainerStart"](0, null, 1);
    ng_["ɵɵelementStart"](2, "div");
    ng_["ɵɵtext"](3);
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵelementStart"](4, "div");
    ng_["ɵɵtext"](5);
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵelementStart"](6, "div");
    ng_["ɵɵtext"](7);
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵelementContainerEnd"]();
  } 
  if (rf & 2) {
    const _r5 = ng_["ɵɵreference"](1);
    const ctx_r6 = ng_["ɵɵnextContext"]();
    const i_r2 = ctx_r6.index;
    const item_r1 = ctx_r6.$implicit;
    ng_["ɵɵadvance"](3);
    ng_["ɵɵtextInterpolate1"]("index: ", i_r2, "");
    ng_["ɵɵadvance"](2);
    ng_["ɵɵtextInterpolate1"]("name: ", item_r1, "");
    ng_["ɵɵadvance"](2);
    ng_["ɵɵtextInterpolate1"]("ngIf: ", _r5, "");
  }
}

function AppComponent_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementContainerStart"](0, null, 1);
    ng_["ɵɵelementStart"](2, "div");
    ng_["ɵɵtext"](3);
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵtemplate"](4, AppComponent_ng_container_2_ng_container_4_Template, 8, 3, "ng-container", 2);
    ng_["ɵɵelementContainerEnd"]();
  } if (rf & 2) {
    const i_r2 = ctx.index;
    const _r3 = ng_["ɵɵreference"](1);
    ng_["ɵɵadvance"](3);
    ng_["ɵɵtextInterpolate1"]("ngFor: ", _r3, "");
    ng_["ɵɵadvance"](1);
    ng_["ɵɵproperty"]("ngIf", i_r2 % 2 === 0);
  }
}

consts: [[4, "ngFor", "ngForOf"], ["title", ""], [4, "ngIf"]]
decls: 3
vars: 2

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "div");
    ng_["ɵɵtext"](1);
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵtemplate"](2, AppComponent_ng_container_2_Template, 5, 2, "ng-container", 0);
  } 
  if (rf & 2) {
    ng_["ɵɵadvance"](1);
    ng_["ɵɵtextInterpolate1"]("head: ", ctx.title, "");
    ng_["ɵɵadvance"](1);
    ng_["ɵɵproperty"]("ngForOf", ctx.list);
  }
}, 
directives: [
  ng_["NgForOf"], 
  ng_["NgIf"]
],
```



### NgClass指令 NgStyle指令
```html
<div [ngClass]="cls"></div>
<div [ngStyle]="styles"></div>
```

```typescript
class AppComponent {
  cls = ['class1', 'class2'];
  styles = {
    fontSize: '12px',
    color: 'red'
  }
}
```

usage
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new Node('div', [new NodeAttr('[ngClass]', 'cls')]),
  new Node('div', [new NodeAttr('[ngStyle]', 'styles')])
]);

demoComponentDef.classConstructor = `
  this.cls = ['class1', 'class2'];
  this.styles = {
    fontSize: '12px',
    color: 'red'
  };
`;
```

compile
```javascript
consts: [[3, "ngClass"], [3, "ngStyle"]],
decls: 2
vars: 2

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelement"](0, "div", [3, "ngClass"]);
    ng_["ɵɵelement"](1, "div", [3, "ngStyle"]);
  } 
  if (rf & 2) {
    ng_["ɵɵproperty"]("ngClass", ctx.cls);
    ng_["ɵɵadvance"](1);
    ng_["ɵɵproperty"]("ngStyle", ctx.styles);
  }
},
directives: [
  ng_["NgClass"], 
  ng_["NgStyle"]
], 
```



### ng-content
```html
<div>content...</div>
<ng-content selector="xxx"></ng-content>
<ng-content selector="yyy"></ng-content>
<ng-content></ng-content>
```

usage
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new Node('div', [], [new TextNode('content...')]),
  new Node('ng-content', [new NodeAttr('selector', 'xxx')]),
  new Node('ng-content', [new NodeAttr('selector', 'yyy')]),
  new Node('ng-content')
]);
```

compile
```javascript
ngContentSelectors: ["*", "*", "*"]
decls: 5
vars: 0
template: function Demo1Component_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵprojectionDef"](["*", "*", "*"]);
    ng_["ɵɵelementStart"](0, "div");
    ng_["ɵɵtext"](1, "content...");
    ng_["ɵɵelementEnd"]();
    ng_["ɵɵprojection"](2, 0, ["selector", "xxx"]);
    ng_["ɵɵprojection"](3, 1, ["selector", "yyy"]);
    ng_["ɵɵprojection"](4, 2);
  }
},
```



### class 多个差值多个管道多个参数 属性绑定 [class] 属性绑定 [class.xxx]
```html
<div class="aaa bbb"></div>
<div class="ccc ddd {{clsa | lowercase | titlecase | slice:2:10}} eee {{clsb}} fff{{ clsc }} ggg" title="{{title}}">
</div>
<div [class]="clsd"></div>
<ng-template>
  <div class="ccc ddd {{clsa | lowercase | titlecase | slice:2:10}} eee {{clsb}} fff{{ clsc }} ggg" title="{{title}}">
  </div>
</ng-template>
<div [class.cls2]="cls2"></div>
```

```typescript
class AppComponent {
  clsa = 'class-a';
  clsb = 'class-b';
  clsc = 'class-c';
  clsd = 'class-d';
  cls2 = 'class-2';
  title = 'hello world';
}
```

usage --- 异常
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new Node('div', [new NodeAttr('class', 'aaa bbb')]),
  new Node('div', [
    // tslint:disable-next-line:quotemark
    new NodeAttr('class', "ccc ddd {{clsa | lowercase | titlecase | slice:2:10}} eee {{clsb}} fff{{ clsc }} ggg"),
    new NodeAttr('title', '{{title}}')
  ]),
  new Node('div', [new NodeAttr('[class]', 'clsd')]),
  new Node('ng-template', [], [
    new Node('div', [
      new NodeAttr('class', 'ccc ddd {{clsa | lowercase | titlecase | slice:2:10}} eee {{clsb}} fff{{ clsc }} ggg'),
      new NodeAttr('title', '{{title}}')
    ])
  ]),
  new Node('div', [new NodeAttr('[class.cls2]', 'cls2')])
]);

demoComponentDef.classConstructor = `
  this.clsa = 'class-a';
  this.clsb = 'class-b';
  this.clsc = 'class-c';
  this.clsd = 'class-d';
  this.cls2 = 'class-2';
  this.text = 'hello world';
  this.title = 'hello world';
`;
```

compile
```javascript
function AppComponent_ng_template_6_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelementStart"](0, "div", 1);
    ng_["ɵɵpipe"](1, "slice");
    ng_["ɵɵpipe"](2, "titlecase");
    ng_["ɵɵpipe"](3, "lowercase");
    ng_["ɵɵelementEnd"]();
  } if (rf & 2) {
    const ctx_r0 = ng_["ɵɵnextContext"]();
    ng_["ɵɵclassMapInterpolate3"]("ccc ddd ", ng_["ɵɵpipeBind3"](1, 6, ng_["ɵɵpipeBind1"](2, 10, ng_["ɵɵpipeBind1"](3, 12, ctx_r0.clsa)), 2, 10), " eee ", ctx_r0.clsb, " fff", ctx_r0.clsc, " ggg");
    ng_["ɵɵpropertyInterpolate"]("title", ctx_r0.title);
  }
}

consts: [[1, "aaa", "bbb"], [3, "title"]]
decls: 8
vars: 18

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelement"](0, "div", 0);
    ng_["ɵɵelement"](1, "div", 1);
    ng_["ɵɵpipe"](2, "slice");
    ng_["ɵɵpipe"](3, "titlecase");
    ng_["ɵɵpipe"](4, "lowercase");
    ng_["ɵɵelement"](5, "div");
    ng_["ɵɵtemplate"](6, AppComponent_ng_template_6_Template, 4, 14, "ng-template");
    ng_["ɵɵelement"](7, "div");
  }
  if (rf & 2) {
    ng_["ɵɵadvance"](1);
    ng_["ɵɵclassMapInterpolate3"]("ccc ddd ", ng_["ɵɵpipeBind3"](2, 10, ng_["ɵɵpipeBind1"](3, 14, ng_["ɵɵpipeBind1"](4, 16, ctx.clsa)), 2, 10), " eee ", ctx.clsb, " fff", ctx.clsc, " ggg");
    ng_["ɵɵpropertyInterpolate"]("title", ctx.title);
    ng_["ɵɵadvance"](4);
    ng_["ɵɵclassMap"](ctx.clsd);
    ng_["ɵɵadvance"](2);
    ng_["ɵɵclassProp"]("cls2", ctx.cls2);
  }
}
pipes: [
    ng_["SlicePipe"], 
    ng_["TitleCasePipe"], 
    ng_["LowerCasePipe"]
], 
```


### style 多个差值多个管道多个参数 属性绑定 [style] 属性绑定 [style.xxx] style.xxx
```html
<div style="font-size:20px;padding: 10px;"></div>
<div style="font-size:20px;padding: 10px;" [style]="styles" [style.background-color]="styleColor"
  style.background-color="red{{styleColor| lowercase | titlecase | slice:2:10}}"></div>
```

```typescript
class AppComponent {
  styles = {
    fontSize: '12px',
    color: 'red'
  };

  styleColor = 'blue';
}
```

usage  --- 异常
```typescript
const demoComponentDef = new ComponentDef('Demo', [
  new Node('div', [new NodeAttr('style', 'font-size:20px;padding: 10px;')]),
  new Node('div', [
    new NodeAttr('style', 'font-size:20px;padding: 10px;'),
    new NodeAttr('[style]', 'styles'),
    new NodeAttr('[style.background-color]', 'styleColor'),
    new NodeAttr('style.background-color', 'red{{styleColor| lowercase | titlecase | slice:2:10}}')
  ])
]);

demoComponentDef.classConstructor = `
  this.styles = {
    fontSize: '12px',
    color: 'red'
  };

  this.styleColor = 'blue';
`;
```

compile
```javascript
consts: [[2, "font-size", "20px", "padding", "10px"]]
decls: 5
vars: 15

template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    ng_["ɵɵelement"](0, "div", 0);
    ng_["ɵɵelement"](1, "div", 0);
    ng_["ɵɵpipe"](2, "slice");
    ng_["ɵɵpipe"](3, "titlecase");
    ng_["ɵɵpipe"](4, "lowercase");
  }
  if (rf & 2) {
    ng_["ɵɵadvance"](1);
    ng_["ɵɵstyleMap"](ctx.styles,ng_["ɵɵdefaultStyleSanitizer"]);
    ng_["ɵɵstyleProp"]("background-color", ctx.styleColor);
    ng_["ɵɵstylePropInterpolate1"]("background-color", "red", ng_["ɵɵpipeBind3"](2, 7, ng_["ɵɵpipeBind1"](3, 11, ng_["ɵɵpipeBind1"](4, 13, ctx.styleColor)), 2, 10), "");
  }
}
pipes: [
  ng_["SlicePipe"],
  ng_["TitleCasePipe"],
  ng_["LowerCasePipe"]
]
```


### attr.xxx 多个差值多个管道多个参数 属性绑定 [attr.xxx]



### @Input
```typescript
class AppComponent {
  @Input('appTitle') title = 'developer';
  @Input() name = 'tome';
}
```
```javascript
class AppComponent {
  constructor() {
    this.title = 'developer';
    this.name = 'tome';
  }
}

inputs: { title: ["appTitle", "title"], name: "name" },
```



### @Ouput
```typescript
class AppComponent {
  @Output('appChangeTitle') changeTitle = new EventEmitter();
  @Output() changeAddress = new EventEmitter();
}
```
```javascript
class AppComponent {
  constructor() {
    this.changeTitle = new ng_["EventEmitter"]();
    this.changeAddress = new ng_["EventEmitter"]();
  }
}

outputs: { changeTitle: "appChangeTitle", changeAddress: "changeAddress" }, 
```



### @HostBinding()
```typescript
class AppComponent {
  @HostBinding('class.theme') appTheme = true;
  @HostBinding('attr.title') appTitle = 'xxx';
  @HostBinding('style.fontSize') appFontSize = '20px';
  @HostBinding('class') appClass = 'cl1 cl2';
  @HostBinding('style') appStyle = 'line-height: 2em;';
  @HostBinding('id') appId = 'app-host';
}
```
```javascript
class AppComponent {
  constructor() {
    this.appTheme = true;
    this.appTitle = 'xxx';
    this.appFontSize = '20px';
    this.appClass = 'cl1 cl2';
    this.appStyle = 'line-height: 2em;';
    this.appId = 'app-host';
  }
}

hostBindings: function AppComponent_HostBindings(rf, ctx, elIndex) {
  if (rf & 2) {
    ng_["ɵɵhostProperty"]("id", ctx.appId);
    ng_["ɵɵattribute"]("title", ctx.appTitle);
    ng_["ɵɵstyleSanitizer"](ng_["ɵɵdefaultStyleSanitizer"]);
    ng_["ɵɵstyleMap"](ctx.appStyle);
    ng_["ɵɵclassMap"](ctx.appClass);
    ng_["ɵɵstyleProp"]("font-size", ctx.appFontSize);
    ng_["ɵɵclassProp"]("theme", ctx.appTheme);
  }
}
```

### @HostListener()
```typescript
class AppComponent {
  @HostBinding('class.theme') appTheme = true;
  @HostListener('click',['$event.target']) onClick(btn){
    console.log('click...');
  }
}
```
```javascript
class AppComponent {
  constructor() {
    this.appTheme = true;
  }
  onClick(btn) {
    console.log('click...');
  }
}

hostBindings: function AppComponent_HostBindings(rf, ctx, elIndex) {
  if (rf & 1) {
    ng_["ɵɵlistener"]("click", function AppComponent_click_HostBindingHandler($event) { 
      return ctx.onClick($event.target); 
    });
  } if (rf & 2) {
    ng_["ɵɵclassProp"]("theme", ctx.appTheme);
  }
},
```
