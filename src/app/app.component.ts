import { Component, ViewContainerRef, ComponentFactoryResolver, OnInit } from '@angular/core';
import {
  CodeFactory, Component as IvyComponent, NodeAttr, Node,
  TextNode, Input as IvyInput, Output as IvyOutput, HostBind as IvyHostBind
} from '@baozun/ivy-generator';
import { apis } from './api';

@Component({
  selector: 'app-root',
  template: `
  <h3>ivy-generator</h3>
  `,
  styles: []
})
export class AppComponent implements OnInit {

  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    const directiveMap = new Map();
    const pipeMap = new Map();
    const componentMap = new Map();
    directiveMap.set('ngForOf', ['ng_NgForOf']);
    directiveMap.set('ngIf', ['ng_NgIf']);
    directiveMap.set('ngModel', ['ng_NgModel', 'ng_DefaultValueAccessor', 'ng_NgControlStatus']);

    const factory = new CodeFactory(componentMap, directiveMap, pipeMap);
    const employeeComponent = this.createEmployee();

    (<any>window).gc_apis = apis;
    (<any>apis).app_employee = factory._createComponent(employeeComponent);
    componentMap.set('app-employee', 'app_employee');

    const componentName = 'EmployeeList';

    const list = new Node('app-employee', [
      new NodeAttr('*ngFor', 'let item of list;let i = index'),
      new NodeAttr('[name]', 'item'),
      new NodeAttr('(update)', 'onUpdate(i,$event)'),
      new NodeAttr('(remove)', 'onRemove(i)'),
    ]);

    const input = new Node('input', [new NodeAttr('[(ngModel)]', 'newName')]);
    const addBtn = new Node('button', [new NodeAttr('(click)', 'onAdd()')], [new TextNode('add')]);

    const employeeListComponent = new IvyComponent(componentName, [
      input, addBtn, list
    ]);

    employeeListComponent.classConstructor = `
      this.list = ['Tom','Jack','David'];
    `;
    employeeListComponent.classMethods = [
      `
      onAdd() {
        if (!this.newName || !this.newName.trim()) {
          alert('名称不能为空');
          return;
        }

        this.list.push(this.newName);
        this.newName = '';
      }
      `, `
      onUpdate(index, newName) {
        this.list.splice(index, 1, newName);
      }
      `, `
      onRemove(index) {
        this.list.splice(index, 1);
      }
      `
    ];

    const employeeListDef = factory._createComponent(employeeListComponent);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(employeeListDef);
    this.viewContainerRef.createComponent(componentFactory);

    // tslint:disable-next-line:no-console
    console.log(`EmployeeList sourceCodes:\n${employeeListComponent._sourceCodes}`);
    // tslint:disable-next-line:no-console
    console.log(`Employee sourceCodes:\n${employeeComponent._sourceCodes}`);
  }

  createEmployee() {
    const text = new Node('span', [
      new NodeAttr('*ngIf', '!editing')
    ], [new TextNode('{{name}}')]);

    const input = new Node('input', [
      new NodeAttr('*ngIf', 'editing'),
      new NodeAttr('[(ngModel)]', 'newName')
    ]);

    const editBtn = new Node('button', [
      new NodeAttr('*ngIf', '!editing'),
      new NodeAttr('(click)', 'editing = true;newName = name;')
    ], [new TextNode('edit')]);

    const removeBtn = new Node('button', [
      new NodeAttr('*ngIf', '!editing'),
      new NodeAttr('(click)', 'onRemove()')
    ], [new TextNode('remove')]);

    const okBtn = new Node('button', [
      new NodeAttr('*ngIf', 'editing'),
      new NodeAttr('(click)', 'onUpdate()')
    ], [new TextNode('ok')]);

    const cancelBtn = new Node('button', [
      new NodeAttr('*ngIf', 'editing'),
      new NodeAttr('(click)', 'editing = false;')
    ], [new TextNode('cancel')]);

    const employeeComponent = new IvyComponent('Employee', [
      text, input, editBtn, removeBtn, okBtn, cancelBtn
    ]);

    employeeComponent.selector = 'app-employee';
    employeeComponent.hostBindList.push(new IvyHostBind('style.display', 'display', 'block'));
    employeeComponent.inputs.push(new IvyInput('name'));
    employeeComponent.outputs.push(
      new IvyOutput('update'),
      new IvyOutput('remove')
    );

    employeeComponent.classMethods.push(
      `
      onUpdate(){
        this.update.emit(this.newName);
        this.editing = false;
      }
      `, `
      onRemove(){
        this.remove.emit();
        this.editing = false;
      }
      `
    );

    return employeeComponent;
  }
}
