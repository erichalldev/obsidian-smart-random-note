import { Plugin } from 'obsidian';
import { getOrphanedFiles, getTagFilesMap, randomElement } from './utilities';
import { SmartRandomNoteSettingTab } from './settingTab';
import { SearchView, SmartRandomNoteSettings } from './types';
import { SmartRandomNoteNotice } from './smartRandomNoteNotice';
import { OpenRandomTaggedNoteModal } from './openRandomTaggedNoteModal';

export default class SmartRandomNotePlugin extends Plugin {
    settings: SmartRandomNoteSettings = { openInNewLeaf: true, enableRibbonIcon: true };
    ribbonIconEl: HTMLElement | undefined = undefined;

    async onload(): Promise<void> {
        console.log('loading smart-random-note');

        await this.loadSettings();

        this.addSettingTab(new SmartRandomNoteSettingTab(this));

        this.addCommand({
            id: 'open-random-note',
            name: 'Open Random Note',
            callback: this.handleOpenRandomNote,
        });

        this.addCommand({
            id: 'open-tagged-random-note',
            name: 'Open Tagged Random Note',
            callback: this.handleOpenTaggedRandomNote,
        });

        this.addCommand({
            id: 'open-random-note-from-search',
            name: 'Open Random Note from Search',
            callback: this.handleOpenRandomNoteFromSearch,
        });

        this.addCommand({
            id: 'open-random-orphan-note',
            name: 'Open Random Orphan Note',
            callback: this.handleOpenRandomOrphanNote,
        });
    }

    onunload = (): void => {
        console.log('unloading smart-random-note');
    };

    handleOpenRandomNote = async (): Promise<void> => {
        const markdownFiles = this.app.vault.getMarkdownFiles();

        const filePaths = markdownFiles.map((x) => x.path);
        this.openRandomNote(filePaths);
    };

    handleOpenTaggedRandomNote = (): void => {
        const tagFilesMap = getTagFilesMap(this.app);

        const tags = Object.keys(tagFilesMap).sort();
        const modal = new OpenRandomTaggedNoteModal(this.app, tags, this.settings.lastSelectedTag);

        modal.submitCallback = async (selectedTag: string): Promise<void> => {
            const taggedFiles = tagFilesMap[selectedTag];
            await this.openRandomNote(taggedFiles);
            this.setLastSelectedTag(selectedTag);
        };

        modal.open();
    };

    handleOpenRandomNoteFromSearch = async (): Promise<void> => {
        const searchView = this.app.workspace.getLeavesOfType('search')[0]?.view as SearchView;

        if (!searchView) {
            new SmartRandomNoteNotice('The core search plugin is not enabled', 5000);
            return;
        }

        const searchResultPaths = searchView.dom.getFiles().map((x) => x.path);

        await this.openRandomNote(searchResultPaths);
    };

    handleOpenRandomOrphanNote = (): void => {
        const orphanedFiles = getOrphanedFiles(this.app);

        const filePaths = orphanedFiles.map((x) => x.path);
        this.openRandomNote(filePaths);
    };

    openRandomNote = async (filePaths: string[]): Promise<void> => {
        if (filePaths.length) {
            const filePathToOpen = randomElement(filePaths);
            await this.app.workspace.openLinkText(filePathToOpen, '', this.settings.openInNewLeaf, { active: true });
        } else {
            new SmartRandomNoteNotice('No files to choose from', 5000);
        }
    };

    loadSettings = async (): Promise<void> => {
        const loadedSettings = (await this.loadData()) as SmartRandomNoteSettings;
        if (loadedSettings) {
            this.setOpenInNewLeaf(loadedSettings.openInNewLeaf);
            this.setEnableRibbonIcon(loadedSettings.enableRibbonIcon);
            this.setLastSelectedTag(loadedSettings.lastSelectedTag);
        } else {
            this.refreshRibbonIcon();
        }
    };

    setOpenInNewLeaf = (value: boolean): void => {
        this.settings.openInNewLeaf = value;
        this.saveData(this.settings);
    };

    setEnableRibbonIcon = (value: boolean): void => {
        this.settings.enableRibbonIcon = value;
        this.refreshRibbonIcon();
        this.saveData(this.settings);
    };

    setLastSelectedTag = (value?: string | undefined): void => {
        this.settings.lastSelectedTag = value;
        this.saveData(this.settings);
    };

    refreshRibbonIcon = (): void => {
        this.ribbonIconEl?.remove();
        if (this.settings.enableRibbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon(
                'dice',
                'Open Random Note from Search',
                this.handleOpenRandomNoteFromSearch,
            );
        }
    };
}
