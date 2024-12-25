"use client";

import { API, BlockAPI, BlockTool, PasteEvent } from "@editorjs/editorjs";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

const COMMON_LANGUAGES = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  python: "Python",
  ruby: "Ruby",
  php: "PHP",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  go: "Go",
  rust: "Rust",
  sql: "SQL",
  shell: "Shell",
  markdown: "Markdown",
  yaml: "YAML",
  json: "JSON",
  plaintext: "Plain Text",
};

export interface CodeBoxData {
  code: string;
  language: string;
  theme?: string;
}

export default class CodeBox implements BlockTool {
  private api: API;
  private readOnly: boolean;
  private block: BlockAPI;
  private data: CodeBoxData;
  private wrapper!: HTMLElement;
  private codeArea!: HTMLElement;
  private languageSelect!: HTMLSelectElement;
  private _debounceTimer: NodeJS.Timeout | null = null;

  static get toolbox() {
    return {
      title: "CodeBox",
      icon: '<svg width="14" height="14" viewBox="0 0 14 14"><path fill="currentColor" d="M3.177 4.177l-2.82 2.82 2.82 2.82.707-.707-2.113-2.113 2.113-2.113-.707-.707zM10.823 4.177l2.82 2.82-2.82 2.82-.707-.707 2.113-2.113-2.113-2.113.707-.707z"/></svg>',
    };
  }

  constructor({ data, api, readOnly, block }) {
    this.api = api;
    this.readOnly = readOnly;
    this.block = block;
    this.data = {
      code: data.code || "",
      language: data.language || "javascript",
      theme: data.theme || "dark",
    };
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add(
      "relative",
      "rounded-lg",
      "border",
      "border-gray-700",
      "bg-gray-900",
      "p-4"
    );

    const toolbar = document.createElement("div");
    toolbar.classList.add(
      "flex",
      "items-center",
      "justify-between",
      "mb-2",
      "gap-2"
    );

    this.languageSelect = document.createElement("select");
    this.languageSelect.classList.add(
      "h-9",
      "rounded-md",
      "border",
      "border-gray-700",
      "bg-gray-800",
      "px-3",
      "text-sm",
      "text-gray-300",
      "focus:outline-none",
      "focus:ring-1",
      "focus:ring-gray-600"
    );

    Object.entries(COMMON_LANGUAGES).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      this.languageSelect.appendChild(option);
    });

    this.languageSelect.value = this.data.language;
    this.languageSelect.addEventListener("change", () => {
      this.data.language = this.languageSelect.value;
      this.updateHighlighting();
    });

    const copyButton = document.createElement("button");
    copyButton.className =
      "inline-flex h-9 items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-600";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(this.data.code);
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 2000);
    });

    toolbar.appendChild(this.languageSelect);
    toolbar.appendChild(copyButton);

    this.codeArea = document.createElement("pre");
    this.codeArea.classList.add(
      "font-mono",
      "text-sm",
      "p-4",
      "rounded-md",
      "bg-gray-800",
      "text-gray-300",
      "outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-gray-600",
      "whitespace-pre-wrap",
      "break-words"
    );
    this.codeArea.contentEditable = !this.readOnly ? "true" : "false";
    this.codeArea.dataset.placeholder = "Enter code here...";
    this.codeArea.textContent = this.data.code;

    this.codeArea.addEventListener("input", this.onInput.bind(this));
    this.codeArea.addEventListener("keydown", this.onKeyDown.bind(this));
    this.wrapper.addEventListener("paste", this.onPaste.bind(this));

    this.wrapper.appendChild(toolbar);
    this.wrapper.appendChild(this.codeArea);

    this.updateHighlighting();
    return this.wrapper;
  }

  private onInput() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this.data.code = this.codeArea.textContent || "";
      this.updateHighlighting();
    }, 300);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  }

  private onPaste(e: ClipboardEvent) {
    e.preventDefault();
    e.stopPropagation();

    const text = e.clipboardData?.getData("text/plain") || "";
    const formattedText = text.replace(/\n/g, "\n");

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (range && this.codeArea.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      const textNode = document.createTextNode(formattedText);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection?.removeAllRanges();
      selection?.addRange(range);

      this.onInput();
    }
  }

  private updateHighlighting() {
    const code = this.codeArea.textContent || "";
    const grammar = Prism.languages[this.data.language];
    if (grammar) {
      const highlighted = Prism.highlight(code, grammar, this.data.language);
      this.codeArea.innerHTML = highlighted;
    } else {
      this.codeArea.textContent = code;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this.codeArea);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  save() {
    return this.data;
  }

  static get sanitize() {
    return {
      code: true,
      language: false,
      theme: false,
    };
  }
}