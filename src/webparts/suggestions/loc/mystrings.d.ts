declare interface ISuggestionsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  Title: string;
  Description: string;
  PopUpTitle: string;
  UploadFile: string;
  Submit: string;
  InfoTitle: string;
  NoEmpty: string;
  Ok: string;
  SentTitle: string;
  SentMessage: string;
}

declare module 'SuggestionsWebPartStrings' {
  const strings: ISuggestionsWebPartStrings;
  export = strings;
}
