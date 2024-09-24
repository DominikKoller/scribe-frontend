// frontend/src/lib/types.ts

  
  /** Represents the content structure of a document */
  export interface DocumentContent {
    doc: any; // ProseMirror document JSON
    comments: Comment[];
  }
  
  /** Represents the data of a document */
  export interface DocumentData {
    title: string;
    content: DocumentContent;
  }
  