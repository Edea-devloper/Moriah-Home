import { Log } from '@microsoft/sp-core-library';
import * as ReactDom from 'react-dom';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
// import { Dialog } from '@microsoft/sp-dialog';
import * as strings from 'HomeNavigationApplicationCustomizerStrings';
import styles from './components/Navigation.module.scss';
import * as React from 'react';
import { Navigation } from './components/Navigation';

const LOG_SOURCE: string = 'HomeNavigationApplicationCustomizer';
export interface IHomeNavigationApplicationCustomizerProperties {
  testMessage: string;
}

export default class HomeNavigationApplicationCustomizer
  extends BaseApplicationCustomizer<IHomeNavigationApplicationCustomizerProperties> {
  private _topPlaceholder?: PlaceholderContent;
  private _addClass (targetSelector: string, className: string):void {
    const elements = document.querySelectorAll(targetSelector);
    for (let i = 0, total = elements.length; i < total; i++) {
        const element = elements[i];
        if (element && element.className.toString().indexOf(className) < 0)
          element.className += ' ' + className;
    }
  }

  public onInit(): Promise<void> {
    // this._addClass("[class*=hiddenAppTile]", styles.OfekPointHidden);//! Test again if need
    this._addClass("div[data-automationid=SiteHeader]", styles.OfekPointHidden);
    this._addClass('div[data-bind="component:topBarComponent"]', styles.OfekPointHidden);
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    document.getElementById('favicon').setAttribute('href', require('../../assets/favicon.svg'));
    this.context.placeholderProvider.changedEvent.add(this, ()=>this._handlePlaceholderChange());
    // context.application.navigatedEvent.add(this,  this._checkNavigationMenu);
    return Promise.resolve();
  }

  private _handlePlaceholderChange():void{
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {onDispose: this._onDispose});
    } 
    else {
      const index:number = this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top);
      if (index < 0) {          
          this._topPlaceholder.dispose();
          this._topPlaceholder = undefined;
      }
    }
    if (this._topPlaceholder) {
      const element: React.ReactElement = React.createElement(Navigation,{context: this.context});
      ReactDom.render(element, this._topPlaceholder.domElement);
    }
  }
  
  private _onDispose(placeholderContent: PlaceholderContent): void {
    ReactDom.unmountComponentAtNode(placeholderContent.domElement);
  }
}
