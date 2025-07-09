# LLAL Generator - Vulkan (Paper.js)

A Paper.js-based volcano graphics generator that creates dynamic, generative art patterns using the LLAL font and Paper.js library.

## Features

- **Paper.js Integration**: Leverages Paper.js for powerful vector graphics operations
- **Modular Sketch System**: Easy-to-extend architecture for adding new sketch types
- **Reproducible Results**: Hash-based seeding system for consistent generation
- **Interactive Controls**: Real-time parameter adjustment with live preview
- **SVG Export**: Export your creations as scalable vector graphics
- **Responsive Design**: Works across different screen sizes

## Sketches

### 1. Firework Pattern
Creates explosive, radial patterns with the LLAL text arranged in rays extending from a central point.

**Features:**
- Configurable number of rays and elements per ray
- Font size scaling along rays
- Color modes: Black & White, Colorful, Monochrome
- Rotation controls
- Blank elements for visual interest

### 2. Arc Text
Arranges text in circular and spiral patterns.

**Features:**
- Multiple pattern types: Concentric, Spiral, Cone
- Adjustable radius, spacing, and font size
- Direction control (clockwise/counterclockwise)
- Random rotation option
- Color gradients and modes

## Getting Started

1. **Clone or download** this repository
2. **Open** `index.html` in a modern web browser
3. **Select** a sketch from the dropdown
4. **Adjust** parameters using the control panel
5. **Generate** new variations with the "New [Sketch]" button
6. **Save** your creations using the "Save SVG" button

## Keyboard Shortcuts

- **Cmd/Ctrl + S**: Save current sketch as SVG
- **R**: Reload current sketch with new seed
- **N**: Generate new variation of current sketch

## Project Structure

```
├── index.html              # Main HTML file
├── style.css               # Styles for the interface
├── js/
│   ├── main.js             # Application entry point
│   ├── sketch-manager.js   # Sketch management system
│   ├── hash.js             # Hash-based seeding utilities
│   └── utils.js            # General utilities and Paper.js helpers
├── sketches/
│   ├── firework-paperjs.js # Firework pattern sketch
│   └── arc-paperjs.js      # Arc text pattern sketch
├── assets/
│   └── fonts/
│       └── LLALLogoLinearGX.ttf  # LLAL font file
└── README.md
```

## Adding New Sketches

1. Create a new sketch file in `sketches/` directory
2. Implement the sketch class with required methods:
   - `constructor(controlsContainer)`
   - `init()`
   - `cleanup()`
   - `newSketch()` (optional)
   - `updateSketch()` (optional)
3. Add the sketch to the `loadSketches()` method in `sketch-manager.js`
4. Include the script in `index.html`

### Example Sketch Template

```javascript
class MySketch {
  constructor(controlsContainer) {
    this.controlsContainer = controlsContainer;
    this.items = [];
    this.seed = new Hash();
    window.seed = this.seed;
  }

  init() {
    this.setupSettings();
    this.createArt();
    this.setupControls();
    this.updateHashDisplay();
  }

  setupSettings() {
    this.settings = {
      // Your settings here
    };
  }

  createArt() {
    // Clear existing items
    this.items.forEach(item => item.remove());
    this.items = [];
    
    // Create your Paper.js art here
  }

  setupControls() {
    // Create UI controls
  }

  cleanup() {
    this.items.forEach(item => item.remove());
    this.items = [];
  }
}
```

## Technical Details

- **Framework**: Paper.js for vector graphics
- **Seeding**: Custom hash-based random number generation
- **Export**: SVG format with timestamp and seed information
- **Responsiveness**: Canvas automatically resizes to fit viewport

## Browser Support

Works in all modern browsers that support:
- Canvas API
- ES6 Classes
- Paper.js

## Development

This is a client-side application that requires no build process. Simply open `index.html` in a web browser to start developing.

For development, you may want to:
- Use a local server (like Live Server in VS Code)
- Enable browser dev tools for debugging
- Use the browser's responsive design mode for mobile testing

## License

This project is part of the LLAL Generator suite for volcanic graphics generation. 