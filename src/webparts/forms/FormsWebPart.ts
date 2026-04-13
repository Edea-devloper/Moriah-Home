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

import * as strings from 'FormsWebPartStrings';
import Forms from './components/Forms';
import { IFormsProps } from './components/IFormsProps';

export interface IFormsWebPartProps {
  title: string;
  listId: string;
  disableOrderCaching: boolean;
  height: number;
}

export default class FormsWebPart extends BaseClientSideWebPart<IFormsWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IFormsProps> = React.createElement(
      Forms,
      {
        title: this.properties.title,
        listId: this.properties.listId,
        height: this.properties.height,
        context: this.context,
        disableOrderCaching: this.properties.disableOrderCaching,
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
                  max: 1000,
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
