// Utility functions for Paper.js projects

// Mathematical utilities
function map(val, minIn, maxIn, minOut, maxOut) {
  return (val - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rad(deg) {
  return deg * Math.PI / 180;
}

function deg(rad) {
  return rad * 180 / Math.PI;
}

function dist(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function constrain(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

// Paper.js specific utilities
function createRandomPoint(bounds) {
  return new paper.Point(
    rnd() * bounds.width,
    rnd() * bounds.height
  );
}

function createRandomPointInCircle(center, radius) {
  const angle = rnd() * Math.PI * 2;
  const r = rnd() * radius;
  return new paper.Point(
    center.x + Math.cos(angle) * r,
    center.y + Math.sin(angle) * r
  );
}

function createRandomColor() {
  return new paper.Color(rnd(), rnd(), rnd());
}

function createRandomColorFromPalette(palette) {
  const index = Math.floor(rnd() * palette.length);
  return new paper.Color(palette[index]);
}

// Animation utilities
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeIn(t) {
  return t * t;
}

function easeOut(t) {
  return t * (2 - t);
}

// Array utilities
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom(array) {
  return array[Math.floor(rnd() * array.length)];
}

// Paper.js text utilities
function createTextItem(text, position, style = {}) {
  const textItem = new paper.PointText(position);
  textItem.content = text;
  textItem.style = {
    fontFamily: style.fontFamily || 'LLAL-linear',
    fontSize: style.fontSize || 16,
    fillColor: style.fillColor || 'black',
    ...style
  };
  return textItem;
}

// Save utilities
function saveAsSVG(filename = 'paper-sketch') {
  const svg = paper.project.exportSVG({ asString: true });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  
  // Create filename with timestamp and seed
  const now = new Date();
  const timestamp = now.toLocaleString('sv-SE', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[:.]/g, '-').replace(/\s/g, '_');
  
  let hashStr = '';
  if (window.seed) {
    hashStr = '_' + window.seed.hash;
  }
  
  link.download = `${filename}${hashStr}_${timestamp}.svg`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Key handling utilities
function setupKeyHandlers() {
  document.addEventListener('keydown', (event) => {
    switch(event.key) {
      case 's':
      case 'S':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          saveAsSVG();
        }
        break;
      case 'r':
      case 'R':
        if (window.sketchManager) {
          window.sketchManager.reloadCurrentSketch();
        }
        break;
      case 'n':
      case 'N':
        if (window.sketchManager && window.sketchManager.currentSketch) {
          window.sketchManager.currentSketch.newSketch();
        }
        break;
    }
  });
}

// Canvas utilities
function setupCanvas() {
  const canvas = document.getElementById('paper-canvas');
  paper.setup(canvas);
  
  // Let Paper.js handle the resize with proper aspect ratio
  function resizeCanvas() {
    const canvas = document.getElementById('paper-canvas');
    
    // Get the canvas's actual rendered size (after flexbox layout)
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    
    // Update the Paper.js view size to match the canvas size
    paper.view.viewSize = new paper.Size(canvasWidth, canvasHeight);
  }
  
  // Initial resize after DOM is ready
  setTimeout(resizeCanvas, 0);
  
  // Listen for window resize events
  window.addEventListener('resize', resizeCanvas);
  
  // Listen for any layout changes that might affect the canvas container
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(document.body);
  }
  
  return canvas;
} 