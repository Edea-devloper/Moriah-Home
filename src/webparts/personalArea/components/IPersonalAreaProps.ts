import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IPersonalAreaProps {
  title: string;
  formSettingsListId: string;
  vacationListId: string;
  width: number;
  formsNumber: number;
  context: WebPartContext;
}
