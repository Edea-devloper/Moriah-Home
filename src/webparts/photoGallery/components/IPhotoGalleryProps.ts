import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface IPhotoGalleryProps {
  listId: string;
  title: string;
  galleryUrl: string;
  height:number;
  width:number;
  autoplaySpeed:number;
  speed:number;
  slidesToShow:number;
  context: WebPartContext;
  autoPlay: boolean;
}
