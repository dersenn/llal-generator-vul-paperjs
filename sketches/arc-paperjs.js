// Arc text sketch adapted for Paper.js
// Creates text arranged in arcs or circular patterns

class ArcPaperSketch {
  constructor(controlsContainer) {
    this.controlsContainer = controlsContainer;
    this.items = [];
    this.settings = {};
    
    // Initialize seed
    this.seed = new Hash();
    
    // Check if we should use a specific seed from URL
    const urlParams = new URLSearchParams(window.location.search);
    const seedFromUrl = urlParams.get('seed');
    if (seedFromUrl) {
      this.seed.hash = seedFromUrl;
      this.seed.hashTrunc = this.seed.hash.slice(2);
      this.seed.regex = new RegExp('.{' + ((this.seed.hashTrunc.length / 4) | 0) + '}', 'g');
      this.seed.hashes = this.seed.hashTrunc.match(this.seed.regex).map((h) => this.seed.b58dec(h));
      this.seed.rnd = this.seed.sfc32(...this.seed.hashes);
    }
    
    // Set global seed
    window.seed = this.seed;
  }

  init() {
    this.setupSettings();
    this.createArcText();
    this.setupControls();
    this.updateHashDisplay();
  }

  setupSettings() {
    // Arc text settings
    this.settings = {
      nArcs: rndInt(3, 8),
      radius: rndInt(80, 200),
      radiusSpacing: rndInt(30, 80),
      fontSize: rndInt(16, 40),
      textSpacing: rndInt(15, 45),
      startAngle: rnd() * 360,
      arcSpan: rndInt(120, 360),
      textContent: 'LLAL',
      pattern: 'concentric', // 'concentric', 'spiral', 'cone'
      colorMode: 'blackWhite',
      direction: 'clockwise',
      randomRotation: false,
      fontVariation: rndInt(50, 200)
    };
  }

  createArcText() {
    // Clear existing items
    this.items.forEach(item => item.remove());
    this.items = [];

    const center = paper.view.center;
    
    switch(this.settings.pattern) {
      case 'concentric':
        this.createConcentricArcs(center);
        break;
      case 'spiral':
        this.createSpiral(center);
        break;
      case 'cone':
        this.createCone(center);
        break;
    }
  }

  createConcentricArcs(center) {
    for (let arc = 0; arc < this.settings.nArcs; arc++) {
      const currentRadius = this.settings.radius + (arc * this.settings.radiusSpacing);
      const arcSpan = rad(this.settings.arcSpan);
      const startAngle = rad(this.settings.startAngle);
      
      // Calculate number of text elements that fit on this arc
      const circumference = 2 * Math.PI * currentRadius * (this.settings.arcSpan / 360);
      const nElements = Math.floor(circumference / this.settings.textSpacing);
      
      for (let i = 0; i < nElements; i++) {
        const angleStep = arcSpan / nElements;
        const angle = startAngle + (i * angleStep);
        
        const x = center.x + Math.cos(angle) * currentRadius;
        const y = center.y + Math.sin(angle) * currentRadius;
        const position = new paper.Point(x, y);
        
        // Create text item
        const textItem = this.createTextItem(position, angle, arc);
        this.items.push(textItem);
      }
    }
  }

  createSpiral(center) {
    const totalElements = this.settings.nArcs * 20; // More elements for spiral
    const angleStep = rad(10); // Smaller angle steps
    const radiusStep = this.settings.radiusSpacing / 20;
    
    for (let i = 0; i < totalElements; i++) {
      const angle = i * angleStep;
      const radius = this.settings.radius + (i * radiusStep);
      
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      const position = new paper.Point(x, y);
      
      // Create text item
      const textItem = this.createTextItem(position, angle, i);
      this.items.push(textItem);
    }
  }

  createCone(center) {
    const coneHeight = this.settings.radius * 2;
    const maxRadius = this.settings.radius;
    
    for (let level = 0; level < this.settings.nArcs; level++) {
      const y = center.y - coneHeight/2 + (level * coneHeight / this.settings.nArcs);
      const levelRadius = maxRadius * (1 - level / this.settings.nArcs);
      
      // Calculate number of elements for this level
      const nElements = Math.max(1, Math.floor(levelRadius / (this.settings.textSpacing / 2)));
      
      for (let i = 0; i < nElements; i++) {
        const angle = (i / nElements) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * levelRadius;
        const position = new paper.Point(x, y);
        
        // Create text item
        const textItem = this.createTextItem(position, angle, level);
        this.items.push(textItem);
      }
    }
  }

  createTextItem(position, angle, index) {
    const textItem = new paper.PointText(position);
    textItem.content = this.settings.textContent;
    
    // Style the text
    textItem.style = {
      fontFamily: 'LLAL-linear',
      fontSize: this.settings.fontSize,
      fillColor: this.getTextColor(index),
      fontWeight: 'normal'
    };
    
    // Apply rotation
    let rotationAngle = this.settings.direction === 'clockwise' ? angle : -angle;
    if (this.settings.randomRotation) {
      rotationAngle += rad(rnd() * 60 - 30); // Random rotation ±30 degrees
    }
    
    textItem.rotate(deg(rotationAngle), position);
    
    return textItem;
  }

  getTextColor(index) {
    switch(this.settings.colorMode) {
      case 'blackWhite':
        return new paper.Color(0, 0, 0);
      
      case 'colorful':
        return createRandomColor();
      
      case 'monochrome':
        const gray = rnd();
        return new paper.Color(gray, gray, gray);
      
      case 'gradient':
        const t = index / 20; // Normalize index
        return new paper.Color(t, 0.5, 1 - t);
      
      default:
        return new paper.Color(0, 0, 0);
    }
  }

  setupControls() {
    this.controlsContainer.innerHTML = `
      <div class="control-group">
        <h4>Arc Settings</h4>
        
        <label for="nArcs-slider">Number of Arcs: <span id="nArcs-value">${this.settings.nArcs}</span></label>
        <input type="range" id="nArcs-slider" min="1" max="15" value="${this.settings.nArcs}">
        
        <label for="radius-slider">Base Radius: <span id="radius-value">${this.settings.radius}</span></label>
        <input type="range" id="radius-slider" min="50" max="300" value="${this.settings.radius}">
        
        <label for="radiusSpacing-slider">Radius Spacing: <span id="radiusSpacing-value">${this.settings.radiusSpacing}</span></label>
        <input type="range" id="radiusSpacing-slider" min="20" max="100" value="${this.settings.radiusSpacing}">
        
        <label for="fontSize-slider">Font Size: <span id="fontSize-value">${this.settings.fontSize}</span></label>
        <input type="range" id="fontSize-slider" min="10" max="60" value="${this.settings.fontSize}">
        
        <label for="textSpacing-slider">Text Spacing: <span id="textSpacing-value">${this.settings.textSpacing}</span></label>
        <input type="range" id="textSpacing-slider" min="10" max="80" value="${this.settings.textSpacing}">
        
        <label for="startAngle-slider">Start Angle: <span id="startAngle-value">${this.settings.startAngle.toFixed(0)}°</span></label>
        <input type="range" id="startAngle-slider" min="0" max="360" value="${this.settings.startAngle}">
        
        <label for="arcSpan-slider">Arc Span: <span id="arcSpan-value">${this.settings.arcSpan}°</span></label>
        <input type="range" id="arcSpan-slider" min="60" max="360" value="${this.settings.arcSpan}">
        
        <label for="pattern-select">Pattern:</label>
        <select id="pattern-select">
          <option value="concentric" ${this.settings.pattern === 'concentric' ? 'selected' : ''}>Concentric</option>
          <option value="spiral" ${this.settings.pattern === 'spiral' ? 'selected' : ''}>Spiral</option>
          <option value="cone" ${this.settings.pattern === 'cone' ? 'selected' : ''}>Cone</option>
        </select>
        
        <label for="colorMode-select">Color Mode:</label>
        <select id="colorMode-select">
          <option value="blackWhite" ${this.settings.colorMode === 'blackWhite' ? 'selected' : ''}>Black & White</option>
          <option value="colorful" ${this.settings.colorMode === 'colorful' ? 'selected' : ''}>Colorful</option>
          <option value="monochrome" ${this.settings.colorMode === 'monochrome' ? 'selected' : ''}>Monochrome</option>
          <option value="gradient" ${this.settings.colorMode === 'gradient' ? 'selected' : ''}>Gradient</option>
        </select>
        
        <label for="direction-select">Direction:</label>
        <select id="direction-select">
          <option value="clockwise" ${this.settings.direction === 'clockwise' ? 'selected' : ''}>Clockwise</option>
          <option value="counterclockwise" ${this.settings.direction === 'counterclockwise' ? 'selected' : ''}>Counter-clockwise</option>
        </select>
        
        <label>
          <input type="checkbox" id="randomRotation-checkbox" ${this.settings.randomRotation ? 'checked' : ''}>
          Random Rotation
        </label>
        
        <label for="textContent-input">Text Content:</label>
        <input type="text" id="textContent-input" value="${this.settings.textContent}" style="width: 100%; padding: 5px;">
      </div>
      
      <div class="control-group">
        <h4>Actions</h4>
        <button id="regenerate-btn">New Arc</button>
        <button id="save-btn">Save SVG</button>
      </div>
    `;

    // Add event listeners
    this.addControlListeners();
  }

  addControlListeners() {
    // Sliders
    const sliders = ['nArcs', 'radius', 'radiusSpacing', 'fontSize', 'textSpacing', 'startAngle', 'arcSpan'];
    sliders.forEach(name => {
      const slider = document.getElementById(`${name}-slider`);
      const valueDisplay = document.getElementById(`${name}-value`);
      
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.settings[name] = value;
        
        // Update value display
        if (name === 'startAngle') {
          valueDisplay.textContent = value.toFixed(0) + '°';
        } else if (name === 'arcSpan') {
          valueDisplay.textContent = value + '°';
        } else {
          valueDisplay.textContent = value;
        }
        
        this.updateSketch();
      });
    });

    // Checkboxes
    document.getElementById('randomRotation-checkbox').addEventListener('change', (e) => {
      this.settings.randomRotation = e.target.checked;
      this.updateSketch();
    });

    // Select dropdowns
    ['pattern', 'colorMode', 'direction'].forEach(name => {
      document.getElementById(`${name}-select`).addEventListener('change', (e) => {
        this.settings[name] = e.target.value;
        this.updateSketch();
      });
    });

    // Text input
    document.getElementById('textContent-input').addEventListener('input', (e) => {
      this.settings.textContent = e.target.value || 'LLAL';
      this.updateSketch();
    });

    // Buttons
    document.getElementById('regenerate-btn').addEventListener('click', () => {
      this.newSketch();
    });

    document.getElementById('save-btn').addEventListener('click', () => {
      saveAsSVG('arc-paperjs');
    });
  }

  updateSketch() {
    this.createArcText();
  }

  newSketch() {
    // Generate new seed and settings
    this.seed.update();
    window.seed = this.seed;
    
    this.setupSettings();
    this.createArcText();
    this.setupControls();
    this.updateHashDisplay();
    
    // Update URL
    if (window.sketchManager) {
      window.sketchManager.updateURL();
    }
  }

  updateHashDisplay() {
    const hashDisplay = document.getElementById('hash-display');
    if (hashDisplay && this.seed) {
      hashDisplay.textContent = `Seed: ${this.seed.hash}`;
    }
  }

  cleanup() {
    // Remove all created items
    this.items.forEach(item => {
      if (item && item.remove) {
        item.remove();
      }
    });
    this.items = [];
  }
} 