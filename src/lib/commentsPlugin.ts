// /src/lib/commentsPlugin.ts

import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { type Node as PNode } from 'prosemirror-model';

interface Comment {
  id: string;
  from: number;
  to: number;
  text: string;
}

class CommentState {
  comments: Comment[];

  constructor(comments: Comment[]) {
    this.comments = comments;
  }

  apply(tr: Transaction) {
    let action = tr.getMeta(commentsPluginKey);
    let comments = this.comments.slice();

    if (action?.type === 'add') {
      comments.push(action.comment);
    } else if (action?.type === 'delete') {
      comments = comments.filter((c) => c.id !== action.id);
    }

    // Map comment positions
    comments = comments.map((comment) => ({
      ...comment,
      from: tr.mapping.map(comment.from),
      to: tr.mapping.map(comment.to),
    }));

    return new CommentState(comments);
  }

  get decorations() {
    return (doc: PNode) => {
      const decorations = this.comments.map((comment) =>
        Decoration.inline(comment.from, comment.to, { class: 'comment' }),
      );
      return DecorationSet.create(doc, decorations);
    };
  }
}

export const commentsPluginKey = new PluginKey('comments');

export const createCommentsPlugin = (initialComments: Comment[] = []) =>
  new Plugin({
    key: commentsPluginKey,
    state: {
      init() {
        return new CommentState(initialComments);
      },
      apply(tr, pluginState) {
        return pluginState.apply(tr);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decorations(state.doc);
      },
    },
  });
