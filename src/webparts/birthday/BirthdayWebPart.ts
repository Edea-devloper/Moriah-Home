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

import * as strings from 'BirthdayWebPartStrings';
import Birthday from './components/Birthday';
import { IBirthdayProps } from './components/IBirthdayProps';

export interface IBirthdayWebPartProps {
  birthdayTitle: string;
  eventsTitle: string;
  // birthdayListId: string;
  eventsListId: string;
  upcomingPersonListId: string;
  height: number;
}

export default class BirthdayWebPart extends BaseClientSideWebPart<IBirthdayWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IBirthdayProps> = React.createElement(
      Birthday,
      {
        birthdayTitle: this.properties.birthdayTitle,
        eventsTitle: this.properties.eventsTitle,
        // birthdayListId: this.properties.birthdayListId,
        eventsListId: this.properties.eventsListId,
        upcomingPersonListId: this.properties.upcomingPersonListId,
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
                // PropertyFieldListPicker('birthdayListId', {
                //   label: 'Select a birthday list',
                //   selectedList: this.properties.birthdayListId,
                //   includeHidden: false,
                //   orderBy: PropertyFieldListPickerOrderBy.Title,
                //   disabled: false,
                //   onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                //   properties: this.properties,
                //   context: this.context as any,
                //   baseTemplate: 100,
                //   onGetErrorMessage: null,
                //   deferredValidationTime: 0,
                //   key: 'listPickerFieldId'
                // }),
                PropertyFieldListPicker('eventsListId', {
                  label: 'Select an event list',
                  selectedList: this.properties.eventsListId,
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
                PropertyFieldListPicker('upcomingPersonListId', {
                  label: 'Select an upcoming person list',
                  selectedList: this.properties.upcomingPersonListId,
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
                PropertyPaneTextField('birthdayTitle', {
                  label: 'Birthday Title'
                }),
                PropertyPaneTextField('eventsTitle', {
                  label: 'Events Title'
                }),
                PropertyPaneSlider('height', {
                  label: 'Height',
                  min: 100,
                  max: 1000,
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
