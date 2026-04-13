import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneSlider } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'MessageWebPartStrings';
import Message from './components/Message';
import { IMessageProps } from './components/IMessageProps';

export interface IMessageWebPartProps {
  listId: string;
  height: number;
  borderRadius: number;
}

export default class MessageWebPart extends BaseClientSideWebPart<IMessageWebPartProps> {


  public render(): void {
    const element: React.ReactElement<IMessageProps> = React.createElement(
      Message,
      {
        listId: this.properties.listId,
        height: this.properties.height,
        borderRadius: this.properties.borderRadius,
        context: this.context,
      }
    );

    ReactDom.render(element, this.domElement);
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
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldListPicker('listId', {
                  label: 'Select a List',
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
                PropertyPaneSlider('height', {
                  label: 'Message Height',
                  min: 160,
                  max: 1000,
                  step: 1,
                  showValue: true
              }),
                PropertyPaneSlider('borderRadius', {
                  label: 'Image Border Radius',
                  min: 0,
                  max: 500,
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
