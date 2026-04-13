import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IFormsProps {
  listId: string;
  title: string;
  height:number;
  disableOrderCaching: boolean;
  context: WebPartContext;
}
