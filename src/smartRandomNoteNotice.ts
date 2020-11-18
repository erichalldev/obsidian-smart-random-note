import { Notice } from 'obsidian';

export class SmartRandomNoteNotice extends Notice {
    constructor(message: string, timeout?: number) {
        super('Smart Random Note: ' + message, timeout);
    }
}
