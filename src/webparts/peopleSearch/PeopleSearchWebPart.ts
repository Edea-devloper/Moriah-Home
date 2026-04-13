import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'PeopleSearchWebPartStrings';
import PeopleSearch from './components/PeopleSearch';
import { IPeopleSearchProps } from './components/IPeopleSearchProps';

export interface IPeopleSearchWebPartProps {
  title: string;
  cachingHours: number;
}

export default class PeopleSearchWebPart extends BaseClientSideWebPart<IPeopleSearchWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IPeopleSearchProps> = React.createElement(
      PeopleSearch,
      {
        title: this.properties.title,
        cachingHours: this.properties.cachingHours,
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
              groupName: 'Settings',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Title'
                }),
                PropertyPaneSlider('cachingHours', {
                  label: 'Caching Period (Hours)',
                  min: 0,
                  max: 72,
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
