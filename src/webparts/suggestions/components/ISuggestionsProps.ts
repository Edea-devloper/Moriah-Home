import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ISuggestionsProps {
  listId: string;
  title: string;
  buttonLabel: string;
  description: string;
  height:number;
  context: WebPartContext;
}
