import { App, Modal } from 'obsidian';
import OpenRandomTaggedNoteModalView from './OpenRandomTaggedNoteModalView.svelte';

export class OpenRandomTaggedNoteModal extends Modal {
    view: OpenRandomTaggedNoteModalView;
    tags: string[];
    submitCallback: ((selectedTag: string) => Promise<void>) | undefined = undefined;

    constructor(app: App, tags: string[], lastSelectedTag?: string) {
        super(app);
        this.tags = tags;
        this.view = new OpenRandomTaggedNoteModalView({
            target: this.contentEl,
            props: { tags, initialSelectedTag: lastSelectedTag, handleSubmit: this.handleSubmit },
        });
    }

    handleSubmit = (tag: string): void => {
        if (this.submitCallback) {
            this.submitCallback(tag);
        }
        this.close();
    };
}
