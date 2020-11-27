import { App, CachedMetadata } from 'obsidian';
import { TagFilesMap } from './types';

export function getTagFilesMap(app: App): TagFilesMap {
    const metadataCache = app.metadataCache;
    const markdownFiles = app.vault.getMarkdownFiles();

    const tagFilesMap: TagFilesMap = {};

    for (const markdownFile of markdownFiles) {
        const cachedMetadata = metadataCache.getFileCache(markdownFile);

        if (cachedMetadata) {
            const cachedTags = getCachedTags(cachedMetadata);
            if (cachedTags.length) {
                for (const cachedTag of cachedTags) {
                    if (tagFilesMap[cachedTag]) {
                        tagFilesMap[cachedTag].push(markdownFile.path);
                    } else {
                        tagFilesMap[cachedTag] = [markdownFile.path];
                    }
                }
            }
        }
    }

    return tagFilesMap;
}

function getCachedTags(cachedMetadata: CachedMetadata): string[] {
    const bodyTags: string[] = cachedMetadata.tags?.map((x) => x.tag) || [];
    const frontMatterTags: string[] = cachedMetadata.frontmatter?.tags || [];

    // frontmatter tags might not have a hashtag in front of them
    const cachedTags = bodyTags.concat(frontMatterTags).map((x) => (x.startsWith('#') ? x : '#' + x));

    return cachedTags;
}

export function randomElement<T>(array: T[]): T {
    return array[(array.length * Math.random()) << 0];
}
