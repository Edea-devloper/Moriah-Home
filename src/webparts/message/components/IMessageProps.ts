import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IMessageProps {
  listId: string;
  height:number;
  borderRadius:number;
  context: WebPartContext;
}
