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


import * as strings from 'UsefulLinksWebPartStrings';
import UsefulLinks from './components/UsefulLinks';
import { IUsefulLinksProps } from './components/IUsefulLinksProps';

export interface IUsefulLinksWebPartProps {
  title: string;
  listId: string;
  height: number;
  imageHeight: number;
  margin: number;
  disableOrderCaching: boolean;
}

export default class UsefulLinksWebPart extends BaseClientSideWebPart<IUsefulLinksWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IUsefulLinksProps> = React.createElement(
      UsefulLinks,
      {
        title: this.properties.title,
        listId: this.properties.listId,
        height: this.properties.height,
        imageHeight: this.properties.imageHeight,
        margin: this.properties.margin,
        disableOrderCaching: this.properties.disableOrderCaching,
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
                PropertyPaneSlider('height', {
                  label: 'Min Height',
                  min: 100,
                  max: 1000,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('imageHeight', {
                  label: 'Link Height',
                  min: 50,
                  max: 200,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('margin', {
                  label: 'Margin',
                  min: 2,
                  max: 40,
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
