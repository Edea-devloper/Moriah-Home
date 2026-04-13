import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyFieldList, PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'UpcomingEventsWebPartStrings';
import UpcomingEvents from './components/UpcomingEvents';
import { IUpcomingEventsProps } from './components/IUpcomingEventsProps';

export interface IUpcomingEventsWebPartProps {
  title: string;
  list: IPropertyFieldList ;
  height: number;
  top: number;  
  descriptionLength: number;  
  seeAllTitle: string;
}

export default class UpcomingEventsWebPart extends BaseClientSideWebPart<IUpcomingEventsWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IUpcomingEventsProps> = React.createElement(
      UpcomingEvents,
      {
        title: this.properties.title,
        listId: this.properties.list?.id || '',
        top: this.properties.top||3,
        // height: this.properties.height || 300,
        listUrl: this.properties.list?.url || '',
        descriptionLength: this.properties.descriptionLength,
        seeAllTitle: this.properties.seeAllTitle || "לכל האירועים",
        context: this.context,
        height: this.properties.height,
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
              groupName:  'General settings',
              groupFields: [
                PropertyFieldListPicker('list', {
                  label: 'Select a list',
                  selectedList: this.properties.list,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  baseTemplate: 106,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  includeListTitleAndUrl:true,
                  key: 'listPickerFieldId'
                }),
                PropertyPaneTextField('title', {
                  label: 'Title'
                }),
                // PropertyPaneSlider('height', {
                //   label: 'Height',
                //   min: 20,
                //   max: 1000,
                //   step: 1,
                //   showValue: true
                // }),
                PropertyPaneSlider('top', {
                  label: 'Number to display',
                  min: 1,
                  max: 10,
                  step: 1,
                  showValue: true
                }),   
                PropertyPaneTextField('seeAllTitle', {
                  label: 'See All Label'
                }),
                PropertyPaneSlider('descriptionLength', {
                  label: 'Description length',
                  min: 16,
                  max: 1000,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('height', {
                  label: 'Min Height',
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
