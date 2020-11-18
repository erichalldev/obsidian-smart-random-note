import { App } from 'obsidian';
import { TagFilesMap } from './types';

export function getTagFilesMap(app: App): TagFilesMap {
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

export function randomElement<T>(array: T[]): T {
    return array[(array.length * Math.random()) << 0];
}
