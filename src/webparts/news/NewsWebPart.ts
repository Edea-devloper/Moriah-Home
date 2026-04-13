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

import * as strings from 'NewsWebPartStrings';
import News from './components/News';
import { INewsProps } from './components/INewsProps';

export interface INewsWebPartProps {
  title: string;
  listId: string;
  height: number;
  animationDuration: number;
}

export default class NewsWebPart extends BaseClientSideWebPart<INewsWebPartProps> {
  
  public render(): void {
    const element: React.ReactElement<INewsProps> = React.createElement(
      News,
      {
        title: this.properties.title,
        listId: this.properties.listId,
        height: this.properties.height,
        animationDuration: this.properties.animationDuration,
        context: this.context,
      }
    );
    ReactDom.render(element, this.domElement);
  }
  protected async onInit(): Promise<void> {
    await super.onInit();
  }

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
                  min: 100,
                  max: 700,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('animationDuration', {
                  label: 'Animation Duration',
                  min: 2,
                  max: 50,
                  step: 1,
                  showValue: true
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
