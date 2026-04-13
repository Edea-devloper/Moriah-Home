import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ILinksSliderProps {
  listId: string;
  title: string;
  height:number;
  autoplaySpeed:number;
  speed:number;
  slidesToShow:number;
  autoPlay: boolean;
  disableOrderCaching: boolean;
  context: WebPartContext;
}
