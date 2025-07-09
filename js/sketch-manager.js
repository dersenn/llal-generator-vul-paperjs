// Sketch Manager for Paper.js projects
// Adapted from the original SVG version

class SketchManager {
  constructor() {
    this.currentSketch = null;
    this.currentSketchName = null;
    this.sketches = {};
    this.controls = document.getElementById('sketch-controls');
    this.sketchSelect = document.getElementById('sketch-select');
    
    // Set global reference
    window.sketchManager = this;
    
    this.init();
  }

  init() {
    // Setup Paper.js canvas
    setupCanvas();
    
    // Load all available sketches
    this.loadSketches();
    
    // Set up event listeners
    this.sketchSelect.addEventListener('change', (e) => {
      this.loadSketch(e.target.value);
    });
    
    // Setup keyboard shortcuts
    setupKeyHandlers();
    
    // Load sketch from URL or default to first sketch
    const urlParams = new URLSearchParams(window.location.search);
    const sketchFromUrl = urlParams.get('sketch');
    const defaultSketch = this.sketches[sketchFromUrl] ? sketchFromUrl : Object.keys(this.sketches)[0];
    
    this.loadSketch(defaultSketch);
  }

  loadSketches() {
    // Automatically discover and register sketches
    const sketchDefinitions = [
      {
        name: 'firework-paperjs',
        displayName: 'Firework (Paper.js)',
        class: typeof FireworkPaperSketch !== 'undefined' ? FireworkPaperSketch : null,
        description: 'Firework pattern with LLAL text using Paper.js'
      },
      {
        name: 'arc-paperjs',
        displayName: 'Arc Text (Paper.js)',
        class: typeof ArcPaperSketch !== 'undefined' ? ArcPaperSketch : null,
        description: 'Arc text layout with cone pattern using Paper.js'
      },
      {
        name: 'text-path-paperjs',
        displayName: 'Text Path (Paper.js)',
        class: typeof TextPathPaperSketch !== 'undefined' ? TextPathPaperSketch : null,
        description: 'Text aligned along curved paths using Paper.js'
      }
      // To add a new sketch, add an entry here:
      // {
      //   name: 'my-new-sketch',
      //   displayName: 'My New Sketch',
      //   class: MyNewSketch,
      //   description: 'Description of my new sketch'
      // }
    ];

    // Register sketches
    this.sketches = {};
    sketchDefinitions.forEach(sketch => {
      if (sketch.class) {
        this.sketches[sketch.name] = {
          name: sketch.displayName,
          class: sketch.class,
          description: sketch.description
        };
      }
    });

    // Update the dropdown options
    this.updateSketchDropdown();
  }

  updateSketchDropdown() {
    // Clear existing options
    this.sketchSelect.innerHTML = '';
    
    // Add options for each sketch
    Object.entries(this.sketches).forEach(([key, sketch]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = sketch.name;
      this.sketchSelect.appendChild(option);
    });
  }

  loadSketch(sketchName, useNewSeed = false) {
    // Clear current sketch
    if (this.currentSketch && this.currentSketch.cleanup) {
      this.currentSketch.cleanup();
    }

    // Clear Paper.js project
    if (paper.project) {
      paper.project.clear();
    }

    // Clear controls
    this.controls.innerHTML = '';

    try {
      // Get the sketch class
      const SketchClass = this.sketches[sketchName].class;
      
      if (!SketchClass) {
        throw new Error(`Sketch class not found for: ${sketchName}`);
      }
      
      // Initialize the new sketch
      this.currentSketch = new SketchClass(this.controls);
      
      // If we want a new seed, generate it and regenerate the random number generator
      if (useNewSeed && this.currentSketch.seed) {
        this.currentSketch.seed.update();
        // Regenerate the random number generator with the new hash
        this.currentSketch.seed.hashTrunc = this.currentSketch.seed.hash.slice(2);
        this.currentSketch.seed.regex = new RegExp('.{' + ((this.currentSketch.seed.hashTrunc.length / 4) | 0) + '}', 'g');
        this.currentSketch.seed.hashes = this.currentSketch.seed.hashTrunc.match(this.currentSketch.seed.regex).map((h) => this.currentSketch.seed.b58dec(h));
        this.currentSketch.seed.rnd = this.currentSketch.seed.sfc32(...this.currentSketch.seed.hashes);
      }
      
      // Set global seed for utility functions to access
      if (this.currentSketch.seed) {
        window.seed = this.currentSketch.seed;
      }
      
      this.currentSketch.init();
      this.currentSketchName = sketchName;
      
      // Update URL with current sketch and seed
      this.updateURL();
      
      // Update dropdown to match current sketch
      this.sketchSelect.value = sketchName;
      
      console.log(`Loaded sketch: ${sketchName}${useNewSeed ? ' with new seed' : ''}`);
    } catch (error) {
      console.error(`Failed to load sketch ${sketchName}:`, error);
      this.controls.innerHTML = `<div class="control-group"><p>Error loading sketch: ${error.message}</p></div>`;
    }
  }

  updateURL() {
    const url = new URL(window.location.href);
    
    // Update sketch parameter
    if (this.currentSketchName) {
      url.searchParams.set('sketch', this.currentSketchName);
    }
    
    // Update seed parameter
    if (this.currentSketch && this.currentSketch.seed) {
      url.searchParams.set('seed', this.currentSketch.seed.hash);
    }
    
    // Update URL without reloading the page
    window.history.replaceState({}, '', url);
  }

  reloadCurrentSketch() {
    if (this.currentSketchName) {
      // Preserve current settings if the sketch has them
      let preservedSettings = null;
      if (this.currentSketch && this.currentSketch.settings) {
        preservedSettings = { ...this.currentSketch.settings };
      }
      
      this.loadSketch(this.currentSketchName, true);
      
      // Restore settings if we had them
      if (preservedSettings && this.currentSketch && this.currentSketch.settings) {
        this.currentSketch.settings = { ...this.currentSketch.settings, ...preservedSettings };
        
        // Update all control inputs to reflect the restored settings
        this.updateControlsFromSettings();
        
        // Update the sketch with restored settings
        if (this.currentSketch.updateSketch) {
          this.currentSketch.updateSketch();
        }
      }
    }
  }

  updateControlsFromSettings() {
    if (!this.currentSketch || !this.currentSketch.settings) return;
    
    const settings = this.currentSketch.settings;
    
    // Update all control inputs based on settings
    Object.keys(settings).forEach(key => {
      const slider = document.getElementById(`${key}-slider`);
      const input = document.getElementById(`${key}-input`);
      const checkbox = document.getElementById(`${key}-checkbox`);
      
      if (slider && input && typeof settings[key] === 'number') {
        slider.value = settings[key];
        input.value = settings[key];
      } else if (checkbox && typeof settings[key] === 'boolean') {
        checkbox.checked = settings[key];
      }
    });
  }

  getCurrentSketch() {
    return this.currentSketch;
  }
} 