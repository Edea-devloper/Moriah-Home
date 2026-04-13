import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IArticlesProps {
  listId: string;
  title: string;
  listUrl: string;
  seeAllTitle: string;
  height:number;
  count:number;
  imageHeight:number;
  imageWidth:number;
  titleLength:number;
  descriptionLength:number;
  context: WebPartContext;
}
