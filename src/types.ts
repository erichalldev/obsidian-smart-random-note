import { TFile, View } from 'obsidian';

export type TagFilesMap = { [tag: string]: TFile[] };

export interface SearchDOM {
    getFiles(): TFile[];
}

export interface SearchView extends View {
    dom: SearchDOM;
}

export interface SmartRandomNoteSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
}
