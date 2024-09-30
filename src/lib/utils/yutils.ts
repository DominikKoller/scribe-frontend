import type { Writable } from 'svelte/store';
import * as Y from 'yjs';

export function connectStringStoreToYText(store: Writable<string>, ytext: Y.Text) {

    let isSyncing = false;
    ytext.observe((event) => {
        if (!isSyncing) {
            isSyncing = true;
            store.set(ytext.toString());
            isSyncing = false;
        }
    });
    store.subscribe((value) => {
        if (!isSyncing) {
            isSyncing = true;
            ytext.delete(0, ytext.length);
            ytext.insert(0, value);
            isSyncing = false;
        }
    });
}