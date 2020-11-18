import { TFile, View } from 'obsidian';

export type TagFilesMap = { [tag: string]: string[] };

export interface ResultDOM {
    file: TFile;
}

export interface SearchDOM {
    resultDoms: ResultDOM[];
}

export interface SearchView extends View {
    dom: SearchDOM;
}

export interface SmartRandomNoteSettings {
    openInNewLeaf: boolean;
    enableRibbonIcon: boolean;
}
