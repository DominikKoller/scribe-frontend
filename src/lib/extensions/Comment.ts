// frontend/src/lib/extensions/Comment.ts

import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface CommentOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            /**
             * Adds a comment mark to the selected text.
             */
            addComment: (commentId: string) => ReturnType;
            /**
             * Removes comment marks by commentId.
             */
            removeComment: (commentId: string) => ReturnType;
        };
    }
}

declare module '@tiptap/core' {
    interface EditorEvents {
        'comment:select': string;
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
                getAttrs: (dom) => ({
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
            addComment:
                (commentId) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { commentId });
                    },
            removeComment:
                (commentId) =>
                    ({ state, dispatch }) => {
                        const { tr } = state;
                        const markType = state.schema.marks.comment;
                        const { doc } = state;
                        const matches: { from: number; to: number }[] = [];

                        doc.nodesBetween(0, doc.content.size, (node, pos) => {
                            if (node.isText) {
                                node.marks.forEach((mark) => {
                                    if (mark.type === markType && mark.attrs.commentId === commentId) {
                                        matches.push({ from: pos, to: pos + node.nodeSize });
                                    }
                                });
                            }
                        });

                        matches.forEach(({ from, to }) => {
                            tr.removeMark(from, to, markType.create({ commentId }));
                        });

                        if (dispatch) {
                            dispatch(tr);
                        }
                        return true;
                    },
        };
    },

    addProseMirrorPlugins() {
        const pluginKey = new PluginKey('commentClickHandler');

        return [
            new Plugin({
                key: pluginKey,
                props: {
                    handleClickOn: (view, pos, node, nodePos, event, direct) => {
                        const { state } = view;
                        const $pos = state.doc.resolve(pos);
                        const marks = $pos.marks();
                        const commentMark = marks.find((mark) => mark.type.name === 'comment');
                        if (commentMark) {
                            const commentId: string = commentMark.attrs.commentId;
                            // Emit an event
                            this.editor.emit('comment:select', commentId);
                            return true;
                        }
                        return false;
                    },
                },
            }),
        ];
    },
});
