let globalTimelineItems = [];

async function handleAuthAction(actionType) {
  const usernameInputEl = document.getElementById('authUsername');
  const passwordInputEl = document.getElementById('authPassword');
  const errorBox = document.getElementById('authErrorMsg');

  if (!usernameInputEl || !passwordInputEl) return;

  const username = usernameInputEl.value.trim();
  const password = passwordInputEl.value.trim();

  if (errorBox) {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
  }

  if (!username || !password) {
    if (errorBox) {
      errorBox.textContent = "⚠️ Identity fields cannot remain blank.";
      errorBox.classList.remove('hidden');
    }
    return;
  }

  const endpoint = actionType === 'login' ? '/api/auth/login' : '/api/auth/register';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!data.success) {
      if (errorBox) {
        errorBox.textContent = `🚨 ${data.error || 'Authentication denied.'}`;
        errorBox.classList.remove('hidden');
      }
      return;
    }

    if (actionType === 'register') {
      if (errorBox) {
        errorBox.classList.remove('hidden');
        errorBox.className = "text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-2.5 text-center";
        errorBox.textContent = "👤 Profile successfully initialized. Proceeding with credentials...";
      }
      passwordInputEl.value = '';
      return;
    }

    const user = data.user || { username, isPioneer: false, joinedSequence: null };
    
    const authWall = document.getElementById('authWallModal');
    if (authWall) authWall.style.display = 'none';

    const welcomePanel = document.getElementById('userWelcomePanel');
    if (welcomePanel) {
      let badgeHTML = user.isPioneer ? `
        <span class="ml-2 inline-flex items-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase">
          👑 Pioneer #${user.joinedSequence}
        </span>
      ` : '';
      welcomePanel.innerHTML = `
        <div class="flex items-center font-mono">
          <span class="text-slate-500">Node:</span>
          <span class="text-slate-300 font-bold ml-1.5">${user.username}</span>
          ${badgeHTML}
        </div>
      `;
    }

    await loadLiveTimeline();

  } catch (error) {
    if (errorBox) {
      errorBox.textContent = `🚨 Connection breakdown: ${error.message}`;
      errorBox.classList.remove('hidden');
    }
  }
}

async function loadLiveTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  try {
    const response = await fetch('/api/timeline');
    const data = await response.json();

    globalTimelineItems = data.items || [];
    renderFilteredTimeline();

  } catch (err) {
    container.innerHTML = `
      <div class="rounded-lg p-4 bg-rose-500/5 border border-rose-500/20 font-mono text-xs text-rose-400">
        🚨 Core System Failure: ${err.message}
      </div>
    `;
  }
}

function renderFilteredTimeline() {
  const container = document.getElementById('timelineContainer');
  const slider = document.getElementById('confidenceSlider');
  if (!container || !slider) return;

  const threshold = parseInt(slider.value) || 0;
  const filtered = globalTimelineItems.filter(item => (item.confidenceScore || 0) >= threshold);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="h-32 flex flex-col items-center justify-center text-slate-600 font-mono text-xs border border-dashed border-slate-900 rounded-xl">
        No logs matched current matrix conditions.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="p-4 rounded-xl bg-slate-950/40 border border-slate-900/80 hover:border-slate-800 transition duration-200 flex items-start justify-between">
      <div class="space-y-1.5">
        <h4 class="text-xs font-mono font-bold text-slate-200">${item.title}</h4>
        <div class="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
          <span>By: <span class="text-slate-400">${item.author}</span></span>
          <span>•</span>
          <span>Date: <span class="text-slate-400">${item.date}</span></span>
        </div>
      </div>
      <div class="flex items-center space-x-3 font-mono text-right">
        <span class="text-[10px] text-slate-600 bg-slate-950 px-1.5 py-0.5 border border-slate-900 rounded uppercase tracking-wider">${item.hash}</span>
        <span class="text-xs font-bold ${item.confidenceScore >= 90 ? 'text-cyan-400' : 'text-amber-500'}">${item.confidenceScore}%</span>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('confidenceSlider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const valDisplay = document.getElementById('confidenceVal');
      if (valDisplay) valDisplay.innerText = e.target.value + '%';
      renderFilteredTimeline();
    });
  }
});