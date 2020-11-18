import { App, ButtonComponent, DropdownComponent, Modal } from 'obsidian';

export class OpenRandomTaggedNoteModal extends Modal {
    tags: string[];
    selectedTag = '';
    firstKeyUpHandled = false;
    submitCallback: (() => Promise<void>) | undefined = undefined;

    constructor(app: App, tags: string[]) {
        super(app);
        this.tags = tags;
        this.selectedTag = tags[0];
    }

    onOpen = (): void => {
        this.contentEl.createEl('h3', { text: 'Select Tag' });

        const tagDropdown = new DropdownComponent(this.contentEl).onChange((value) => (this.selectedTag = value));

        for (const tag of this.tags) {
            tagDropdown.addOption(tag, tag);
        }

        tagDropdown.setValue(this.selectedTag);

        new ButtonComponent(this.contentEl).setButtonText('Submit').setCta().onClick(this.submit);

        document.addEventListener('keyup', this.handleKeyUp);
    };

    handleKeyUp = (event: KeyboardEvent): void => {
        if (this.firstKeyUpHandled && event.key == 'Enter') {
            this.submit();
        }
        this.firstKeyUpHandled = true;
    };

    submit = async (): Promise<void> => {
        if (this.submitCallback) {
            await this.submitCallback();
        }
        this.close();
    };

    onClose = (): void => {
        document.removeEventListener('keyup', this.handleKeyUp);
    };
}
