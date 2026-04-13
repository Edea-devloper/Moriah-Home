import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'UsefulLinksOneLineWebPartStrings';
import UsefulLinksOneLine from './components/UsefulLinksOneLine';
import { IUsefulLinksOneLineProps } from './components/IUsefulLinksOneLineProps';

export interface IUsefulLinksOneLineWebPartProps {
  title: string;
  listId: string;
  height: number;
  autoplaySpeed: number;
  speed: number;
  slidesToShow: number;
  autoPlay: boolean;
  disableOrderCaching: boolean;
  imageHeight: number;

}

export default class UsefulLinksOneLineWebPart extends BaseClientSideWebPart<IUsefulLinksOneLineWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IUsefulLinksOneLineProps> = React.createElement(
      UsefulLinksOneLine,
      {
        title: this.properties.title,
        listId: this.properties.listId,
        height: this.properties.height,
        autoplaySpeed: this.properties.autoplaySpeed,
        slidesToShow: this.properties.slidesToShow,
        speed: this.properties.speed,
        disableOrderCaching: this.properties.disableOrderCaching,
        autoPlay: this.properties.autoPlay,
        context: this.context,
        imageHeight: this.properties.imageHeight,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // protected onInit(): Promise<void> {
  //   return this._getEnvironmentMessage().then(message => {
  //     this._environmentMessage = message;
  //   });
  // }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName:  'General settings',
              groupFields: [
                PropertyFieldListPicker('listId', {
                  label: 'Select a list',
                  selectedList: this.properties.listId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  baseTemplate: 100,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),
                PropertyPaneTextField('title', {
                  label: 'Title'
                }),
                // PropertyFieldNumber("height", {
                //   key: "height",
                //   label: "The height of the web part",
                //   description: "Number value only",
                //   value: this.properties.height,
                //   maxValue: 160,
                //   minValue: 118,
                //   disabled: false
                // }),
                PropertyPaneSlider('imageHeight', {
                  label: 'Link Height',
                  min: 50,
                  max: 200,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('height', {
                  label: 'The height of the web part',
                  min: 118,
                  max: 160,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneToggle("autoPlay", {
                  label: "Auto Play",
                  checked: false,
                }),
                PropertyPaneSlider('speed', {
                  label: 'Speed',
                  min: 400,
                  max: 5000,
                  step: 100,
                  showValue: true
              }),
                PropertyPaneSlider('autoplaySpeed', {
                  label: 'Autoplay Speed',
                  min: 2000,
                  max: 10000,
                  step: 500,
                  showValue: true
              }),
                PropertyPaneSlider('slidesToShow', {
                  label: 'Slides To Show',
                  min: 3,
                  max: 10,
                  step: 1,
                  showValue: true
              }),
               PropertyPaneToggle("disableOrderCaching", {
                label: "Disable User Preferences Caching",
                checked: false,
              }),
              
              ]
            }
          ]
        }
      ]
    };
  }
}
