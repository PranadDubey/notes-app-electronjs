# Notes App using Electron.js

A clean, modern, and lightweight strictly desktop Notes application built with Electron.js, Vanilla JavaScript, HTML, and CSS. This app features a beautifully styled, custom frameless UI inspired by macOS, providing a seamless and native feeling experience right on your desktop.

## Key Features

- Modern Frameless UI: Completely custom-built window controls (Minimize, Maximize, Close) utilizing Electron's -webkit-app-region drag properties.
- Real-Time Auto-Save: Seamlessly saves your notes while you type using a lightweight debounce function, so there is no manual Save button required.
- Dynamic Multiple Windows: Clean separation between the main application interface and a reusable modal window that dynamically acts as both a Create Note and Edit Note interface, prefilling existing information when editing.
- Live Search and Filter: Instantly filter your list of notes by title right from the sidebar.
- Resizable Sidebar: Customizable sidebar viewing width built purely with native pointer events, saved to localStorage across application reloads.
- Tagging System: Add up to 3 custom color-coded tracking tags to any note to keep everything organized.
- Secure Architecture: Built following Electron best practices utilizing contextBridge and IPC (Inter-Process Communication) to completely isolate the DOM from Node.js background processes.
- Live Clock: Built-in footer widget keeping track of the current Day, Date, and Time.
- Local JSON Storage: All notes are saved completely locally and privately in standard JSON format in the data folder using the native Node fs library.

## Tech Stack

- Framework: Electron.js
- Frontend: Vanilla HTML5, CSS3, JavaScript (No external UI frameworks)
- Backend: Node.js (Main Process)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine. Ensure you have Node.js installed along with npm (Node Package Manager).

Installation:
1. Clone the repository
2. Open terminal in the directory
3. Run: npm install
4. Run: npm start


## Security

The renderer processes strictly communicate with the main process exclusively through the globally exposed window API layer generated within the preload script.
