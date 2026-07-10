/**
 * Chronos - Responsive Digital Clock
 * Core Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const timePrimary = document.getElementById('timePrimary');
  const timeSeconds = document.getElementById('timeSeconds');
  const clockNote = document.getElementById('clockNote');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const fontSelector = document.getElementById('fontSelector');
  const noteInput = document.getElementById('noteInput');
  
  // Primary Color Selectors
  const primaryPresets = document.getElementById('primaryPresets');
  const primaryColorPicker = document.getElementById('primaryColorPicker');
  const primaryColorLabel = document.getElementById('primaryColorLabel');
  const primaryColorPreview = document.getElementById('primaryColorPreview');
  const primaryColorValue = document.getElementById('primaryColorValue');

  // Seconds Color Selectors
  const secondsPresets = document.getElementById('secondsPresets');
  const secondsColorPicker = document.getElementById('secondsColorPicker');
  const secondsColorLabel = document.getElementById('secondsColorLabel');
  const secondsColorPreview = document.getElementById('secondsColorPreview');
  const secondsColorValue = document.getElementById('secondsColorValue');

  // ==========================================================================
  // Configuration Mappings & State
  // ==========================================================================
  const fontFamilies = {
    'Orbitron': "'Orbitron', sans-serif",
    'Roboto Mono': "'Roboto Mono', monospace",
    'Digital-7': "'Digital-7', sans-serif",
    'Poppins': "'Poppins', sans-serif",
    'Montserrat': "'Montserrat', sans-serif",
    'JetBrains Mono': "'JetBrains Mono', monospace",
    'Space Grotesk': "'Space Grotesk', sans-serif"
  };

  const STORAGE_KEYS = {
    FONT: 'chronos_font',
    NOTE: 'chronos_note',
    PRIMARY_COLOR: 'chronos_primary_color',
    PRIMARY_CUSTOM: 'chronos_primary_custom',
    SECONDS_COLOR: 'chronos_seconds_color',
    SECONDS_CUSTOM: 'chronos_seconds_custom'
  };

  const presetColors = [
    '#ffffff', // White
    '#ff3b30', // Red
    '#007aff', // Blue
    '#34c759', // Green
    '#ffcc00', // Yellow
    '#32ade6', // Cyan
    '#ff9500', // Orange
    '#af52de', // Purple
    '#ff2d55'  // Pink
  ];

  // ==========================================================================
  // Precision Clock Ticker Loop
  // ==========================================================================
  let lastSecond = -1;

  function tick() {
    const now = new Date();
    const currentSecond = now.getSeconds();
    
    // Only update elements when seconds tick to maximize CPU efficiency
    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond;
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(currentSecond).padStart(2, '0');
      
      timePrimary.textContent = `${hours}:${minutes}`;
      timeSeconds.textContent = seconds;
    }
    
    requestAnimationFrame(tick);
  }

  // ==========================================================================
  // Customization Logic
  // ==========================================================================

  /**
   * Applies active display color properties for HH:MM segments and Note
   */
  function applyPrimaryColor(hexColor, isCustom = false) {
    document.documentElement.style.setProperty('--primary-color', hexColor);

    // Update active indicators in the primary presets
    const presetButtons = primaryPresets.querySelectorAll('.color-preset-btn');
    presetButtons.forEach(btn => {
      if (btn.getAttribute('data-color').toLowerCase() === hexColor.toLowerCase() && !isCustom) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      }
    });

    // Update custom color picker display
    if (isCustom) {
      primaryColorLabel.classList.add('active');
      primaryColorPreview.style.backgroundColor = hexColor;
      primaryColorValue.textContent = hexColor.toUpperCase();
      primaryColorPicker.value = hexColor;
    } else {
      primaryColorLabel.classList.remove('active');
    }

    localStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, hexColor);
  }

  /**
   * Applies active display color properties for SS segments
   */
  function applySecondsColor(hexColor, isCustom = false) {
    document.documentElement.style.setProperty('--seconds-color', hexColor);

    // Update active indicators in the seconds presets
    const presetButtons = secondsPresets.querySelectorAll('.color-preset-btn');
    presetButtons.forEach(btn => {
      if (btn.getAttribute('data-color').toLowerCase() === hexColor.toLowerCase() && !isCustom) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      }
    });

    // Update custom color picker display
    if (isCustom) {
      secondsColorLabel.classList.add('active');
      secondsColorPreview.style.backgroundColor = hexColor;
      secondsColorValue.textContent = hexColor.toUpperCase();
      secondsColorPicker.value = hexColor;
    } else {
      secondsColorLabel.classList.remove('active');
    }

    localStorage.setItem(STORAGE_KEYS.SECONDS_COLOR, hexColor);
  }

  /**
   * Sets current active typography and triggers LCD styling classes
   */
  function applyFont(fontName) {
    const family = fontFamilies[fontName] || fontFamilies['Orbitron'];
    document.documentElement.style.setProperty('--font-family', family);
    
    // Toggle layout style adjustments when Digital-7 is active
    if (fontName === 'Digital-7') {
      document.body.classList.add('body-font-digital-7');
    } else {
      document.body.classList.remove('body-font-digital-7');
    }

    fontSelector.value = fontName;
    localStorage.setItem(STORAGE_KEYS.FONT, fontName);
  }

  /**
   * Applies the note display text and updates cache
   */
  function applyNote(noteText) {
    clockNote.textContent = noteText;
    
    // Hide or show element based on whether note is empty to prevent blank gaps
    if (noteText.trim() === '') {
      clockNote.style.display = 'none';
    } else {
      clockNote.style.display = 'block';
    }
    
    noteInput.value = noteText;
    localStorage.setItem(STORAGE_KEYS.NOTE, noteText);
  }

  // ==========================================================================
  // Settings Panel Drawer Functions
  // ==========================================================================
  function openSettings() {
    settingsPanel.classList.add('open');
    settingsOverlay.classList.add('open');
    settingsPanel.setAttribute('aria-hidden', 'false');
    settingsToggleBtn.setAttribute('aria-expanded', 'true');
    setTimeout(() => fontSelector.focus(), 100);
  }

  function closeSettings() {
    settingsPanel.classList.remove('open');
    settingsOverlay.classList.remove('open');
    settingsPanel.setAttribute('aria-hidden', 'true');
    settingsToggleBtn.setAttribute('aria-expanded', 'false');
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  // Panel Open / Close controls
  settingsToggleBtn.addEventListener('click', openSettings);
  settingsCloseBtn.addEventListener('click', closeSettings);
  settingsOverlay.addEventListener('click', closeSettings);

  // Keyboard accessibility: escape closes settings panel
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPanel.classList.contains('open')) {
      closeSettings();
    }
  });

  // Font Selection dropdown
  fontSelector.addEventListener('change', (e) => {
    applyFont(e.target.value);
  });

  // Note Input field
  noteInput.addEventListener('input', (e) => {
    applyNote(e.target.value);
  });

  // Primary preset color selector clicks
  primaryPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-preset-btn');
    if (!btn) return;
    applyPrimaryColor(btn.getAttribute('data-color'), false);
  });

  // Primary custom color inputs
  primaryColorPicker.addEventListener('input', (e) => {
    applyPrimaryColor(e.target.value, true);
    localStorage.setItem(STORAGE_KEYS.PRIMARY_CUSTOM, e.target.value);
  });
  primaryColorPicker.addEventListener('change', (e) => {
    applyPrimaryColor(e.target.value, true);
    localStorage.setItem(STORAGE_KEYS.PRIMARY_CUSTOM, e.target.value);
  });

  // Seconds preset color selector clicks
  secondsPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-preset-btn');
    if (!btn) return;
    applySecondsColor(btn.getAttribute('data-color'), false);
  });

  // Seconds custom color inputs
  secondsColorPicker.addEventListener('input', (e) => {
    applySecondsColor(e.target.value, true);
    localStorage.setItem(STORAGE_KEYS.SECONDS_CUSTOM, e.target.value);
  });
  secondsColorPicker.addEventListener('change', (e) => {
    applySecondsColor(e.target.value, true);
    localStorage.setItem(STORAGE_KEYS.SECONDS_CUSTOM, e.target.value);
  });

  // ==========================================================================
  // Initialization Sequence
  // ==========================================================================
  function init() {
    // Read state caches
    const cachedFont = localStorage.getItem(STORAGE_KEYS.FONT) || 'Orbitron';
    const cachedNote = localStorage.getItem(STORAGE_KEYS.NOTE) || '';
    const cachedPrimary = localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR) || '#ffffff';
    const cachedPrimaryCustom = localStorage.getItem(STORAGE_KEYS.PRIMARY_CUSTOM) || '#ffffff';
    const cachedSeconds = localStorage.getItem(STORAGE_KEYS.SECONDS_COLOR) || '#ffffff';
    const cachedSecondsCustom = localStorage.getItem(STORAGE_KEYS.SECONDS_CUSTOM) || '#ffffff';

    // Apply color pickers initial background states
    primaryColorPicker.value = cachedPrimaryCustom;
    primaryColorPreview.style.backgroundColor = cachedPrimaryCustom;
    primaryColorValue.textContent = cachedPrimaryCustom.toUpperCase();

    secondsColorPicker.value = cachedSecondsCustom;
    secondsColorPreview.style.backgroundColor = cachedSecondsCustom;
    secondsColorValue.textContent = cachedSecondsCustom.toUpperCase();

    // Set configuration values
    applyFont(cachedFont);
    applyNote(cachedNote);

    const isPrimaryPreset = presetColors.some(c => c.toLowerCase() === cachedPrimary.toLowerCase());
    applyPrimaryColor(cachedPrimary, !isPrimaryPreset);

    const isSecondsPreset = presetColors.some(c => c.toLowerCase() === cachedSeconds.toLowerCase());
    applySecondsColor(cachedSeconds, !isSecondsPreset);

    // Run high-precision animation loops
    tick();
  }

  init();
});
