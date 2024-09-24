// frontend/src/lib/TipTapEditor/CommentDecorationPlugin.ts
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { get } from 'svelte/store';
import type { Writable } from 'svelte/store';

export function createCommentDecorationPlugin(selectedCommentIdStore: Writable<string | null>) {
  const pluginKey = new PluginKey('commentDecorations');

  return new Plugin({
    key: pluginKey,
    state: {
      init(_, { doc }) {
        return DecorationSet.empty;
      },
      apply(tr, oldDecorationSet, oldState, newState) {
        const decorations = getCommentDecorations(newState.doc, get(selectedCommentIdStore));
        return DecorationSet.create(newState.doc, decorations);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}

function getCommentDecorations(doc: ProseMirrorNode, selectedCommentId: string | null) {
  const decorations: Decoration[] = [];
  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.isText) {
      const marks = node.marks;
      const commentMark = marks.find((mark) => mark.type.name === 'comment');
      if (commentMark) {
        const commentId = commentMark.attrs.commentId;
        const className =
          commentId === selectedCommentId ? 'comment-mark selected' : 'comment-mark';
        decorations.push(Decoration.inline(pos, pos + node.nodeSize, { class: className }));
      }
    }
  });
  return decorations;
}
