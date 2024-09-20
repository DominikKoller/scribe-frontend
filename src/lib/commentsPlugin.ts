// frontend/src/lib/commentsPlugin.ts

import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node as PNode } from 'prosemirror-model';
import type { Comment } from '$lib/types';

class CommentState {
  comments: Comment[];
  activeCommentId: string | null;

  constructor(comments: Comment[], activeCommentId: string | null = null) {
    this.comments = comments;
    this.activeCommentId = activeCommentId;
  }

  apply(tr: Transaction) {
    let action = tr.getMeta(commentsPluginKey);
    let comments = this.comments.slice();
    let activeCommentId = this.activeCommentId;

    if (action?.type === 'add') {
      comments.push(action.comment);
    } else if (action?.type === 'delete') {
      comments = comments.filter((c) => c.id !== action.id);
      if (activeCommentId === action.id) {
        activeCommentId = null;
      }
    } else if (action?.type === 'setActiveComment') {
      activeCommentId = action.id;
    } else if (action?.type === 'updateText') {
      comments = comments.map((comment) =>
        comment.id === action.id
          ? { ...comment, text: action.text }
          : comment
      );
    }

    // Map comment positions
    comments = comments.map((comment) => ({
      ...comment,
      from: tr.mapping.map(comment.from),
      to: tr.mapping.map(comment.to),
    }));

    return new CommentState(comments, activeCommentId);
  }

  get decorations() {
    return (doc: PNode) => {
      const decorations = this.comments.map((comment) => {
        let className = 'comment';
        if (comment.id === this.activeCommentId) {
          className += ' active-comment';
        }
        return Decoration.inline(comment.from, comment.to, { class: className, 'data-comment-id': comment.id });
      });
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
            return true; // Event handled. TODO low prio is this good, or do we want the event to bubble up?
          }
        }
        return false; // Event not handled
      },
    },
  });