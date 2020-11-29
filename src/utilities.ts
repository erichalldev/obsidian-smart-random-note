import { App, CachedMetadata, getLinkpath, iterateCacheRefs, TFile } from 'obsidian';
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
            } else {
                const untaggedName = '<untagged>';
                if (tagFilesMap[untaggedName]) {
                    tagFilesMap[untaggedName].push(markdownFile.path);
                } else {
                    tagFilesMap[untaggedName] = [markdownFile.path];
                }
            }
        }
    }

    return tagFilesMap;
}

export function getOrphanedFiles(app: App): TFile[] {
    const markdownFiles = app.vault.getMarkdownFiles();

    const filesWithLinks: Set<TFile> = new Set();
    const filesWithBacklinks: Set<TFile> = new Set();

    markdownFiles.forEach((markdownFile: TFile) => {
        let hasLinks = false;
        iterateCacheRefs(app.metadataCache.getFileCache(markdownFile), (refCache) => {
            const linkFile = app.metadataCache.getFirstLinkpathDest(getLinkpath(refCache.link), markdownFile.path);
            if (linkFile) {
                hasLinks = true;
                filesWithBacklinks.add(linkFile);
            }
        });
        if (hasLinks) {
            filesWithLinks.add(markdownFile);
        }
    });

    const orphanedFiles = markdownFiles.filter((x) => !filesWithLinks.has(x) && !filesWithBacklinks.has(x));

    return orphanedFiles;
}

export function randomElement<T>(array: T[]): T {
    return array[(array.length * Math.random()) << 0];
}

function getCachedTags(cachedMetadata: CachedMetadata): string[] {
    const bodyTags: string[] = cachedMetadata.tags?.map((x) => x.tag) || [];
    const frontMatterTags: string[] = cachedMetadata.frontmatter?.tags || [];

    // frontmatter tags might not have a hashtag in front of them
    const cachedTags = bodyTags.concat(frontMatterTags).map((x) => (x.startsWith('#') ? x : '#' + x));

    return cachedTags;
}
