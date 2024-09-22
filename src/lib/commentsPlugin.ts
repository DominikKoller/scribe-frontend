// frontend/src/lib/commentsPlugin.ts

import { Plugin, PluginKey, Transaction, EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node as PNode } from 'prosemirror-model';
import type { Comment } from '$lib/types';

class CommentState {
  activeCommentId: string | null;

  constructor(activeCommentId: string | null = null) {
    this.activeCommentId = activeCommentId;
  }

  apply(tr: Transaction) {
    let action = tr.getMeta(commentsPluginKey);
    let activeCommentId = this.activeCommentId;

    if (action?.type === 'setActiveComment') {
      activeCommentId = action.id;
    }

    return new CommentState(activeCommentId);
  }

  get decorations() {
    return (doc: PNode) => {

      const decorations: Decoration[] = [];
      doc.descendants((node, pos) => {
        if (node.isText) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'comment') {
              let className = 'comment';
              if (mark.attrs.id === this.activeCommentId) {
                className += ' active-comment';
              }
              decorations.push(
                Decoration.inline(pos, pos + node.nodeSize, {
                  class: className,
                  'data-comment-id': mark.attrs.id,
                })
              );
            }
          });
        }
      });
      return DecorationSet.create(doc, decorations);
    };
  }
}

export const commentsPluginKey = new PluginKey('comments');

export const createCommentsPlugin = () =>
  new Plugin({
    key: commentsPluginKey,
    state: {
      init() {
        return new CommentState();
      },
      apply(tr, pluginState) {
        return pluginState.apply(tr);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decorations(state.doc);
      },
      handleClickOn(view, pos, node, nodePos, event, direct) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('comment') || target.closest('.comment')) {
          const commentId = target.getAttribute('data-comment-id') || target.closest('.comment')?.getAttribute('data-comment-id');
          if (commentId) {
            const pluginState = commentsPluginKey.getState(view.state);
            if (pluginState.activeCommentId !== commentId) {
              view.dispatch(
                view.state.tr.setMeta(commentsPluginKey, {
                  type: 'setActiveComment',
                  id: commentId,
                })
              );
            }
            return true; // Event handled
          }
        } else {
          const pluginState = commentsPluginKey.getState(view.state);
          if (pluginState.activeCommentId !== null) {
            view.dispatch(
              view.state.tr.setMeta(commentsPluginKey, {
                type: 'setActiveComment',
                id: null,
              })
            );
            return true; // Event handled.
          }
        }
        return false; // Event not handled
      },
    },
  });