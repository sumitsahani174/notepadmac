# NotepadMac

NotepadMac is a local-first browser notepad built with React, MUI, and Monaco Editor. It keeps files in the browser, supports multiple tabs, and downloads text files when you want to export your work.

## Features

- Monaco-powered editor with syntax modes for common languages.
- Multi-file tab workflow with an Explorer sidebar.
- Local file open, browser download, and download-as flows.
- Light and dark themes, word wrap, find, replace, and cursor status.
- Local project cache through `localStorage`.
- Edited-file indicators for changes since the last download/open state.

## Scripts

Run the app in development mode:

```sh
npm start
```

Run the test suite once:

```sh
npm test -- --watchAll=false
```

Create a production build:

```sh
npm run build
```

## Notes

This project currently uses Create React App through `react-scripts`. A future tooling milestone should migrate the app to Vite or another maintained React build tool.
