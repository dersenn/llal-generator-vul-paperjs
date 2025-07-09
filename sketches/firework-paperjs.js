// Firework sketch adapted for Paper.js
// Based on the original SVG firework sketch

class FireworkPaperSketch {
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
    this.createFirework();
    this.setupControls();
    this.updateHashDisplay();
  }

  setupSettings() {
    // Firework settings
    this.settings = {
      nRays: rndInt(5, 15),
      nElements: rndInt(3, 8),
      baseFontSize: rndInt(12, 30),
      fontSizeScale: 1.2 + rnd() * 0.8,
      blanksProb: rndInt(10, 50),
      useBlanks: true,
      rotation: rnd() * 360,
      textContent: 'LLAL',
      colorMode: 'blackWhite', // 'blackWhite', 'colorful', 'monochrome'
      animationSpeed: 0.5,
      enableAnimation: false
    };
  }

  createFirework() {
    // Clear existing items
    this.items.forEach(item => item.remove());
    this.items = [];

    const center = paper.view.center;
    const maxRadius = Math.min(paper.view.size.width, paper.view.size.height) * 0.4;
    
    // Create firework pattern
    for (let ray = 0; ray < this.settings.nRays; ray++) {
      const angle = (ray / this.settings.nRays) * Math.PI * 2 + rad(this.settings.rotation);
      let currentRadius = 0;

      for (let element = 0; element < this.settings.nElements; element++) {
        const x = center.x + Math.cos(angle) * currentRadius;
        const y = center.y + Math.sin(angle) * currentRadius;
        const position = new paper.Point(x, y);

        // Calculate font size based on element position
        const elementFontSize = this.settings.baseFontSize * Math.pow(this.settings.fontSizeScale, element);

        // Create text item
        const textItem = new paper.PointText(position);
        textItem.content = this.settings.textContent;
        textItem.style = {
          fontFamily: 'LLAL-linear',
          fontSize: elementFontSize,
          fillColor: this.getTextColor(),
          fontWeight: 'normal'
        };

        // Apply rotation
        textItem.rotate(deg(angle), position);

        // Add to items array
        this.items.push(textItem);

        // Calculate the width of this element and add it to the radius for the next element
        currentRadius += textItem.bounds.width + elementFontSize * 0.1;
      }
    }
  }

  getTextColor() {
    switch(this.settings.colorMode) {
      case 'blackWhite':
        if (this.settings.useBlanks && coinToss(this.settings.blanksProb)) {
          return new paper.Color(1, 1, 1); // White (invisible on white background)
        }
        return new paper.Color(0, 0, 0); // Black
      
      case 'colorful':
        return createRandomColor();
      
      case 'monochrome':
        const gray = rnd();
        return new paper.Color(gray, gray, gray);
      
      default:
        return new paper.Color(0, 0, 0);
    }
  }

  setupControls() {
    this.controlsContainer.innerHTML = `
      <div class="control-group">
        <h4>Firework Settings</h4>
        
        <label for="nRays-slider">Number of Rays: <span id="nRays-value">${this.settings.nRays}</span></label>
        <input type="range" id="nRays-slider" min="3" max="25" value="${this.settings.nRays}">
        
        <label for="nElements-slider">Elements per Ray: <span id="nElements-value">${this.settings.nElements}</span></label>
        <input type="range" id="nElements-slider" min="2" max="12" value="${this.settings.nElements}">
        
        <label for="baseFontSize-slider">Base Font Size: <span id="baseFontSize-value">${this.settings.baseFontSize}</span></label>
        <input type="range" id="baseFontSize-slider" min="8" max="50" value="${this.settings.baseFontSize}">
        
        <label for="fontSizeScale-slider">Font Size Scale: <span id="fontSizeScale-value">${this.settings.fontSizeScale.toFixed(2)}</span></label>
        <input type="range" id="fontSizeScale-slider" min="1.0" max="3.0" step="0.1" value="${this.settings.fontSizeScale}">
        
        <label for="rotation-slider">Rotation: <span id="rotation-value">${this.settings.rotation.toFixed(0)}°</span></label>
        <input type="range" id="rotation-slider" min="0" max="360" value="${this.settings.rotation}">
        
        <label for="blanksProb-slider">Blanks Probability: <span id="blanksProb-value">${this.settings.blanksProb}%</span></label>
        <input type="range" id="blanksProb-slider" min="0" max="100" value="${this.settings.blanksProb}">
        
        <label>
          <input type="checkbox" id="useBlanks-checkbox" ${this.settings.useBlanks ? 'checked' : ''}>
          Use Blanks
        </label>
        
        <label for="colorMode-select">Color Mode:</label>
        <select id="colorMode-select">
          <option value="blackWhite" ${this.settings.colorMode === 'blackWhite' ? 'selected' : ''}>Black & White</option>
          <option value="colorful" ${this.settings.colorMode === 'colorful' ? 'selected' : ''}>Colorful</option>
          <option value="monochrome" ${this.settings.colorMode === 'monochrome' ? 'selected' : ''}>Monochrome</option>
        </select>
        
        <label for="textContent-input">Text Content:</label>
        <input type="text" id="textContent-input" value="${this.settings.textContent}" style="width: 100%; padding: 5px;">
      </div>
      
      <div class="control-group">
        <h4>Actions</h4>
        <button id="regenerate-btn">New Firework</button>
        <button id="save-btn">Save SVG</button>
      </div>
    `;

    // Add event listeners
    this.addControlListeners();
  }

  addControlListeners() {
    // Sliders
    const sliders = ['nRays', 'nElements', 'baseFontSize', 'fontSizeScale', 'rotation', 'blanksProb'];
    sliders.forEach(name => {
      const slider = document.getElementById(`${name}-slider`);
      const valueDisplay = document.getElementById(`${name}-value`);
      
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.settings[name] = value;
        
        // Update value display
        if (name === 'fontSizeScale') {
          valueDisplay.textContent = value.toFixed(2);
        } else if (name === 'rotation') {
          valueDisplay.textContent = value.toFixed(0) + '°';
        } else if (name === 'blanksProb') {
          valueDisplay.textContent = value + '%';
        } else {
          valueDisplay.textContent = value;
        }
        
        this.updateSketch();
      });
    });

    // Checkboxes
    document.getElementById('useBlanks-checkbox').addEventListener('change', (e) => {
      this.settings.useBlanks = e.target.checked;
      this.updateSketch();
    });

    // Select dropdowns
    document.getElementById('colorMode-select').addEventListener('change', (e) => {
      this.settings.colorMode = e.target.value;
      this.updateSketch();
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
      saveAsSVG('firework-paperjs');
    });
  }

  updateSketch() {
    this.createFirework();
  }

  newSketch() {
    // Generate new seed and settings
    this.seed.update();
    window.seed = this.seed;
    
    this.setupSettings();
    this.createFirework();
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