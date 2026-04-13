import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface IPeopleSearchProps {
  title: string;
  cachingHours: number;
  context: WebPartContext;
}
