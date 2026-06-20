'use strict';

let selectedProp = 'background-color';

document.querySelectorAll('.prop-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedProp = btn.dataset.prop;
    document.querySelectorAll('.prop-btn').forEach(b =>
      b.classList.toggle('active', b === btn)
    );
  });
});

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

activeTab().then(tab => {
  if (tab?.url) {
    try {
      document.getElementById('url').textContent = new URL(tab.url).origin;
    } catch (_) {
      document.getElementById('url').textContent = tab.url;
    }
  }
});

const pickBtn = document.getElementById('pick-btn');
pickBtn.addEventListener('click', async () => {
  const tab = await activeTab();
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'startPick', property: selectedProp });
  window.close();
});

async function loadRules() {
  const tab = await activeTab();
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'getRules' }, resp => {
    if (chrome.runtime.lastError || !resp) return;
    renderRules(resp.rules || [], tab.id);
  });
}

function renderRules(rules, tabId) {
  const list = document.getElementById('rules-list');
  const resetBtn = document.getElementById('reset-btn');

  if (!rules.length) {
    list.innerHTML = '<div class="empty">Нет сохранённых правил</div>';
    resetBtn.style.display = 'none';
    return;
  }

  resetBtn.style.display = 'block';
  list.innerHTML = '';
  rules.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'rule';
    div.innerHTML =
      `<div class="swatch" style="background:${r.value}"></div>` +
      `<div class="rule-info">` +
      `<div class="rule-sel" title="${r.selector}">${r.selector}</div>` +
      `<div class="rule-prop">${r.property}: ${r.value}</div>` +
      `</div>` +
      `<button class="del" data-i="${i}">×</button>`;
    list.appendChild(div);
  });

  list.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', () => {
      chrome.tabs.sendMessage(tabId, { type: 'deleteRule', index: +btn.dataset.i }, () =>
        loadRules()
      );
    });
  });
}

document.getElementById('reset-btn').addEventListener('click', async () => {
  const tab = await activeTab();
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'resetRules' }, () => loadRules());
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'ruleSaved') loadRules();
});

loadRules();
