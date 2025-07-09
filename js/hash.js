// Hash utility class for reproducible randomness
// Adapted for Paper.js project from the original SVG engine

class Hash {
  constructor() {
    this.hash = null;
    this.hashTrunc = null;
    this.regex = null;
    this.hashes = null;
    this.rnd = null;
    this.init();
  }

  init() {
    this.hash = this.new();
    this.hashTrunc = this.hash.slice(2);
    this.regex = new RegExp('.{' + ((this.hashTrunc.length / 4) | 0) + '}', 'g');
    this.hashes = this.hashTrunc.match(this.regex).map((h) => this.b58dec(h));
    this.rnd = this.sfc32(...this.hashes);
  }

  new() {
    // Create a new hash based on timestamp and random values
    const timestamp = Date.now().toString();
    const randomVal = Math.random().toString();
    const combined = timestamp + randomVal;
    
    // Simple hash generation (in real use, you might want a more sophisticated hash)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  update() {
    this.hash = this.new();
    this.hashTrunc = this.hash.slice(2);
    this.regex = new RegExp('.{' + ((this.hashTrunc.length / 4) | 0) + '}', 'g');
    this.hashes = this.hashTrunc.match(this.regex).map((h) => this.b58dec(h));
    this.rnd = this.sfc32(...this.hashes);
  }

  b58dec = (str) =>
    [...str].reduce(
      (p, c) => p * 58 + '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.indexOf(c),
      0
    );

  sfc32 = (a, b, c, d) => {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  };
}

// Global random functions that use the seeded random number generator
function rnd() {
  if (window.seed && window.seed.rnd) {
    return window.seed.rnd();
  }
  return Math.random();
}

function rndInt(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

function coinToss(chance = 50) {
  return rnd() * 100 < chance;
} 