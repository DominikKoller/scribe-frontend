// src/lib/schema.ts
import { Schema } from 'prosemirror-model';
import { nodes as basicNodes, marks as basicMarks } from 'prosemirror-schema-basic';
import { orderedList, bulletList, listItem } from 'prosemirror-schema-list';
import { type MarkSpec } from 'prosemirror-model';

const underline: MarkSpec = {
    parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
    toDOM() {
      return ['u', 0];
    },
  };

const nodes = {
  ...basicNodes,
  // Add list nodes
  ordered_list: orderedList,
  bullet_list: bulletList,
  list_item: listItem,
  // Optionally, add blockquote
  blockquote: basicNodes.blockquote,
  // Add support for code blocks
  code_block: basicNodes.code_block,
};

const marks = {
    ...basicMarks,
    underline,
  };
  
  export const mySchema = new Schema({
    nodes,
    marks,
  });