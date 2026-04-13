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

import * as strings from 'SuggestionsWebPartStrings';
import Suggestions from './components/Suggestions';
import { ISuggestionsProps } from './components/ISuggestionsProps';

export interface ISuggestionsWebPartProps {
  title: string;
  description: string;
  buttonLabel: string;
  listId: string;
  height: number;
}

export default class SuggestionsWebPart extends BaseClientSideWebPart<ISuggestionsWebPartProps> {
  public render(): void {
    const element: React.ReactElement<ISuggestionsProps> = React.createElement(
      Suggestions,
      {
        title: this.properties.title,
        description: this.properties.description,
        buttonLabel: this.properties.buttonLabel,
        listId: this.properties.listId,
        height: this.properties.height,
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
                PropertyPaneTextField('description', {
                  label: 'Body Text'
                }),
                PropertyPaneTextField('buttonLabel', {
                  label: 'Button Text'
                }),
                PropertyPaneSlider('height', {
                  label: 'Min Height',
                  min: 40,
                  max: 400,
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
