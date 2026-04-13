import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IUsefulLinksProps {
  listId: string;
  title: string;
  height:number;
  imageHeight:number;
  margin:number;
  context: WebPartContext;
  disableOrderCaching: boolean;
}
