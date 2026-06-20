'use strict';

const STORAGE_KEY = 'iskra_customizer_rules';
const STYLE_ID = 'iskra-customizer-styles';
const PICKER_ID = 'iskra-color-picker';
const HIGHLIGHT_COLOR = '2px solid #ff6b35';

async function applyRules() {
  const origin = location.origin;
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const rules = (data[STORAGE_KEY] || {})[origin] || [];

  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = rules
    .map(r => `${r.selector} { ${r.property}: ${r.value} !important; }`)
    .join('\n');
}

function getSelector(el) {
  if (el.id) return '#' + CSS.escape(el.id);

  if (el.classList.length > 0) {
    const cls = '.' + Array.from(el.classList).map(CSS.escape).join('.');
    if (document.querySelectorAll(cls).length === 1) return cls;
  }

  const parts = [];
  let cur = el;
  while (cur && cur !== document.body) {
    let tag = cur.tagName.toLowerCase();
    const sibs = Array.from(cur.parentElement?.children || []).filter(
      s => s.tagName === cur.tagName
    );
    if (sibs.length > 1) tag += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
    parts.unshift(tag);
    cur = cur.parentElement;
  }
  return 'body > ' + parts.join(' > ');
}

let pickMode = false;
let pickProperty = 'background-color';
let hoveredEl = null;

function enterPickMode(property) {
  pickMode = true;
  pickProperty = property;
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mouseover', onOver, true);
  document.addEventListener('mouseout', onOut, true);
  document.addEventListener('click', onClick, true);
}

function exitPickMode() {
  pickMode = false;
  document.body.style.cursor = '';
  document.removeEventListener('mouseover', onOver, true);
  document.removeEventListener('mouseout', onOut, true);
  document.removeEventListener('click', onClick, true);
  if (hoveredEl) { hoveredEl.style.outline = ''; hoveredEl = null; }
  removePicker();
}

function onOver(e) {
  if (e.target === hoveredEl) return;
  if (hoveredEl) hoveredEl.style.outline = '';
  hoveredEl = e.target;
  hoveredEl.style.outline = HIGHLIGHT_COLOR;
}

function onOut() {
  if (hoveredEl) { hoveredEl.style.outline = ''; hoveredEl = null; }
}

function onClick(e) {
  // Ignore clicks inside our own picker UI
  if (document.getElementById(PICKER_ID)?.contains(e.target)) return;
  e.preventDefault();
  e.stopPropagation();

  // Remove pick listeners immediately so picker UI gets normal click events
  document.removeEventListener('mouseover', onOver, true);
  document.removeEventListener('mouseout', onOut, true);
  document.removeEventListener('click', onClick, true);
  if (hoveredEl) { hoveredEl.style.outline = ''; hoveredEl = null; }
  document.body.style.cursor = '';

  showPicker(e.target, getSelector(e.target), pickProperty);
}

function rgbToHex(rgb) {
  const m = String(rgb).match(/\d+/g);
  if (!m || m.length < 3) return '#ffffff';
  return '#' + m.slice(0, 3)
    .map(n => Math.min(255, parseInt(n, 10)).toString(16).padStart(2, '0'))
    .join('');
}

function getCurrentColor(el, property) {
  const raw = getComputedStyle(el).getPropertyValue(property).trim();
  if (!raw || raw === 'transparent' || raw === 'rgba(0, 0, 0, 0)') return '#ffffff';
  if (raw.startsWith('#')) return raw.slice(0, 7);
  if (raw.startsWith('rgb')) return rgbToHex(raw);
  return '#ffffff';
}

function showPicker(el, selector, property) {
  removePicker();
  const initColor = getCurrentColor(el, property);

  const picker = document.createElement('div');
  picker.id = PICKER_ID;
  picker.style.cssText =
    'position:fixed;top:20px;right:20px;z-index:2147483647;' +
    'background:#fff;border:1px solid #ccc;border-radius:8px;' +
    'padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.2);' +
    'font-family:sans-serif;font-size:14px;min-width:220px;';

  picker.innerHTML =
    '<div style="font-weight:bold;margin-bottom:8px;">Выбор цвета</div>' +
    `<div style="margin-bottom:6px;font-size:11px;color:#666;word-break:break-all;">${selector}</div>` +
    `<div style="margin-bottom:10px;font-size:11px;color:#888;">${property}</div>` +
    `<input type="color" id="iskra-ci" value="${initColor}" style="width:100%;height:40px;border:none;cursor:pointer;">` +
    '<div style="display:flex;gap:8px;margin-top:12px;">' +
    '<button id="iskra-save" style="flex:1;padding:8px;background:#ff6b35;color:#fff;border:none;border-radius:4px;cursor:pointer;">Сохранить</button>' +
    '<button id="iskra-cancel" style="flex:1;padding:8px;background:#eee;border:none;border-radius:4px;cursor:pointer;">Отмена</button>' +
    '</div>';

  document.body.appendChild(picker);

  const input = document.getElementById('iskra-ci');
  input.addEventListener('input', () => {
    el.style.setProperty(property, input.value, 'important');
  });

  document.getElementById('iskra-save').onclick = async () => {
    const value = input.value;
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const allRules = data[STORAGE_KEY] || {};
    const origin = location.origin;
    const rules = (allRules[origin] || []).filter(
      r => !(r.selector === selector && r.property === property)
    );
    rules.push({ selector, property, value });
    allRules[origin] = rules;
    await chrome.storage.local.set({ [STORAGE_KEY]: allRules });
    applyRules();
    exitPickMode();
    chrome.runtime.sendMessage({ type: 'ruleSaved' });
  };

  document.getElementById('iskra-cancel').onclick = () => {
    el.style.removeProperty(property);
    exitPickMode();
  };
}

function removePicker() {
  document.getElementById(PICKER_ID)?.remove();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'startPick') {
    enterPickMode(msg.property);
    sendResponse({ ok: true });
  } else if (msg.type === 'cancelPick') {
    exitPickMode();
    sendResponse({ ok: true });
  } else if (msg.type === 'getRules') {
    chrome.storage.local.get(STORAGE_KEY).then(data => {
      sendResponse({ rules: ((data[STORAGE_KEY] || {})[location.origin]) || [] });
    });
    return true;
  } else if (msg.type === 'deleteRule') {
    chrome.storage.local.get(STORAGE_KEY).then(async data => {
      const allRules = data[STORAGE_KEY] || {};
      const origin = location.origin;
      allRules[origin] = (allRules[origin] || []).filter((_, i) => i !== msg.index);
      await chrome.storage.local.set({ [STORAGE_KEY]: allRules });
      applyRules();
      sendResponse({ ok: true });
    });
    return true;
  } else if (msg.type === 'resetRules') {
    chrome.storage.local.get(STORAGE_KEY).then(async data => {
      const allRules = data[STORAGE_KEY] || {};
      delete allRules[location.origin];
      await chrome.storage.local.set({ [STORAGE_KEY]: allRules });
      applyRules();
      sendResponse({ ok: true });
    });
    return true;
  }
});

applyRules();
