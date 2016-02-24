import 'es6-shim';
import 'es6-promise';
import 'reflect-metadata';

// install zone.js without browser patches
(global => {
  let doc = global.document;
  global.document = undefined;
  global.HTMLElement = function() {};
  global.Zone = require('zone.js');
  delete global.HTMLElement;
  global.document = doc;
})(global);

import {
    platform,
    ComponentRef,
    ExceptionHandler,
    Renderer,
    RootRenderer,
    APPLICATION_COMMON_PROVIDERS,
    PLATFORM_COMMON_PROVIDERS,
    provide,
    Provider
} from 'angular2/core';
import {COMPILER_PROVIDERS} from 'angular2/compiler';
import {XHR} from 'angular2/src/compiler/xhr';

import {XHRShim} from './xhr-shim';
import {CustomDomAdapter} from './custom-dom-adapter';
import {CustomRenderer, CustomRootRenderer} from './custom-renderer';

export * from 'angular2/core';

export function customBootstrap(appComponentType: any, customProviders: Provider[] = null): Promise<ComponentRef> {

  CustomDomAdapter.makeCurrent();

  let logger = {
    logGroup: () => {
      console.log('---');
    },
    logError: (error) => {
      console.error(error);
    },
    logGroupEnd: () => {
      console.log('---');
    }
  };
  let platformProviders = [
    PLATFORM_COMMON_PROVIDERS,
    provide(XHR, {useClass: XHRShim}),
    provide(ExceptionHandler, {useFactory: () => new ExceptionHandler(logger, true), deps: []})
  ];

  let appProviders = [
    APPLICATION_COMMON_PROVIDERS,
    COMPILER_PROVIDERS,
    CustomRootRenderer,
    provide(RootRenderer, {useClass: CustomRootRenderer}),
    CustomRenderer,
    provide(Renderer, {useClass: CustomRenderer})
  ];
  if (customProviders) {
      appProviders.push(customProviders);
  }

  return platform(platformProviders).application(appProviders).bootstrap(appComponentType);
}
