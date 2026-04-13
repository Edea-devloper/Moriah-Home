import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface INewsProps {
  listId: string;
  title: string;
  height:number;
  animationDuration:number;
  context: WebPartContext;
}
