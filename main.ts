import { App, ButtonComponent, DropdownComponent, Modal, Notice, Plugin, TFile, View } from 'obsidian';

interface ResultDOM {
    file: TFile;
}

interface SearchDOM {
    resultDoms: ResultDOM[];
}

interface SearchView extends View {
    dom: SearchDOM;
}

export default class SmartRandomNotePlugin extends Plugin {
    async onload(): Promise<void> {
        console.log('loading smart-random-note');

        this.addCommand({
            id: 'open-random-note',
            name: 'Open Random Note',
            callback: this.openRandomNote,
        });

        this.addCommand({
            id: 'open-tagged-random-note',
            name: 'Open Tagged Random Note',
            callback: this.openTaggedRandomNote,
        });

        this.addCommand({
            id: 'open-random-note-from-search',
            name: 'Open Random Note From Search',
            callback: this.openRandomNoteFromSearch,
        });
    }

    onunload = (): void => {
        console.log('unloading smart-random-note');
    };

    openRandomNote = async (): Promise<void> => {
        const markdownFiles = this.app.vault.getMarkdownFiles();

        const filePaths = markdownFiles.map((x) => x.path);
        const filePathToOpen = randomElement(filePaths);
        await this.app.workspace.openLinkText(filePathToOpen, '', true, { active: true });
    };

    openTaggedRandomNote = (): void => {
        const tagFilesMap = getTagFilesMap(this.app);

        const tags = Object.keys(tagFilesMap);
        const modal = new SmartRandomNoteModal(this.app, tags);

        modal.submitCallback = async (): Promise<void> => {
            const taggedFiles = tagFilesMap[modal.selectedTag];
            const fileNameToOpen = randomElement(taggedFiles);
            await this.app.workspace.openLinkText(fileNameToOpen, '', true, { active: true });
        };

        modal.open();
    };

    openRandomNoteFromSearch = async (): Promise<void> => {
        const searchView = this.app.workspace.getLeavesOfType('search')[0]?.view as SearchView;

        if (!searchView) {
            new Notice('The search plugin is not enabled', 5000);
            return;
        }

        const searchResults = searchView.dom.resultDoms.map((x) => x.file.basename);

        if (!searchResults.length) {
            new Notice('No search results available', 5000);
            return;
        }

        const fileNameToOpen = randomElement(searchResults);
        await this.app.workspace.openLinkText(fileNameToOpen, '', true, { active: true });
    };
}

type TagFilesMap = { [tag: string]: string[] };

function getTagFilesMap(app: App): TagFilesMap {
    const metadataCache = app.metadataCache;
    const markdownFiles = app.vault.getMarkdownFiles();

    const tagFilesMap: TagFilesMap = {};

    for (const markdownFile of markdownFiles) {
        const cachedMetadata = metadataCache.getFileCache(markdownFile);

        if (cachedMetadata && cachedMetadata.tags) {
            for (const cachedTag of cachedMetadata.tags) {
                if (tagFilesMap[cachedTag.tag]) {
                    tagFilesMap[cachedTag.tag].push(markdownFile.path);
                } else {
                    tagFilesMap[cachedTag.tag] = [markdownFile.path];
                }
            }
        }
    }

    return tagFilesMap;
}

function randomElement<T>(array: T[]): T {
    return array[(array.length * Math.random()) << 0];
}

class SmartRandomNoteModal extends Modal {
    tags: string[];
    selectedTag = '';
    firstKeyUpHandled = false;
    submitCallback: (() => Promise<void>) | undefined = undefined;

    constructor(app: App, tags: string[]) {
        super(app);
        this.tags = tags;
        this.selectedTag = tags[0];
    }

    onOpen = () => {
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
