# Jenga Choices

Jenga Choices is a React, Vite, and TypeScript web app designed as a digital companion for physical Jenga games, replacing written prompts on blocks with interactive party challenges.

**Live Demo:** https://bng94.github.io/jenga-choices/

## Project Overview

It addresses the limitations of traditional custom Jenga, such as slow gameplay due to reading or memorized prompts. It allows for a physical tower while managing challenges instantly via a mobile device.

## Key Features

* **Game Modes:** Supports blank blocks (random prompt) or numbered blocks (1 to 54).
* **Pre-set Decks:** Includes Singles, Truth or Dare, and Valentine's Day lists.
* **Customization:** Features a drag-and-drop editor to create custom lists up to 54 items.
* **No Backend:** Saves progress and custom decks directly to browser local storage.
* **Portability:** Supports JSON import and export for sharing decks.
* **Log:** Includes a feature to view the previous prompt.

## How to Play

1. **Setup:** Build a 54-block tower and open the app on a phone.
2. **Configure:** Choose a prompt list and block type (Blank or Numbered).
3. **Gameplay:** Pull a block, reveal the prompt, and place the block on top.
4. **House Rules:** Custom penalties for skipped prompts.

## Running Locally

```bash
# Clone the repository
git clone https://github.com

# Navigate to the directory
cd jenga-choices

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open http://localhost:5173 in your browser.

***
Built for the physical table. No installs, no accounts, no backend. Just pull a block.
