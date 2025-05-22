# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Linting
```bash
npx eslint game.js
```

### Running the Game
Open `index.html` in a web browser to run the game. No build process is required as this is a vanilla JavaScript/TypeScript project.

## Code Architecture

This is a 2D HTML5 Canvas game written in TypeScript (compiled to vanilla JavaScript). The game features a girl character who can move between indoor and outdoor scenes, interact with objects, and manage chickens.

### Core Game Structure

The main game object (`Game` interface) manages:
- Canvas rendering context
- Image loading and management 
- Scene transitions between "indoor" and "outdoor"
- Main game loop (update/draw cycle)

### Key Game Objects

- **girl**: Player character with movement, chicken carrying mechanics
- **orangeTree**: Interactive orange tree with collectible oranges (outdoor scene)
- **chickens**: Autonomous moving chickens that can be caught and delivered to coop
- **chickenCoop**: Target destination for chicken delivery with visual feedback
- **items**: Indoor collectibles (apple, cookie) with interaction mechanics
- **speechBubble**: Text display system for character reactions
- **input**: Keyboard input handler for movement and interactions

### Scene System

Two main scenes:
- **indoor**: House interior with door, apple, and cookie
- **outdoor**: Outdoor area with orange tree, chickens, and chicken coop

Scene transitions triggered by:
- Walking through door (indoor → outdoor, requires spacebar)
- Walking off left edge (outdoor → indoor)

### Input Controls

- Arrow keys: Character movement (8-directional with normalized diagonal movement)
- Spacebar: Interact with objects, catch/release chickens, transition through door

### Image Assets

All game sprites are loaded dynamically with error handling. Required images:
- girl.png, house.png, outdoor.png (backgrounds)
- apple.png, cookie.png, orange.png, orange_tree.png
- chicken.png, chicken_coop.png