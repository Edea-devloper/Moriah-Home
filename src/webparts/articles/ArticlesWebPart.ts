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

import * as strings from 'ArticlesWebPartStrings';
import Articles from './components/Articles';
import { IArticlesProps } from './components/IArticlesProps';

export interface IArticlesWebPartProps {
  title: string;
  listId: string;
  listUrl: string;
  seeAllTitle: string;
  height: number;
  imageHeight: number;
  imageRatio: number;
  titleLength: number;
  descriptionLength: number;
  count: number;
}

export default class ArticlesWebPart extends BaseClientSideWebPart<IArticlesWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IArticlesProps> = React.createElement(
      Articles,
      {
        title: this.properties.title,
        listId: this.properties.listId,
        listUrl: this.properties.listUrl,
        seeAllTitle: this.properties.seeAllTitle,
        height: this.properties.height,
        imageHeight: this.properties.imageHeight,
        imageWidth: this.properties.imageHeight* this.properties.imageRatio,
        titleLength: this.properties.titleLength,
        descriptionLength: this.properties.descriptionLength,
        count: this.properties.count,
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
                  label: 'Select a library',
                  selectedList: this.properties.listId,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  baseTemplate: 119,
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
                PropertyPaneSlider('titleLength', {
                  label: 'Title Length (If selected minimum it will automatically count length. Needed refresh to make effect changes)',
                  min: 10,
                  max: 249,
                  step: 1,
                  showValue: true,
                }),
                PropertyPaneSlider('descriptionLength', {
                  label: 'Description Length (If selected minimum it will automatically count length. Needed refresh to make effect changes)',
                  min: 10,
                  max: 249,
                  step: 1,
                  showValue: true,
                }),
                PropertyPaneSlider('imageHeight', {
                  label: 'Image Height',
                  min: 20,
                  max: 500,
                  step: 1,
                  showValue: true,
                }),
                PropertyPaneSlider('imageRatio', {
                  label: 'Image Ratio',
                  min: 0.8,
                  max: 2,
                  step: 0.01,
                  showValue: true
                }),
                PropertyPaneSlider('count', {
                  label: 'Articles to display',
                  min: 1,
                  max: 50,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneTextField('listUrl', {
                  label: 'See All URL (no link if empty)'
                }),
                PropertyPaneTextField('seeAllTitle', {
                  label: 'See All Title'
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
