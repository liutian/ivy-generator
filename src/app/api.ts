import {
  ɵɵdefineNgModule, ɵɵdefineInjector, ɵɵdefineComponent, ɵɵelementStart, ɵɵelementEnd,
  ɵɵtext, ɵɵlistener, ɵɵselect, ɵɵproperty, ɵɵdirectiveInject, ɵɵstaticContentQuery,
  ɵɵloadQuery, ɵɵviewQuery, ɵɵstaticViewQuery, ɵɵqueryRefresh,
  ɵɵcontentQuery, ɵɵhostProperty, EventEmitter, ɵɵtemplate, ɵɵelementContainerStart,
  ɵɵelementContainerEnd, ɵɵgetCurrentView, ɵɵelement, ɵɵelementContainer, ɵɵtemplateRefExtractor,
  ɵɵrestoreView, ɵɵtextInterpolateV, ɵɵnextContext, ɵɵreference, ɵɵattribute, ɵɵattributeInterpolate1,
  ɵɵattributeInterpolate2, ɵɵattributeInterpolate3, ɵɵattributeInterpolate4, ɵɵattributeInterpolate5,
  ɵɵattributeInterpolate6, ɵɵattributeInterpolate7, ɵɵattributeInterpolate8, ɵɵattributeInterpolateV,
  ɵɵclassMap, ɵɵclassMapInterpolate1, ɵɵclassMapInterpolate2, ɵɵclassMapInterpolate3, ɵɵclassMapInterpolate4,
  ɵɵclassMapInterpolate5, ɵɵclassMapInterpolate6, ɵɵclassMapInterpolate7, ɵɵclassMapInterpolate8,
  ɵɵclassMapInterpolateV, ɵɵpropertyInterpolate, ɵɵpropertyInterpolate1, ɵɵpropertyInterpolate2,
  ɵɵpropertyInterpolate3, ɵɵpropertyInterpolate4, ɵɵpropertyInterpolate5, ɵɵpropertyInterpolate6,
  ɵɵpropertyInterpolate7, ɵɵpropertyInterpolate8, ɵɵpropertyInterpolateV, ɵɵstyleProp,
  ɵɵstylePropInterpolate1, ɵɵstylePropInterpolate2, ɵɵstylePropInterpolate3, ɵɵstylePropInterpolate4,
  ɵɵstylePropInterpolate5, ɵɵstylePropInterpolate6, ɵɵstylePropInterpolate7, ɵɵstylePropInterpolate8,
  ɵɵstylePropInterpolateV, ɵɵtextInterpolate, ɵɵtextInterpolate1, ɵɵtextInterpolate2, ɵɵtextInterpolate3,
  ɵɵtextInterpolate4, ɵɵtextInterpolate5, ɵɵtextInterpolate6, ɵɵtextInterpolate7, ɵɵtextInterpolate8,
  ɵɵpipe, ɵɵpipeBind1, ɵɵpipeBind2, ɵɵpipeBind3, ɵɵpipeBind4, ɵɵpipeBindV,
  ɵɵNgOnChangesFeature, ɵɵstyleSanitizer, ɵɵdefaultStyleSanitizer, ɵɵstyleMap, ɵɵclassProp, Injector,
  ElementRef, ɵɵprojectionDef, ɵɵprojection
} from '@angular/core';

import { RouterModule } from '@angular/router';
import { DefaultValueAccessor, NgControlStatus, NgModel } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgForOf, NgClass, NgStyle, SlicePipe, TitleCasePipe, LowerCasePipe, APP_BASE_HREF, JsonPipe } from '@angular/common';

export class API {
  ng_ɵɵdefineNgModule: any;
  ng_ɵɵdefineInjector: any;
  ng_RouterModule: any;
  ng_ɵɵdefineComponent: any;
  ng_ɵɵelementStart: any;
  ng_ɵɵelementEnd: any;
  ng_ɵɵtext: any;
  ng_ɵɵlistener: any;
  ng_ɵɵselect: any;
  ng_ɵɵdirectiveInject: any;
  ng_ɵɵstaticContentQuery: any;
  ng_ɵɵcontentQuery: any;
  ng_ɵɵqueryRefresh: any;
  ng_ɵɵloadQuery: any;
  ng_ɵɵstaticViewQuery: any;
  ng_ɵɵviewQuery: any;
  ng_ɵɵhostProperty: any;
  ng_ɵɵtemplate: any;
  ng_ɵɵelementContainerEnd: any;
  ng_ɵɵelementContainerStart: any;
  ng_ɵɵgetCurrentView: any;
  ng_ɵɵelement: any;
  ng_ɵɵelementContainer: any;
  ng_ɵɵtemplateRefExtractor: any;
  ng_ɵɵrestoreView: any;
  ng_ɵɵnextContext: any;
  ng_ɵɵreference: any;
  ng_ɵɵattribute: any;
  ng_ɵɵattributeInterpolate1: any;
  ng_ɵɵattributeInterpolate2: any;
  ng_ɵɵattributeInterpolate3: any;
  ng_ɵɵattributeInterpolate4: any;
  ng_ɵɵattributeInterpolate5: any;
  ng_ɵɵattributeInterpolate6: any;
  ng_ɵɵattributeInterpolate7: any;
  ng_ɵɵattributeInterpolate8: any;
  ng_ɵɵattributeInterpolateV: any;
  ng_ɵɵclassMap: any;
  ng_ɵɵclassMapInterpolate1: any;
  ng_ɵɵclassMapInterpolate2: any;
  ng_ɵɵclassMapInterpolate3: any;
  ng_ɵɵclassMapInterpolate4: any;
  ng_ɵɵclassMapInterpolate5: any;
  ng_ɵɵclassMapInterpolate6: any;
  ng_ɵɵclassMapInterpolate7: any;
  ng_ɵɵclassMapInterpolate8: any;
  ng_ɵɵclassMapInterpolateV: any;
  ng_ɵɵproperty: any;
  ng_ɵɵpropertyInterpolate: any;
  ng_ɵɵpropertyInterpolate1: any;
  ng_ɵɵpropertyInterpolate2: any;
  ng_ɵɵpropertyInterpolate3: any;
  ng_ɵɵpropertyInterpolate4: any;
  ng_ɵɵpropertyInterpolate5: any;
  ng_ɵɵpropertyInterpolate6: any;
  ng_ɵɵpropertyInterpolate7: any;
  ng_ɵɵpropertyInterpolate8: any;
  ng_ɵɵpropertyInterpolateV: any;
  ng_ɵɵstyleProp: any;
  ng_ɵɵstylePropInterpolate1: any;
  ng_ɵɵstylePropInterpolate2: any;
  ng_ɵɵstylePropInterpolate3: any;
  ng_ɵɵstylePropInterpolate4: any;
  ng_ɵɵstylePropInterpolate5: any;
  ng_ɵɵstylePropInterpolate6: any;
  ng_ɵɵstylePropInterpolate7: any;
  ng_ɵɵstylePropInterpolate8: any;
  ng_ɵɵstylePropInterpolateV: any;
  ng_ɵɵtextInterpolate: any;
  ng_ɵɵtextInterpolate1: any;
  ng_ɵɵtextInterpolate2: any;
  ng_ɵɵtextInterpolate3: any;
  ng_ɵɵtextInterpolate4: any;
  ng_ɵɵtextInterpolate5: any;
  ng_ɵɵtextInterpolate6: any;
  ng_ɵɵtextInterpolate7: any;
  ng_ɵɵtextInterpolate8: any;
  ng_ɵɵtextInterpolateV: any;
  ng_ɵɵpipe: any;
  ng_ɵɵpipeBind1: any;
  ng_ɵɵpipeBind2: any;
  ng_ɵɵpipeBind3: any;
  ng_ɵɵpipeBind4: any;
  ng_ɵɵpipeBindV: any;
  ng_ɵɵNgOnChangesFeature: any;
  ng_ɵɵstyleSanitizer: any;
  ng_ɵɵdefaultStyleSanitizer: any;
  ng_ɵɵstyleMap: any;
  ng_ɵɵclassProp: any;
  ng_ɵɵprojectionDef: any;
  ng_ɵɵprojection: any;


  ng_HttpClient: any;
  ng_Injector: any;
  ng_NgIf: any;
  ng_NgForOf: any;
  ng_NgClass: any;
  ng_NgStyle: any;
  ng_DefaultValueAccessor: any;
  ng_NgControlStatus: any;
  ng_NgModel: any;
  ng_EventEmitter: any;
  ng_SlicePipe: any;
  ng_TitleCasePipe: any;
  ng_LowerCasePipe: any;
  ng_APP_BASE_HREF: any;
  ng_ElementRef: any;
  ng_JsonPipe: any;
}

export const apis: API = {
  ng_ɵɵdefineNgModule: ɵɵdefineNgModule,
  ng_ɵɵdefineInjector: ɵɵdefineInjector,
  ng_ɵɵdefineComponent: ɵɵdefineComponent,
  ng_ɵɵelementStart: ɵɵelementStart,
  ng_ɵɵelementEnd: ɵɵelementEnd,
  ng_ɵɵtext: ɵɵtext,
  ng_ɵɵlistener: ɵɵlistener,
  ng_ɵɵselect: ɵɵselect,
  ng_ɵɵdirectiveInject: ɵɵdirectiveInject,
  ng_ɵɵstaticContentQuery: ɵɵstaticContentQuery,
  ng_ɵɵcontentQuery: ɵɵcontentQuery,
  ng_ɵɵqueryRefresh: ɵɵqueryRefresh,
  ng_ɵɵstaticViewQuery: ɵɵstaticViewQuery,
  ng_ɵɵviewQuery: ɵɵviewQuery,
  ng_ɵɵloadQuery: ɵɵloadQuery,
  ng_ɵɵhostProperty: ɵɵhostProperty,
  ng_ɵɵtemplate: ɵɵtemplate,
  ng_ɵɵelementContainerEnd: ɵɵelementContainerEnd,
  ng_ɵɵelementContainerStart: ɵɵelementContainerStart,
  ng_ɵɵgetCurrentView: ɵɵgetCurrentView,
  ng_ɵɵelement: ɵɵelement,
  ng_ɵɵelementContainer: ɵɵelementContainer,
  ng_ɵɵtemplateRefExtractor: ɵɵtemplateRefExtractor,
  ng_ɵɵrestoreView: ɵɵrestoreView,
  ng_ɵɵnextContext: ɵɵnextContext,
  ng_ɵɵreference: ɵɵreference,
  ng_ɵɵattribute: ɵɵattribute,
  ng_ɵɵattributeInterpolate1: ɵɵattributeInterpolate1,
  ng_ɵɵattributeInterpolate2: ɵɵattributeInterpolate2,
  ng_ɵɵattributeInterpolate3: ɵɵattributeInterpolate3,
  ng_ɵɵattributeInterpolate4: ɵɵattributeInterpolate4,
  ng_ɵɵattributeInterpolate5: ɵɵattributeInterpolate5,
  ng_ɵɵattributeInterpolate6: ɵɵattributeInterpolate6,
  ng_ɵɵattributeInterpolate7: ɵɵattributeInterpolate7,
  ng_ɵɵattributeInterpolate8: ɵɵattributeInterpolate8,
  ng_ɵɵattributeInterpolateV: ɵɵattributeInterpolateV,
  ng_ɵɵclassMap: ɵɵclassMap,
  ng_ɵɵclassMapInterpolate1: ɵɵclassMapInterpolate1,
  ng_ɵɵclassMapInterpolate2: ɵɵclassMapInterpolate2,
  ng_ɵɵclassMapInterpolate3: ɵɵclassMapInterpolate3,
  ng_ɵɵclassMapInterpolate4: ɵɵclassMapInterpolate4,
  ng_ɵɵclassMapInterpolate5: ɵɵclassMapInterpolate5,
  ng_ɵɵclassMapInterpolate6: ɵɵclassMapInterpolate6,
  ng_ɵɵclassMapInterpolate7: ɵɵclassMapInterpolate7,
  ng_ɵɵclassMapInterpolate8: ɵɵclassMapInterpolate8,
  ng_ɵɵclassMapInterpolateV: ɵɵclassMapInterpolateV,
  ng_ɵɵproperty: ɵɵproperty,
  ng_ɵɵpropertyInterpolate: ɵɵpropertyInterpolate,
  ng_ɵɵpropertyInterpolate1: ɵɵpropertyInterpolate1,
  ng_ɵɵpropertyInterpolate2: ɵɵpropertyInterpolate2,
  ng_ɵɵpropertyInterpolate3: ɵɵpropertyInterpolate3,
  ng_ɵɵpropertyInterpolate4: ɵɵpropertyInterpolate4,
  ng_ɵɵpropertyInterpolate5: ɵɵpropertyInterpolate5,
  ng_ɵɵpropertyInterpolate6: ɵɵpropertyInterpolate6,
  ng_ɵɵpropertyInterpolate7: ɵɵpropertyInterpolate7,
  ng_ɵɵpropertyInterpolate8: ɵɵpropertyInterpolate8,
  ng_ɵɵpropertyInterpolateV: ɵɵpropertyInterpolateV,
  ng_ɵɵstyleProp: ɵɵstyleProp,
  ng_ɵɵstylePropInterpolate1: ɵɵstylePropInterpolate1,
  ng_ɵɵstylePropInterpolate2: ɵɵstylePropInterpolate2,
  ng_ɵɵstylePropInterpolate3: ɵɵstylePropInterpolate3,
  ng_ɵɵstylePropInterpolate4: ɵɵstylePropInterpolate4,
  ng_ɵɵstylePropInterpolate5: ɵɵstylePropInterpolate5,
  ng_ɵɵstylePropInterpolate6: ɵɵstylePropInterpolate6,
  ng_ɵɵstylePropInterpolate7: ɵɵstylePropInterpolate7,
  ng_ɵɵstylePropInterpolate8: ɵɵstylePropInterpolate8,
  ng_ɵɵstylePropInterpolateV: ɵɵstylePropInterpolateV,
  ng_ɵɵtextInterpolate: ɵɵtextInterpolate,
  ng_ɵɵtextInterpolate1: ɵɵtextInterpolate1,
  ng_ɵɵtextInterpolate2: ɵɵtextInterpolate2,
  ng_ɵɵtextInterpolate3: ɵɵtextInterpolate3,
  ng_ɵɵtextInterpolate4: ɵɵtextInterpolate4,
  ng_ɵɵtextInterpolate5: ɵɵtextInterpolate5,
  ng_ɵɵtextInterpolate6: ɵɵtextInterpolate6,
  ng_ɵɵtextInterpolate7: ɵɵtextInterpolate7,
  ng_ɵɵtextInterpolate8: ɵɵtextInterpolate8,
  ng_ɵɵtextInterpolateV: ɵɵtextInterpolateV,
  ng_ɵɵpipe: ɵɵpipe,
  ng_ɵɵpipeBind1: ɵɵpipeBind1,
  ng_ɵɵpipeBind2: ɵɵpipeBind2,
  ng_ɵɵpipeBind3: ɵɵpipeBind3,
  ng_ɵɵpipeBind4: ɵɵpipeBind4,
  ng_ɵɵpipeBindV: ɵɵpipeBindV,
  ng_ɵɵNgOnChangesFeature: ɵɵNgOnChangesFeature,
  ng_ɵɵstyleSanitizer: ɵɵstyleSanitizer,
  ng_ɵɵdefaultStyleSanitizer: ɵɵdefaultStyleSanitizer,
  ng_ɵɵstyleMap: ɵɵstyleMap,
  ng_ɵɵclassProp: ɵɵclassProp,
  ng_ɵɵprojectionDef: ɵɵprojectionDef,
  ng_ɵɵprojection: ɵɵprojection,

  ng_HttpClient: HttpClient,
  ng_Injector: Injector,
  ng_EventEmitter: EventEmitter,
  ng_RouterModule: RouterModule,
  ng_NgIf: NgIf,
  ng_NgForOf: NgForOf,
  ng_NgClass: NgClass,
  ng_NgStyle: NgStyle,
  ng_DefaultValueAccessor: DefaultValueAccessor,
  ng_NgControlStatus: NgControlStatus,
  ng_NgModel: NgModel,
  ng_SlicePipe: SlicePipe,
  ng_TitleCasePipe: TitleCasePipe,
  ng_LowerCasePipe: LowerCasePipe,
  ng_APP_BASE_HREF: APP_BASE_HREF,
  ng_ElementRef: ElementRef,
  ng_JsonPipe: JsonPipe
};
