import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IUsefulLinksOneLineProps {
  listId: string;
  title: string;
  height:number;
  autoplaySpeed: number;
  speed: number;
  slidesToShow: number;
  imageHeight: number;
  autoPlay: boolean;
  disableOrderCaching: boolean;
  context: WebPartContext;
}
  

