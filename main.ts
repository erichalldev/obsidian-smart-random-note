import { App, ButtonComponent, DropdownComponent, Modal, Plugin } from 'obsidian';

export default class SmartRandomNotePlugin extends Plugin {
	async onload(): Promise<void> {
		console.log('loading smart-random-note');

		this.addCommand({
			id: 'open-random-note',
			name: 'Open Random Note',
			callback: this.openRandomNote,
		})

		this.addCommand({
			id: 'open-tagged-random-note',
			name: 'Open Tagged Random Note',
			callback: this.openTaggedRandomNote,
		})
	}

	onunload = (): void => {
		console.log('unloading smart-random-note');
	}
	
	openRandomNote = async (): Promise<void> => {
		const markdownFiles = this.app.vault.getMarkdownFiles();

		var filePaths = markdownFiles.map(x => x.path);
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
		}

		modal.open();
	};
}

type TagFileMap = { [tag: string]: string[] }

function getTagFilesMap(app: App): TagFileMap {
	const metadataCache = app.metadataCache;
	const markdownFiles = app.vault.getMarkdownFiles();
	const tagFilesMap: { [tag: string]: string[] } = {};

	for (var markdownFile of markdownFiles) {
		const cachedMetadata = metadataCache.getFileCache(markdownFile);
		
		if (cachedMetadata && cachedMetadata.tags) {
			for (var cachedTag of cachedMetadata.tags) {
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
	return array[array.length * Math.random() << 0];
}

class SmartRandomNoteModal extends Modal {
	tags: string[];
	selectedTag: string = '';
	firstKeyUpHandled: boolean = false;
	submitCallback: () => Promise<void> = async () => {};

	constructor(app: App, tags: string[]) {
		super(app);
		this.tags = tags;
		this.selectedTag = tags[0];
	}

	onOpen = () => {
		this.contentEl.createEl('h3', { text: 'Select Tag' });

		const tagDropdown = new DropdownComponent(this.contentEl)
			.onChange(value => this.selectedTag = value);

		for (var tag of this.tags) {
			tagDropdown.addOption(tag, tag);
		}

		tagDropdown.setValue(this.selectedTag);

		new ButtonComponent(this.contentEl)
			.setButtonText('Submit')
			.setCta()
			.onClick(this.submit);

		document.addEventListener('keyup', this.handleKeyUp);
	};

	handleKeyUp = (event: KeyboardEvent): void => {
		if (this.firstKeyUpHandled && event.key == 'Enter') {
			this.submit();
		}
		this.firstKeyUpHandled = true;
	}

	submit = (): void => {
		if (this.submitCallback) {
			this.submitCallback();
		}
		this.close();
	};

	onClose = (): void => {
		document.removeEventListener('keyup', this.handleKeyUp);
	};
}