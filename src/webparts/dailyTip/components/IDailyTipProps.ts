import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IDailyTipProps {
  listId: string;
  title: string;
  height:number;
  context: WebPartContext;
}
