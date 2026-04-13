import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'DailyTipWebPartStrings';
import DailyTip from './components/DailyTip';
import { IDailyTipProps } from './components/IDailyTipProps';

export interface IDailyTipWebPartProps {
  title: string;
  listId: string;
  height: number;
}
export default class DailyTipWebPart extends BaseClientSideWebPart<IDailyTipWebPartProps> {


  public render(): void {
    const element: React.ReactElement<IDailyTipProps> = React.createElement(
      DailyTip,
      {
        title: this.properties.title,
        listId: this.properties.listId,
        height: this.properties.height,
        context: this.context,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // protected async onInit(): Promise<void> {
  //   await super.onInit();
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
                PropertyPaneSlider('height', {
                  label: 'Height',
                  min: 20,
                  max: 1000,
                  step: 1,
                  showValue: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
