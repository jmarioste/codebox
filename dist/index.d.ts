import { BlockTool } from '@editorjs/editorjs';

interface CodeBoxData {
    code: string;
    language: string;
    theme?: string;
}
declare class CodeBox implements BlockTool {
    private api;
    private readOnly;
    private block;
    private data;
    private wrapper;
    private codeArea;
    private languageSelect;
    private _debounceTimer;
    static get toolbox(): {
        title: string;
        icon: string;
    };
    constructor({ data, api, readOnly, block }: {
        data: any;
        api: any;
        readOnly: any;
        block: any;
    });
    render(): HTMLElement;
    private onInput;
    private onKeyDown;
    private _onPaste;
    private updateHighlighting;
    save(): CodeBoxData;
    static get sanitize(): {
        code: boolean;
        language: boolean;
        theme: boolean;
    };
}

export { CodeBox };
