// Text Path Sketch for Paper.js
// Aligns text along curved paths

class TextPathPaperSketch {
  constructor(controlsContainer) {
    this.controlsContainer = controlsContainer;
    this.items = [];
    this.seed = new Hash();
    window.seed = this.seed;
    
    this.settings = {
      text: "One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them",
      fontSize: 18,
      showPath: true,
      pathStyle: 'curve', // 'curve', 'circle', 'spiral'
      curveComplexity: 3,
      pathColor: '#ff0000',
      textColor: '#000000'
    };
  }

  init() {
    this.setupSettings();
    this.createArt();
    this.setupControls();
    this.updateHashDisplay();
  }

  setupSettings() {
    // Settings are already defined in constructor
  }

  createArt() {
    // Clear existing items
    this.items.forEach(item => item.remove());
    this.items = [];
    
    // Clear Paper.js project
    paper.project.clear();
    
    // Create path based on style
    let path;
    const bounds = paper.view.bounds;
    const center = bounds.center;
    
    switch(this.settings.pathStyle) {
      case 'curve':
        path = this.createCurvePath();
        break;
      case 'circle':
        path = this.createCirclePath();
        break;
      case 'spiral':
        path = this.createSpiralPath();
        break;
      default:
        path = this.createCurvePath();
    }
    
    // Style the path
    if (this.settings.showPath) {
      path.strokeColor = this.settings.pathColor;
      path.strokeWidth = 2;
    } else {
      path.strokeColor = null;
    }
    
    this.items.push(path);
    
    // Create aligned text
    this.createAlignedText(this.settings.text, path, {
      fontSize: this.settings.fontSize,
      fontFamily: 'LLAL-linear',
      fillColor: this.settings.textColor
    });
  }

  createCurvePath() {
    const bounds = paper.view.bounds;
    const complexity = this.settings.curveComplexity;
    
    // Create a complex curve with multiple control points
    const points = [];
    const segments = [];
    
    for (let i = 0; i <= complexity; i++) {
      const x = bounds.left + (bounds.width / complexity) * i + (rnd() - 0.5) * bounds.width * 0.2;
      const y = bounds.center.y + (rnd() - 0.5) * bounds.height * 0.6;
      points.push(new paper.Point(x, y));
    }
    
    // Create segments with handles for smooth curves
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let handleIn = null;
      let handleOut = null;
      
      if (i > 0) {
        const prevPoint = points[i - 1];
        const distance = point.getDistance(prevPoint) * 0.3;
        const angle = prevPoint.getDirectedAngle(point) + 180 + (rnd() - 0.5) * 30;
        handleIn = new paper.Point(
          distance * Math.cos(rad(angle)),
          distance * Math.sin(rad(angle))
        );
      }
      
      if (i < points.length - 1) {
        const nextPoint = points[i + 1];
        const distance = point.getDistance(nextPoint) * 0.3;
        const angle = point.getDirectedAngle(nextPoint) + (rnd() - 0.5) * 30;
        handleOut = new paper.Point(
          distance * Math.cos(rad(angle)),
          distance * Math.sin(rad(angle))
        );
      }
      
      segments.push(new paper.Segment(point, handleIn, handleOut));
    }
    
    return new paper.Path(segments);
  }

  createCirclePath() {
    const bounds = paper.view.bounds;
    const radius = Math.min(bounds.width, bounds.height) * 0.3;
    const center = bounds.center;
    
    return new paper.Path.Circle(center, radius);
  }

  createSpiralPath() {
    const bounds = paper.view.bounds;
    const center = bounds.center;
    const maxRadius = Math.min(bounds.width, bounds.height) * 0.4;
    const turns = 3;
    const points = [];
    
    for (let i = 0; i <= turns * 360; i += 5) {
      const angle = rad(i);
      const radius = (i / (turns * 360)) * maxRadius;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      points.push(new paper.Point(x, y));
    }
    
    return new paper.Path(points);
  }

  createAlignedText(str, path, style) {
    if (str && str.length > 0 && path) {
      // create PointText object for each glyph
      var glyphTexts = [];
      for (var i = 0; i < str.length; i++) {
        glyphTexts[i] = this.createPointText(str.substring(i, i+1), style);
        glyphTexts[i].justification = "center";
        this.items.push(glyphTexts[i]);
      }
      
      // for each glyph find center xOffset
      var xOffsets = [0];
      for (var i = 1; i < str.length; i++) {
        var pairText = this.createPointText(str.substring(i - 1, i + 1), style);
        pairText.remove();
        xOffsets[i] = xOffsets[i - 1] + pairText.bounds.width - 
          glyphTexts[i - 1].bounds.width / 2 - glyphTexts[i].bounds.width / 2;
      }
      
      // set point for each glyph and rotate glyph around the point
      for (var i = 0; i < str.length; i++) {
        var centerOffs = xOffsets[i];
        if (path.length < centerOffs) {
          if (path.closed) {
            centerOffs = centerOffs % path.length;
          } else {
            centerOffs = undefined;
          }
        }
        if (centerOffs === undefined) {
          glyphTexts[i].remove();
          // Remove from items array too
          const index = this.items.indexOf(glyphTexts[i]);
          if (index > -1) {
            this.items.splice(index, 1);
          }
        } else {
          var pathPoint = path.getPointAt(centerOffs);
          glyphTexts[i].point = pathPoint;
          var tan = path.getTangentAt(centerOffs); 
          glyphTexts[i].rotate(tan.angle, pathPoint);
        }
      }
    }
  }

  // create a PointText object for a string and a style
  createPointText(str, style) {
    var text = new paper.PointText();
    text.content = str;
    if (style) {
      if (style.font) text.font = style.font;
      if (style.fontFamily) text.fontFamily = style.fontFamily;
      if (style.fontSize) text.fontSize = style.fontSize;
      if (style.fontWeight) text.fontWeight = style.fontWeight;
      if (style.fillColor) text.fillColor = style.fillColor;
    }
    return text;
  }

  setupControls() {
    this.controlsContainer.innerHTML = `
      <div class="control-group">
        <h4>Text Settings</h4>
        
        <label>
          Text Content:
          <textarea id="text-input" rows="3" style="width: 100%; margin-top: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">${this.settings.text}</textarea>
        </label>
        
        <label>
          Font Size: <span id="fontSize-value">${this.settings.fontSize}</span>
          <input type="range" id="fontSize-slider" min="8" max="48" value="${this.settings.fontSize}" style="width: 100%;">
        </label>
        
        <label>
          Text Color:
          <input type="color" id="textColor-input" value="${this.settings.textColor}" style="width: 50px; height: 30px;">
        </label>
      </div>

      <div class="control-group">
        <h4>Path Settings</h4>
        
        <label>
          Path Style:
          <select id="pathStyle-select" style="width: 100%; padding: 5px; margin-top: 5px;">
            <option value="curve" ${this.settings.pathStyle === 'curve' ? 'selected' : ''}>Curve</option>
            <option value="circle" ${this.settings.pathStyle === 'circle' ? 'selected' : ''}>Circle</option>
            <option value="spiral" ${this.settings.pathStyle === 'spiral' ? 'selected' : ''}>Spiral</option>
          </select>
        </label>
        
        <label>
          Curve Complexity: <span id="curveComplexity-value">${this.settings.curveComplexity}</span>
          <input type="range" id="curveComplexity-slider" min="2" max="8" value="${this.settings.curveComplexity}" style="width: 100%;">
        </label>
        
        <label>
          <input type="checkbox" id="showPath-checkbox" ${this.settings.showPath ? 'checked' : ''}> Show Path
        </label>
        
        <label>
          Path Color:
          <input type="color" id="pathColor-input" value="${this.settings.pathColor}" style="width: 50px; height: 30px;">
        </label>
      </div>

      <div class="control-group">
        <h4>Actions</h4>
        <button id="new-sketch-btn">New Text Path</button>
        <button id="save-svg-btn">Save SVG</button>
      </div>
    `;

    // Set up event listeners
    document.getElementById('text-input').addEventListener('input', (e) => {
      this.settings.text = e.target.value;
      this.updateSketch();
    });

    document.getElementById('fontSize-slider').addEventListener('input', (e) => {
      this.settings.fontSize = parseInt(e.target.value);
      document.getElementById('fontSize-value').textContent = this.settings.fontSize;
      this.updateSketch();
    });

    document.getElementById('textColor-input').addEventListener('change', (e) => {
      this.settings.textColor = e.target.value;
      this.updateSketch();
    });

    document.getElementById('pathStyle-select').addEventListener('change', (e) => {
      this.settings.pathStyle = e.target.value;
      this.updateSketch();
    });

    document.getElementById('curveComplexity-slider').addEventListener('input', (e) => {
      this.settings.curveComplexity = parseInt(e.target.value);
      document.getElementById('curveComplexity-value').textContent = this.settings.curveComplexity;
      if (this.settings.pathStyle === 'curve') {
        this.updateSketch();
      }
    });

    document.getElementById('showPath-checkbox').addEventListener('change', (e) => {
      this.settings.showPath = e.target.checked;
      this.updateSketch();
    });

    document.getElementById('pathColor-input').addEventListener('change', (e) => {
      this.settings.pathColor = e.target.value;
      this.updateSketch();
    });

    document.getElementById('new-sketch-btn').addEventListener('click', () => {
      this.newSketch();
    });

    document.getElementById('save-svg-btn').addEventListener('click', () => {
      saveAsSVG('text-path-sketch');
    });
  }

  updateSketch() {
    this.createArt();
  }

  newSketch() {
    this.seed.update();
    window.seed = this.seed;
    this.updateHashDisplay();
    this.createArt();
  }

  updateHashDisplay() {
    const hashDisplay = document.getElementById('hash-display');
    if (hashDisplay && this.seed) {
      hashDisplay.textContent = `Seed: ${this.seed.hash}`;
    }
  }

  cleanup() {
    this.items.forEach(item => item.remove());
    this.items = [];
  }
} 