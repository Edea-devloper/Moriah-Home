import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface INewsSliderProps {
  listId: string;
  autoPlay: boolean;
  imageRatio:number;
  autoplaySpeed:number;
  speed:number;
  context: WebPartContext;
  autoPlayVideo: boolean;
  VideoMuted: boolean;
}
