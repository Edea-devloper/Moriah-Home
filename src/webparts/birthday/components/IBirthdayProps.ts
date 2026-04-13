import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBirthdayProps {
  birthdayTitle: string;
  eventsTitle: string;
  // birthdayListId: string;
  eventsListId: string;
  upcomingPersonListId:string;
  height:number;
  context: WebPartContext;
}
