import { App, CachedMetadata, MetadataCache, Modal, Plugin, PluginSettingTab } from 'obsidian';

interface CachedFileData {
	mtime: number;
	size: number;
	hash: string;
}

interface MyMetadataCache extends MetadataCache {
	fileCache: { [path: string]: CachedFileData };
	metadataCache: { [hash: string]: CachedMetadata };
	getTags(): { [tag: string]: number }
}

export default class SmartRandomNotePlugin extends Plugin {
	settings: Settings = new Settings();

	async onload(): Promise<void> {
		console.log('loading smart-random-note');

		this.settings = await this.loadData() || new Settings();
		this.addSettingTab(new SmartRandomNoteSettingTab(this.app, this));

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
		const fileCache = (this.app.metadataCache as MyMetadataCache).fileCache;

		var fileNames = Object.keys(fileCache);
		const fileNameToOpen = randomElement(fileNames);
		await this.app.workspace.openLinkText(fileNameToOpen, '', true, { active: true });
	};

	openTaggedRandomNote = (): void => {
		const tags = (this.app.metadataCache as MyMetadataCache).getTags();

		const modal = new SmartRandomNoteModal(this.app, Object.keys(tags));

		modal.submitCallback = async (): Promise<void> => {
			const metadataCache = (this.app.metadataCache as MyMetadataCache).metadataCache;
			const fileCache = (this.app.metadataCache as MyMetadataCache).fileCache;

			const tagFilesMap: { [tag: string]: string[] } = {};
			for (var fileName in fileCache) {
				const cachedFileData = fileCache[fileName];
				const cachedMetadata = metadataCache[cachedFileData.hash];
				if (cachedMetadata.tags) {
					for (var cachedTag of cachedMetadata.tags) {
						if (tagFilesMap[cachedTag.tag]) {
							tagFilesMap[cachedTag.tag].push(fileName);
						} else {
							tagFilesMap[cachedTag.tag] = [fileName];
						}
					}
				}
			}

			const taggedFiles = tagFilesMap[modal.selectedTag];
			const fileNameToOpen = randomElement(taggedFiles);
			await this.app.workspace.openLinkText(fileNameToOpen, '', true, { active: true });
		}

		modal.open();
	};
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
		const tagDropdown = this.contentEl.createEl('select');
		tagDropdown.id = 'srn-tag-dropdown';
		tagDropdown.addClass('dropdown')

		for (var tag of this.tags) {
			const tagOption = tagDropdown.createEl('option');
			tagOption.value = tag;
			tagOption.text = tag;
		}

		tagDropdown.addEventListener('change', _ => {
			this.selectedTag = tagDropdown.value;
		});

		const submitButton = this.contentEl.createEl('button', { text: 'Submit' });
		submitButton.addClass('mod-cta');
		submitButton.addEventListener('click', this.submit);

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

class Settings {
}

class SmartRandomNoteSettingTab extends PluginSettingTab {
	plugin: SmartRandomNotePlugin;

	constructor(app: App, plugin: SmartRandomNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();
	}
}
