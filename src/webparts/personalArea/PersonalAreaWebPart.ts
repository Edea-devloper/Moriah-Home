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

import * as strings from 'PersonalAreaWebPartStrings';
import PersonalArea from './components/PersonalArea';
import { IPersonalAreaProps } from './components/IPersonalAreaProps';

export interface IPersonalAreaWebPartProps {
  title: string;
  formSettingsListId: string;
  vacationListId: string;
  width: number;
  formsNumber: number;
}

export default class PersonalAreaWebPart extends BaseClientSideWebPart<IPersonalAreaWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IPersonalAreaProps> = React.createElement(
      PersonalArea,
      {
        context: this.context,
        title: this.properties.title,
        formSettingsListId: this.properties.formSettingsListId,
        vacationListId: this.properties.vacationListId,
        width: this.properties.width,
        formsNumber: this.properties.formsNumber,
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
                PropertyPaneTextField('title', {
                  label: 'Title'
                }),
                PropertyFieldListPicker('formSettingsListId', {
                  label: 'Select a Forms Settings list',
                  selectedList: this.properties.formSettingsListId,
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
                PropertyFieldListPicker('vacationListId', {
                  label: 'Select a vacation list',
                  selectedList: this.properties.vacationListId,
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
                PropertyPaneSlider('width', {
                  label: 'Width',
                  min: 100,
                  max: 1000,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('formsNumber', {
                  label: 'number of forms to display',
                  min: 1,
                  max: 100,
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
