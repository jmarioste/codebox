# Editor.js Plugin Library

This project is an Editor.js plugin library that provides a customizable code editor block, allowing users to write and manage code snippets within their Editor.js content.

## Features

- Code syntax highlighting for multiple programming languages.
- Language selection dropdown.
- Clipboard functionality to copy code snippets.
- Responsive and user-friendly UI.

## Installation

To install the library, use npm:

```
npm install editorjs-plugin-library
```

## Usage

To use the CodeBox plugin in your Editor.js instance, follow these steps:

1. Import the CodeBox class from the library:

```javascript
import CodeBox from "@jmarioste/codebox";
```

2. Add the CodeBox to your Editor.js configuration:

```javascript
const editor = new EditorJS({
  tools: {
    codebox: CodeBox,
  },
});
```

3. Customize the CodeBox as needed by passing data to it:

```javascript
const codeData = {
  code: 'console.log("Hello, World!");',
  language: "javascript",
  theme: "dark",
};

editor.blocks.insert("codebox", codeData);
```

### Building

To build the library, run:

```
npm run build
```

### Testing

To run tests, use:

```
npm run test
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
