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
  const clockNoteList = document.getElementById('clockNoteList');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const fontSelector = document.getElementById('fontSelector');
  const noteInput = document.getElementById('noteInput');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const settingsNoteList = document.getElementById('settingsNoteList');
  const borderPath = document.getElementById('borderPath');
  const lineToggle = document.getElementById('lineToggle');
  const lineToggleText = document.getElementById('lineToggleText');
  
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

  // Line Color Selectors
  const linePresets = document.getElementById('linePresets');
  const lineColorPicker = document.getElementById('lineColorPicker');
  const lineColorLabel = document.getElementById('lineColorLabel');
  const lineColorPreview = document.getElementById('lineColorPreview');
  const lineColorValue = document.getElementById('lineColorValue');

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
    SECONDS_CUSTOM: 'chronos_seconds_custom',
    LINE_COLOR: 'chronos_line_color',
    LINE_CUSTOM: 'chronos_line_custom',
    LINE_ENABLED: 'chronos_line_enabled'
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

  let totalLength = 0;
  let lastSecond = -1;

  // ==========================================================================
  // Perimeter SVG Path Calculations
  // ==========================================================================
  function updatePath() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const inset = 2.5; // Preventing border clipping on screen edges
    
    // Draw: top-center -> top-right -> bottom-right -> bottom-left -> top-left -> top-center
    const d = `M ${w/2} ${inset} L ${w - inset} ${inset} L ${w - inset} ${h - inset} L ${inset} ${h - inset} L ${inset} ${inset} Z`;
    borderPath.setAttribute('d', d);
    
    totalLength = borderPath.getTotalLength();
    borderPath.style.strokeDasharray = totalLength;
  }

  // ==========================================================================
  // Precision Clock Ticker Loop
  // ==========================================================================
  function tick() {
    const now = new Date();
    const currentSecond = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // 1. Text update: only once per second to reduce layouts/repaints
    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond;
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(currentSecond).padStart(2, '0');
      
      timePrimary.textContent = `${hours}:${minutes}`;
      timeSeconds.textContent = seconds;
    }

    // 2. SVG border animation: updates smoothly on every frame (approx 60fps)
    if (totalLength > 0 && lineToggle.checked) {
      const preciseSeconds = currentSecond + milliseconds / 1000;
      const progress = preciseSeconds / 60;
      const dashoffset = totalLength * (1 - progress);
      borderPath.style.strokeDashoffset = dashoffset;
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
   * Applies active display color properties for perimeter trace line
   */
  function applyLineColor(hexColor, isCustom = false) {
    document.documentElement.style.setProperty('--line-color', hexColor);

    // Update active indicators in the line presets
    const presetButtons = linePresets.querySelectorAll('.color-preset-btn');
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
      lineColorLabel.classList.add('active');
      lineColorPreview.style.backgroundColor = hexColor;
      lineColorValue.textContent = hexColor.toUpperCase();
      lineColorPicker.value = hexColor;
    } else {
      lineColorLabel.classList.remove('active');
    }

    localStorage.setItem(STORAGE_KEYS.LINE_COLOR, hexColor);
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
   * Render Notes List
   */
  let notesData = [];

  function renderNotes() {
    clockNoteList.innerHTML = '';
    settingsNoteList.innerHTML = '';

    notesData.forEach((note, index) => {
      // Main Display Note Item
      const label = document.createElement('label');
      label.className = `note-item ${note.checked ? 'checked' : ''} ${index === 0 ? 'highlight' : ''}`;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'note-checkbox';
      checkbox.checked = note.checked;
      checkbox.addEventListener('change', (e) => {
        notesData[index].checked = e.target.checked;
        saveAndRenderNotes();
      });

      const span = document.createElement('span');
      span.className = 'note-text';
      span.textContent = note.text;

      label.appendChild(checkbox);
      label.appendChild(span);
      clockNoteList.appendChild(label);

      // Settings Display Note Item
      const li = document.createElement('li');
      li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.5rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);';
      
      const setSpan = document.createElement('span');
      setSpan.textContent = note.text;
      setSpan.style.cssText = `color: white; font-size: 0.9rem; font-family: 'Poppins', sans-serif; ${note.checked ? 'text-decoration: line-through; opacity: 0.5;' : ''}`;
      
      const delBtn = document.createElement('button');
      delBtn.innerHTML = '&times;';
      delBtn.style.cssText = 'background: rgba(255,0,0,0.2); border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
      delBtn.addEventListener('click', () => {
        notesData.splice(index, 1);
        saveAndRenderNotes();
      });

      li.appendChild(setSpan);
      li.appendChild(delBtn);
      settingsNoteList.appendChild(li);
    });
  }

  function saveAndRenderNotes() {
    localStorage.setItem(STORAGE_KEYS.NOTE, JSON.stringify(notesData));
    renderNotes();
  }

  function addNote(text) {
    if (!text.trim()) return;
    notesData.push({ id: Date.now(), text: text.trim(), checked: false });
    noteInput.value = '';
    saveAndRenderNotes();
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

  // Window Resize to recalculate perimeter length coordinates
  window.addEventListener('resize', updatePath);

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

  // Note Input field (Add Note)
  noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addNote(noteInput.value);
    }
  });

  addNoteBtn.addEventListener('click', () => {
    addNote(noteInput.value);
  });

  // Line Toggle
  lineToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    lineToggleText.textContent = isEnabled ? 'Enabled' : 'Disabled';
    borderPath.parentElement.style.opacity = isEnabled ? '1' : '0';
    localStorage.setItem(STORAGE_KEYS.LINE_ENABLED, isEnabled ? 'true' : 'false');
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

  // Line preset color selector clicks
  linePresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-preset-btn');
    if (!btn) return;
    applyLineColor(btn.getAttribute('data-color'), false);
  });

  // Line custom color inputs
  lineColorPicker.addEventListener('input', (e) => {
    applyLineColor(e.target.value, true);
    localStorage.setItem(STORAGE_KEYS.LINE_CUSTOM, e.target.value);
  });
  lineColorPicker.addEventListener('change', (e) => {
    applyLineColor(e.target.value, true);
    localStorage.setItem(STORAGE_KEYS.LINE_CUSTOM, e.target.value);
  });

  // ==========================================================================
  // Initialization Sequence
  // ==========================================================================
  function init() {
    // 1. Set up dimensions
    updatePath();

    // 2. Read state caches
    const cachedFont = localStorage.getItem(STORAGE_KEYS.FONT) || 'Orbitron';
    const cachedPrimary = localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR) || '#ffffff';
    const cachedPrimaryCustom = localStorage.getItem(STORAGE_KEYS.PRIMARY_CUSTOM) || '#ffffff';
    const cachedSeconds = localStorage.getItem(STORAGE_KEYS.SECONDS_COLOR) || '#ffffff';
    const cachedSecondsCustom = localStorage.getItem(STORAGE_KEYS.SECONDS_CUSTOM) || '#ffffff';
    const cachedLine = localStorage.getItem(STORAGE_KEYS.LINE_COLOR) || '#ffffff';
    const cachedLineCustom = localStorage.getItem(STORAGE_KEYS.LINE_CUSTOM) || '#ffffff';
    const cachedLineEnabled = localStorage.getItem(STORAGE_KEYS.LINE_ENABLED) !== 'false';

    // Parse Notes
    try {
      const cachedNote = localStorage.getItem(STORAGE_KEYS.NOTE);
      if (cachedNote) {
        if (cachedNote.startsWith('[')) {
          notesData = JSON.parse(cachedNote);
        } else {
          // Migration from old string format
          notesData = [{ id: Date.now(), text: cachedNote, checked: false }];
        }
      }
    } catch(e) {
      notesData = [];
    }

    // 3. Apply color pickers initial background states
    primaryColorPicker.value = cachedPrimaryCustom;
    primaryColorPreview.style.backgroundColor = cachedPrimaryCustom;
    primaryColorValue.textContent = cachedPrimaryCustom.toUpperCase();

    secondsColorPicker.value = cachedSecondsCustom;
    secondsColorPreview.style.backgroundColor = cachedSecondsCustom;
    secondsColorValue.textContent = cachedSecondsCustom.toUpperCase();

    lineColorPicker.value = cachedLineCustom;
    lineColorPreview.style.backgroundColor = cachedLineCustom;
    lineColorValue.textContent = cachedLineCustom.toUpperCase();

    // 4. Set configuration values
    applyFont(cachedFont);
    renderNotes();

    const isPrimaryPreset = presetColors.some(c => c.toLowerCase() === cachedPrimary.toLowerCase());
    applyPrimaryColor(cachedPrimary, !isPrimaryPreset);

    const isSecondsPreset = presetColors.some(c => c.toLowerCase() === cachedSeconds.toLowerCase());
    applySecondsColor(cachedSeconds, !isSecondsPreset);

    const isLinePreset = presetColors.some(c => c.toLowerCase() === cachedLine.toLowerCase());
    applyLineColor(cachedLine, !isLinePreset);

    // Apply Line Enabled State
    lineToggle.checked = cachedLineEnabled;
    lineToggleText.textContent = cachedLineEnabled ? 'Enabled' : 'Disabled';
    borderPath.parentElement.style.opacity = cachedLineEnabled ? '1' : '0';

    // 5. Run high-precision animation loops
    tick();
  }

  init();
});
