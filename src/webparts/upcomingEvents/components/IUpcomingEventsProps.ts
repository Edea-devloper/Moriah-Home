import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IUpcomingEventsProps {
  listId: string;
  title: string;
  // height:number;
  descriptionLength:number;
  top:number;
  listUrl:string;
  seeAllTitle:string;
  context: WebPartContext;
  height:number;
}
