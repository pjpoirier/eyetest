// ============================================
// Color Utility Functions
// ============================================

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const n = parseInt(hex, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function relativeLum(r, g, b) {
  return [r, g, b]
    .map(c => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    })
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrastRatio(fg, bg) {
  const L1 = relativeLum(fg.r, fg.g, fg.b);
  const L2 = relativeLum(bg.r, bg.g, bg.b);
  const lo = Math.min(L1, L2);
  const hi = Math.max(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

// ============================================
// Accessibility Helpers
// ============================================

function announceToScreenReader(message) {
  const liveRegion = document.getElementById('srLiveRegion');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

function playAccessibilitySound(type = 'success') {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  if (type === 'success') {
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'change') {
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.setValueAtTime(0, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

// ============================================
// State Management
// ============================================

let fgRgb = { r: 255, g: 255, b: 255 };
let bgRgb = { r: 0, g: 0, b: 0 };
let accessibleMode = false;
let soundFeedbackEnabled = false;

// ============================================
// Main Update Function
// ============================================

function update() {
  const ratio = contrastRatio(fgRgb, bgRgb);
  const fh = rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b);
  const bh = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);

  // Update preview
  document.getElementById('previewBox').style.background = bh;
  document.getElementById('previewText').style.color = fh;
  document.getElementById('previewSmall').style.color = fh;

  // Update swatches
  document.getElementById('fgSwatch').style.background = fh;
  document.getElementById('bgSwatch').style.background = bh;

  // Update ratio display
  const ratioText = ratio.toFixed(2) + ':1';
  document.getElementById('ratioDisplay').textContent = ratioText;

  // Update compliance badges
  const pills = document.getElementById('pillsArea');
  let desc = '';
  let ph = '';

  if (ratio >= 7) {
    desc = 'AAA — excellent for all users';
    ph = '<span class="badge-pill pass">AAA large</span><span class="badge-pill pass">AAA normal</span>';
  } else if (ratio >= 4.5) {
    desc = 'AA — good for most users';
    ph = '<span class="badge-pill pass">AA large</span><span class="badge-pill pass">AA normal</span>';
  } else if (ratio >= 3) {
    desc = 'AA large text only';
    ph = '<span class="badge-pill pass">AA large</span><span class="badge-pill fail">AA normal ✗</span>';
  } else {
    desc = 'Insufficient contrast';
    ph = '<span class="badge-pill fail">Fails WCAG</span>';
  }

  pills.innerHTML = ph;
  document.getElementById('ratioDesc').textContent = desc;

  // Announce to screen reader
  announceToScreenReader(`Contrast ratio is ${ratioText}. ${desc}`);

  // Update WCAG levels
  const levels = [
    { title: 'AA normal text', req: '≥ 4.5:1', pass: ratio >= 4.5 },
    { title: 'AA large text (18pt+)', req: '≥ 3:1', pass: ratio >= 3 },
    { title: 'AAA normal text', req: '≥ 7:1', pass: ratio >= 7 },
    { title: 'AAA large text (18pt+)', req: '≥ 7:1', pass: ratio >= 7 }
  ];

  document.getElementById('levelsRow').innerHTML = levels
    .map(
      l =>
        `<div class="level-card">
          <div class="lvl-title">${l.title}</div>
          <div class="lvl-req">${l.req}</div>
          <div class="lvl-status ${l.pass ? 'pass' : 'fail'}">${l.pass ? '✓ Pass' : '✗ Fail'}</div>
        </div>`
    )
    .join('');

  // Update combo display
  document.getElementById('colorCombo').textContent = `Text: ${fh}  •  Background: ${bh}`;
}

// ============================================
// Color Application
// ============================================

function applyColor(fg, bg) {
  fgRgb = hexToRgb(fg);
  bgRgb = hexToRgb(bg);

  // Update hex inputs
  document.getElementById('fgHex').value = fg;
  document.getElementById('bgHex').value = bg;

  // Update color pickers
  document.getElementById('fgPicker').value = fg;
  document.getElementById('bgPicker').value = bg;

  // Update RGB sliders and displays
  ['R', 'G', 'B'].forEach(c => {
    const lc = c.toLowerCase();
    document.getElementById('fg' + c).value = fgRgb[lc];
    document.getElementById('fg' + c + 'v').textContent = fgRgb[lc];
    document.getElementById('bg' + c).value = bgRgb[lc];
    document.getElementById('bg' + c + 'v').textContent = bgRgb[lc];
  });

  update();

  if (soundFeedbackEnabled) {
    playAccessibilitySound('change');
  }
}

// ============================================
// Eye Condition Presets
// ============================================

const CONDITIONS = {
  low_vision_general: {
    note: '<strong>Low vision (general):</strong> High contrast with maximum brightness difference is key. Black backgrounds reduce glare. Yellow or white text on black is the gold standard.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Black on Yellow', fg: '#000000', bg: '#FFFF00' }
    ]
  },
  legal_blind: {
    note: '<strong>Legal blindness / severe low vision:</strong> Maximum contrast 21:1 is ideal. Pure white on pure black or vice versa. Avoid mid-tones entirely.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Black on White', fg: '#000000', bg: '#FFFFFF' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' }
    ]
  },
  macular_degen: {
    note: '<strong>Macular degeneration:</strong> Central vision is impaired. High contrast helps and avoiding fine detail in the center. Black backgrounds reduce eye strain.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Cyan on Black', fg: '#00FFFF', bg: '#000000' }
    ]
  },
  glaucoma: {
    note: '<strong>Glaucoma:</strong> Peripheral vision is reduced. Bright, high-contrast text on dark backgrounds helps. Avoid bright white backgrounds which can cause glare.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Lime on Black', fg: '#00FF00', bg: '#000000' }
    ]
  },
  diabetic_retino: {
    note: '<strong>Diabetic retinopathy:</strong> Patchy vision loss and reduced contrast sensitivity. Very high contrast ratios (10:1+) and large text are recommended.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Black on White', fg: '#000000', bg: '#FFFFFF' }
    ]
  },
  cataracts: {
    note: '<strong>Cataracts:</strong> Vision appears cloudy and yellowed. Blue-tinted backgrounds may appear gray. High contrast with warm-colored text on dark backgrounds works well.',
    combos: [
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Orange on Black', fg: '#FFA500', bg: '#000000' }
    ]
  },
  nystagmus: {
    note: '<strong>Nystagmus:</strong> Involuntary eye movement makes tracking text difficult. Dark backgrounds with high-contrast text reduce eye fatigue. Avoid white backgrounds.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Green on Black', fg: '#00FF00', bg: '#000000' }
    ]
  },
  protanopia: {
    note: '<strong>Protanopia (red-blind):</strong> Reds and greens appear similar. Avoid red/green combinations. Blue-yellow contrast is perceived well. Dark backgrounds help.',
    combos: [
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Cyan on Black', fg: '#00FFFF', bg: '#000000' }
    ]
  },
  deuteranopia: {
    note: '<strong>Deuteranopia (green-blind):</strong> Green and red look alike. Blue and yellow are the safest pair. Avoid any color coding that relies on red vs. green.',
    combos: [
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Blue on White', fg: '#0000FF', bg: '#FFFFFF' }
    ]
  },
  tritanopia: {
    note: '<strong>Tritanopia (blue-blind):</strong> Blue and yellow appear similar. Use red-white or black-white contrast. Avoid blue text on dark or black backgrounds.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Red on White', fg: '#FF0000', bg: '#FFFFFF' },
      { name: 'Black on White', fg: '#000000', bg: '#FFFFFF' }
    ]
  },
  achromatopsia: {
    note: '<strong>Achromatopsia (total color blindness):</strong> Only brightness and contrast matter — all color is invisible. Pure black on white or white on black at maximum contrast.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Black on White', fg: '#000000', bg: '#FFFFFF' }
    ]
  },
  photophobia: {
    note: '<strong>Photophobia (light sensitivity):</strong> Bright screens are painful. Use dark backgrounds with softer (not pure white) text. Avoid white or very bright backgrounds entirely.',
    combos: [
      { name: 'Light Gray on Black', fg: '#CCCCCC', bg: '#000000' },
      { name: 'White on Dark Gray', fg: '#FFFFFF', bg: '#1a1a1a' },
      { name: 'Pale Yellow on Black', fg: '#FFFFCC', bg: '#000000' }
    ]
  },
  albinism: {
    note: '<strong>Albinism:</strong> Associated with photophobia and reduced visual acuity. Dark mode is essential. Avoid all bright or white backgrounds. High contrast on very dark background.',
    combos: [
      { name: 'Light Gray on Black', fg: '#CCCCCC', bg: '#000000' },
      { name: 'White on Very Dark Gray', fg: '#FFFFFF', bg: '#0a0a0a' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' }
    ]
  },
  retinitis_pig: {
    note: '<strong>Retinitis pigmentosa:</strong> Tunnel vision and night blindness. High contrast on dark backgrounds. Bright text in the central field. Avoid dim or low-contrast combinations.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Cyan on Black', fg: '#00FFFF', bg: '#000000' }
    ]
  },
  hemianopia: {
    note: '<strong>Hemianopia:</strong> Half the visual field is missing. High contrast text helps the remaining field. Avoid any reliance on color position — maximize contrast everywhere.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Black on White', fg: '#000000', bg: '#FFFFFF' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' }
    ]
  },
  keratoconus: {
    note: '<strong>Keratoconus:</strong> Distorted, blurry vision due to corneal shape. High contrast helps. Dark backgrounds reduce glare and halos from light scatter.',
    combos: [
      { name: 'White on Black', fg: '#FFFFFF', bg: '#000000' },
      { name: 'Yellow on Black', fg: '#FFFF00', bg: '#000000' },
      { name: 'Lime on Black', fg: '#00FF00', bg: '#000000' }
    ]
  }
};

// ============================================
// Event Listeners - Condition Selection
// ============================================

document.getElementById('conditionSelect').addEventListener('change', function () {
  const val = this.value;
  const note = document.getElementById('conditionNote');
  const pills = document.getElementById('conditionPills');

  if (!val) {
    note.style.display = 'none';
    pills.innerHTML = '';
    announceToScreenReader('No condition selected');
    return;
  }

  const cond = CONDITIONS[val];
  note.style.display = 'block';
  note.innerHTML = cond.note;

  // Announce condition to screen reader
  announceToScreenReader(`Selected: ${this.options[this.selectedIndex].text}. ${cond.note.replace(/<[^>]*>/g, '')}`);

  pills.innerHTML = '';
  cond.combos.forEach((c, i) => {
    const fg = hexToRgb(c.fg);
    const bg = hexToRgb(c.bg);
    const r = contrastRatio(fg, bg).toFixed(1);

    const btn = document.createElement('button');
    btn.className = 'cpill' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `${c.name}, ${r}:1 contrast ratio`);
    btn.innerHTML = `<span class="cpill-swatch" style="background:${c.bg};color:${c.fg};">${c.name.split(' ')[0]}</span><span style="font-size:12px;">${c.name}</span><span class="cpill-ratio">${r}:1</span>`;

    btn.onclick = () => {
      document.querySelectorAll('.cpill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyColor(c.fg, c.bg);
      announceToScreenReader(`Applied preset: ${c.name} with ${r}:1 contrast ratio`);
    };

    pills.appendChild(btn);
  });

  applyColor(cond.combos[0].fg, cond.combos[0].bg);
});

// ============================================
// Event Listeners - Color Inputs (Hex)
// ============================================

function syncFg() {
  const h = document.getElementById('fgHex').value;
  if (!/^#[0-9A-Fa-f]{6}$/.test(h)) return;
  fgRgb = hexToRgb(h);
  ['R', 'G', 'B'].forEach(c => {
    const lc = c.toLowerCase();
    document.getElementById('fg' + c).value = fgRgb[lc];
    document.getElementById('fg' + c + 'v').textContent = fgRgb[lc];
  });
  document.getElementById('fgPicker').value = h;
  update();
}

function syncBg() {
  const h = document.getElementById('bgHex').value;
  if (!/^#[0-9A-Fa-f]{6}$/.test(h)) return;
  bgRgb = hexToRgb(h);
  ['R', 'G', 'B'].forEach(c => {
    const lc = c.toLowerCase();
    document.getElementById('bg' + c).value = bgRgb[lc];
    document.getElementById('bg' + c + 'v').textContent = bgRgb[lc];
  });
  document.getElementById('bgPicker').value = h;
  update();
}

// ============================================
// Event Listeners - RGB Sliders
// ============================================

['fgR', 'fgG', 'fgB'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    fgRgb = {
      r: +document.getElementById('fgR').value,
      g: +document.getElementById('fgG').value,
      b: +document.getElementById('fgB').value
    };
    const hex = rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b);
    document.getElementById('fgHex').value = hex;
    document.getElementById('fgPicker').value = hex;
    update();
  });
});

['bgR', 'bgG', 'bgB'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    bgRgb = {
      r: +document.getElementById('bgR').value,
      g: +document.getElementById('bgG').value,
      b: +document.getElementById('bgB').value
    };
    const hex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
    document.getElementById('bgHex').value = hex;
    document.getElementById('bgPicker').value = hex;
    update();
  });
});

document.getElementById('fgHex').addEventListener('input', syncFg);
document.getElementById('bgHex').addEventListener('input', syncBg);

document.getElementById('fgPicker').addEventListener('input', function () {
  document.getElementById('fgHex').value = this.value.toUpperCase();
  syncFg();
});

document.getElementById('bgPicker').addEventListener('input', function () {
  document.getElementById('bgHex').value = this.value.toUpperCase();
  syncBg();
});

// ============================================
// Copy to Clipboard
// ============================================

function copyCombo() {
  const text = document.getElementById('colorCombo').textContent;
  navigator.clipboard.writeText(text).catch(() => {
    console.error('Failed to copy');
  });

  const btn = document.querySelector('.copy-btn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> copied';

  announceToScreenReader('Color combination copied to clipboard');

  if (soundFeedbackEnabled) {
    playAccessibilitySound('success');
  }

  setTimeout(() => {
    btn.innerHTML = originalHTML;
  }, 2000);
}

// ============================================
// Accessible Mode Toggle
// ============================================

function toggleAccessibleMode() {
  accessibleMode = !accessibleMode;
  const body = document.body;
  const btn = document.getElementById('accessibleModeBtn');

  if (accessibleMode) {
    body.classList.add('accessible-mode-active');
    btn.classList.add('active');
    announceToScreenReader('Accessible mode enabled. Color pickers hidden, larger text and inputs displayed.');
  } else {
    body.classList.remove('accessible-mode-active');
    btn.classList.remove('active');
    announceToScreenReader('Accessible mode disabled.');
  }
}

// ============================================
// Sound Feedback Toggle
// ============================================

function toggleSoundFeedback() {
  soundFeedbackEnabled = !soundFeedbackEnabled;
  const btn = document.getElementById('soundFeedbackBtn');

  if (soundFeedbackEnabled) {
    btn.classList.add('active');
    announceToScreenReader('Sound feedback enabled');
    playAccessibilitySound('success');
  } else {
    btn.classList.remove('active');
    announceToScreenReader('Sound feedback disabled');
  }
}

// ============================================
// Reset Colors
// ============================================

function resetColors() {
  applyColor('#FFFFFF', '#000000');
  announceToScreenReader('Colors reset to white text on black background');
}

// ============================================
// Keyboard Navigation
// ============================================

document.addEventListener('keydown', e => {
  // Alt+A: Toggle accessible mode
  if (e.altKey && e.code === 'KeyA') {
    e.preventDefault();
    toggleAccessibleMode();
  }

  // Alt+S: Toggle sound
  if (e.altKey && e.code === 'KeyS') {
    e.preventDefault();
    toggleSoundFeedback();
  }

  // Alt+R: Reset
  if (e.altKey && e.code === 'KeyR') {
    e.preventDefault();
    resetColors();
  }

  // Arrow keys for sliders (when focused)
  if (e.target.type === 'range') {
    const slider = e.target;
    const step = parseInt(slider.step) || 1;
    let newValue = parseInt(slider.value);

    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      newValue = Math.min(newValue + step * 5, parseInt(slider.max));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      newValue = Math.max(newValue - step * 5, parseInt(slider.min));
    }

    slider.value = newValue;
    slider.dispatchEvent(new Event('input'));
  }
});

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  update();
});
