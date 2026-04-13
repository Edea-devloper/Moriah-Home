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

import * as strings from 'PhotoGalleryWebPartStrings';
import PhotoGallery from './components/PhotoGallery';
import { IPhotoGalleryProps } from './components/IPhotoGalleryProps';

export interface IPhotoGalleryWebPartProps {
  title: string;
  listId: string;
  galleryUrl: string;
  height: number;
  autoplaySpeed: number;
  speed: number;
  slidesToShow: number;
  imageRatio: number;
  autoPlay: boolean;
}

export default class PhotoGalleryWebPart extends BaseClientSideWebPart<IPhotoGalleryWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IPhotoGalleryProps> = React.createElement(
      PhotoGallery,
      {
        title: this.properties.title,
        galleryUrl: this.properties.galleryUrl,
        listId: this.properties.listId,
        height: this.properties.height,
        width: this.properties.imageRatio * this.properties.height,
        autoplaySpeed: this.properties.autoplaySpeed,
        slidesToShow: this.properties.slidesToShow,
        speed: this.properties.speed,
        autoPlay: this.properties.autoPlay,
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
              groupName:  'General settings',
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
                  // baseTemplate: 101,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),
                PropertyPaneTextField('title', {
                  label: 'Title'
                }),
                PropertyPaneTextField('galleryUrl', {
                  label: 'Gallery Url, if any'
                }),
                PropertyPaneTextField('title', {
                  label: 'Title'
                }),
                PropertyPaneSlider('height', {
                  label: 'Image Height',
                  min: 100,
                  max: 500,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneSlider('imageRatio', {
                  label: 'Image Ratio',
                  min: 0.8,
                  max: 2,
                  step: 0.01,
                  showValue: true
                }),
                PropertyPaneToggle("autoPlay", {
                  label: "Auto Play",
                  checked: false,
                }),
                PropertyPaneSlider('speed', {
                  label: 'Speed',
                  min: 400,
                  max: 5000,
                  step: 100,
                  showValue: true
                }),
                PropertyPaneSlider('autoplaySpeed', {
                  label: 'Autoplay Speed',
                  min: 2000,
                  max: 10000,
                  step: 500,
                  showValue: true
                }),
                PropertyPaneSlider('slidesToShow', {
                  label: 'Slides To Show',
                  min: 1,
                  max: 10,
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
