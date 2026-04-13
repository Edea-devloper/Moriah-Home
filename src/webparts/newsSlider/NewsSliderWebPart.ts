import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'NewsSliderWebPartStrings';
import NewsSlider from './components/NewsSlider';
import { INewsSliderProps } from './components/INewsSliderProps';

export interface INewsSliderWebPartProps {
  listId: string;
  autoplaySpeed: number;
  speed: number;
  imageRatio: number;
  autoPlay: boolean;
  autoPlayVideo: boolean;
  VideoMuted: boolean;
}

export default class NewsSliderWebPart extends BaseClientSideWebPart<INewsSliderWebPartProps> {
  public render(): void {
    const element: React.ReactElement<INewsSliderProps> = React.createElement(
      NewsSlider,
      {
        listId: this.properties.listId,
        imageRatio: this.properties.imageRatio,
        autoPlay: this.properties.autoPlay,
        autoplaySpeed: this.properties.autoplaySpeed,
        speed: this.properties.speed,
        autoPlayVideo:this.properties.autoPlayVideo,
        VideoMuted:this.properties.VideoMuted,
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
                  baseTemplate: 101,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),   
                PropertyPaneSlider('imageRatio', {
                  label: 'Image aspect ratio %',
                  min: 30,
                  max: 130,
                  step: 0.5,
                  value: 60
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
                PropertyPaneToggle("autoPlayVideo", {
                  label: "Auto Play Video",
                  checked: false,
                }),
                PropertyPaneToggle("VideoMuted", {
                  label: "Mute Videos",
                  checked: true,
                }),              
              ]
            }
          ]
        }
      ]
    };
  }
}
