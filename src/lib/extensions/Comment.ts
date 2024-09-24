// frontend/src/lib/extensions/Comment.ts

import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Adds a comment mark to the selected text.
       */
      addComment: (commentId: string) => ReturnType,
      /**
       * Removes comment marks by commentId.
       */
      removeComment: (commentId: string) => ReturnType,
    }
  }
}

export const Comment = Mark.create<CommentOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
        getAttrs: dom => ({
          commentId: (dom as HTMLElement).getAttribute('data-comment-id'),
        }),
      },
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-comment-id': mark.attrs.commentId,
        class: 'comment-mark',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      addComment: commentId => ({ commands }) => {
        return commands.setMark(this.name, { commentId });
      },
      removeComment: commentId => ({ state, dispatch }) => {
        const { tr } = state;
        const { from, to } = state.selection;
        tr.removeMark(from, to, state.schema.marks.comment);
        if (dispatch) {
            dispatch(tr);
        }
        return true;
      },
    };
  },
});
