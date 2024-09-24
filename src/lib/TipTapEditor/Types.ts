// frontend/src/lib/TipTapEditor/Types.ts
export interface CommentType {
    id: string;
    text: string;
    author: string;
    timestamp: number;
    pending?: boolean;
  }