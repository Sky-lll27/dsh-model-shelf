window.__ModuleLoader__.load({
  id: 'dsh-model-shelf',
  factory(require) {
    const R = require('react');
    const { createPortal } = require('react-dom');
    const h = R.createElement;
    const KEY = 'dsh-model-shelf.preferences.v1';
    const defaults = () => ({ version: 1, providers: [], models: {}, collapsed: {}, hidden: {}, labels: {} });
    const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const modelKey = (p, m) => JSON.stringify([p, m]);
    function readPreferences() {
      try {
        const data = JSON.parse(localStorage.getItem(KEY));
        if (!data || data.version !== 1) return defaults();
        const result = defaults();
        result.providers = Array.isArray(data.providers) ? data.providers.filter(x => typeof x === 'string') : [];
        for (const field of ['models', 'collapsed', 'hidden', 'labels']) {
          if (!data[field] || typeof data[field] !== 'object' || Array.isArray(data[field])) continue;
          result[field] = Object.fromEntries(Object.entries(data[field]).filter(([k, v]) => field === 'models' ? Array.isArray(v) && v.every(x => typeof x === 'string') : field === 'labels' ? typeof v === 'string' : typeof v === 'boolean'));
        }
        return result;
      } catch { return defaults(); }
    }
    let preferences = readPreferences();
    let storageError = '';
    const listeners = new Set();
    function notify() { for (const fn of listeners) fn(); }
    function update(fn) {
      preferences = fn(preferences);
      try { localStorage.setItem(KEY, JSON.stringify(preferences)); storageError = ''; }
      catch { storageError = '浏览器不允许保存，当前改动只在本次打开期间保留。'; }
      notify();
    }
    function setMap(field, key, value) { update(p => ({ ...p, [field]: { ...p[field], [key]: value } })); }
    function ordered(items, ids = []) {
      const positions = new Map(ids.map((id, i) => [id, i]));
      return items.map((item, i) => ({ item, i })).sort((a, b) => (positions.get(a.item.id) ?? ids.length + a.i) - (positions.get(b.item.id) ?? ids.length + b.i)).map(x => x.item);
    }
    function move(ids, from, target, after) {
      if (from === target || !ids.includes(from) || !ids.includes(target)) return ids;
      const next = ids.filter(x => x !== from);
      next.splice(next.indexOf(target) + (after ? 1 : 0), 0, from);
      return next;
    }
    const css = `
.ms-seat{display:inline-flex;align-items:center;gap:4px;min-width:0}.ms-trigger{display:inline-flex;align-items:center;gap:5px;background:transparent;border:0;border-radius:6px;padding:5px 8px;color:var(--dsw-alias-label-secondary,#b4bdcc);font:inherit;font-size:13px;cursor:pointer;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ms-trigger:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff0b)}.ms-trigger:disabled{opacity:.45;cursor:default}.ms-menu{position:fixed;z-index:1600;width:410px;max-width:calc(100vw - 24px);display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l1,#ffffff25);border-radius:13px;background:var(--dsw-alias-bg-layer-2,#24272e);color:var(--dsw-alias-label-primary,#e5e9f1);box-shadow:0 12px 55px #0006;font:13px/1.5 "Microsoft YaHei",sans-serif;overflow:hidden;isolation:isolate}.ms-menu *{box-sizing:border-box}.ms-menu button,.ms-menu input,.ms-effort{font:inherit}.ms-head,.ms-controls,.ms-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 13px}.ms-head strong{font-size:14px}.ms-actions{display:flex;gap:5px}.ms-btn{border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary,#a5afc1);padding:4px 7px;cursor:pointer;font-size:11px!important}.ms-btn:hover,.ms-btn.active{background:#8cafff20;color:#9fbfff}.ms-search{margin:0 12px;padding:8px 10px;background:var(--ms-input-bg,#191c22);color:inherit;border:1px solid var(--dsw-alias-border-l1,#ffffff18);border-radius:7px;min-height:34px}.ms-controls{font-size:11px;color:var(--dsw-alias-label-tertiary,#929daf);padding-top:8px;padding-bottom:8px}.ms-controls label{display:flex;align-items:center;gap:5px;cursor:pointer}.ms-controls input{accent-color:#8cafff}.ms-list{overflow:auto;overscroll-behavior:contain;min-height:35px;flex:1;padding:0 7px 7px}.ms-group{border-top:1px solid #8888881a}.ms-group-head{width:100%;display:flex;align-items:center;gap:8px;padding:10px 7px;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;cursor:pointer}.ms-group-head:hover,.ms-row:hover{background:#88888812}.ms-count{font-size:10px;opacity:.5}.ms-caret{font-size:10px;opacity:.6;width:12px}.ms-current{margin-left:auto;color:#9ebcff;font-size:10px}.ms-row{display:flex;align-items:center;gap:7px;border-radius:6px;margin:1px 0;min-height:44px;padding:7px 8px 7px 25px}.ms-row.selected{background:#8cafff13}.ms-row.is-hidden .ms-name{text-decoration:line-through;opacity:.45}.ms-pick{flex:1;min-width:0;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;padding:0}.ms-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ms-sub{font-size:10px;opacity:.45;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ms-label{width:65px;flex-shrink:0;background:transparent;color:inherit;border:1px solid #88888840;border-radius:4px;padding:3px 4px;text-align:center;font-size:11px!important}.ms-label::placeholder{color:#8490a2;opacity:.65}.ms-label:focus{outline:1px solid #8cafff}.ms-handle{color:#929fb4;cursor:grab;letter-spacing:-3px;font-size:16px;flex-shrink:0}.ms-row.editing{padding-left:8px}.ms-row.editing .ms-pick{pointer-events:none}.ms-check{color:#9ebcff;width:12px;flex-shrink:0}.ms-foot{border-top:1px solid #88888820;font-size:10px;color:var(--dsw-alias-label-tertiary,#929daf)}.ms-message{padding:8px 13px;font-size:11px;white-space:pre-wrap;color:#d2ad83}.ms-help{padding:0 13px 7px;color:#91afe0;font-size:10px}.ms-empty{padding:20px 12px;text-align:center;opacity:.6}.ms-drop{box-shadow:inset 0 2px #8cafff}.ms-dragging{opacity:.35}.ms-effort{max-width:120px;background:var(--dsw-alias-bg-layer-2,#24272e);color:var(--dsw-alias-label-secondary,#b4bdcc);border:1px solid #88888825;border-radius:5px;font-size:11px;padding:3px}.ms-menu button:focus-visible{outline:2px solid #8cafff;outline-offset:-2px}
`;
    function Chevron({ open }) { return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { flexShrink: 0, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' } }, h('path', { d: 'M4 6l4 4 4-4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })); }
    function Seat({ available, locked, directory, load, select, sessionId }) {
      const state = R.useSyncExternalStore(fn => directory.subscribe(fn), () => directory.getSnapshot());
      const prefs = R.useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => preferences);
      const [open, setOpen] = R.useState(false);
      const [editing, setEditing] = R.useState(false);
      const [showHidden, setShowHidden] = R.useState(false);
      const [query, setQuery] = R.useState('');
      const [error, setError] = R.useState('');
      const [busy, setBusy] = R.useState(false);
      const [position, setPosition] = R.useState({ left: 12, top: 12, maxHeight: 500 });
      const anchor = R.useRef(null), menu = R.useRef(null), drag = R.useRef(null), search = R.useRef(null), mounted = R.useRef(true);
      const groups = ordered(state.groups || [], prefs.providers);
      const current = state.current;
      const currentGroup = groups.find(g => g.id === current?.provider);
      const currentModel = currentGroup?.models.find(m => m.id === current?.model);
      const disabled = !available || locked || busy || state.pending != null;
      R.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
      R.useEffect(() => { load(); setOpen(false); setError(''); }, [sessionId]);
      R.useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
      R.useEffect(() => {
        if (!open) return;
        function place() {
          const rect = anchor.current?.getBoundingClientRect();
          if (!rect) return;
          const above = rect.top - 12, below = innerHeight - rect.bottom - 12;
          const useAbove = above >= Math.min(350, below);
          const maxHeight = Math.min(560, Math.max(120, useAbove ? above - 6 : below - 6));
          const rgb = getComputedStyle(anchor.current).color.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [180, 190, 200];
          const light = (rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114) < 145;
          const surface = light ? '#ffffff' : '#24272e';
          setPosition({ left: Math.max(12, Math.min(rect.left, innerWidth - Math.min(410, innerWidth - 24) - 12)), top: useAbove ? undefined : rect.bottom + 6, bottom: useAbove ? innerHeight - rect.top + 6 : undefined, maxHeight, backgroundColor: surface, '--ms-input-bg': light ? '#f4f5f7' : '#191c22' });
        }
        function outside(e) { if (!menu.current?.contains(e.target) && !anchor.current?.contains(e.target)) setOpen(false); }
        function keyboard(e) { if (e.key === 'Escape') { e.preventDefault(); setOpen(false); anchor.current?.focus(); } }
        place(); search.current?.focus();
        const observer = new ResizeObserver(place); if (menu.current) observer.observe(menu.current);
        window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
        document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keyboard);
        return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); };
      }, [open]);
      async function submit(selection) {
        if (disabled) return;
        setError(''); setBusy(true);
        try {
          const outcome = await select(selection);
          if (outcome?.ok === false || outcome?.status === 'rejected' || outcome === false) {
            const failure = outcome?.error;
            throw new Error(failure?.message || '切换失败，请检查当前会话是否被其他窗口占用。');
          }
          if (mounted.current) setOpen(false);
        } catch (e) { if (mounted.current) { setError(e?.message || '切换失败'); setOpen(true); } }
        finally { if (mounted.current) setBusy(false); }
      }
      function pick(g, m) {
        if (editing || prefs.hidden[modelKey(g.id, m.id)]) return;
        if (current?.provider === g.id && current.model === m.id) { setOpen(false); return; }
        submit({ provider: g.id, model: m.id, ...(m.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: m.reasoning.defaultEffort }) });
      }
      function dragProps(type, provider, id) {
        if (!editing) return {};
        return {
          draggable: true,
          onDragStart(e) { if (['INPUT', 'BUTTON', 'SELECT'].includes(e.target.tagName) && e.target !== e.currentTarget) { e.preventDefault(); return; } drag.current = { type, provider, id }; e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('ms-dragging'); e.stopPropagation(); },
          onDragEnd(e) { e.currentTarget.classList.remove('ms-dragging'); document.querySelectorAll('.ms-drop').forEach(n => n.classList.remove('ms-drop')); drag.current = null; },
          onDragOver(e) { const d = drag.current; if (d?.type !== type || d.provider !== provider) return; e.preventDefault(); e.currentTarget.classList.add('ms-drop'); },
          onDragLeave(e) { e.currentTarget.classList.remove('ms-drop'); },
          onDrop(e) { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('ms-drop'); const d = drag.current; if (d?.type !== type || d.provider !== provider) return; const rect = e.currentTarget.getBoundingClientRect(); const items = type === 'group' ? ordered(state.groups, preferences.providers) : ordered(state.groups.find(g => g.id === provider).models, preferences.models[provider]); const after = items.findIndex(x => x.id === d.id) < items.findIndex(x => x.id === id);
            if (type === 'group') update(p => ({ ...p, providers: move(ordered(state.groups, p.providers).map(g => g.id), d.id, id, after) }));
            else { const group = state.groups.find(g => g.id === provider); setMap('models', provider, move(ordered(group.models, preferences.models[provider]).map(m => m.id), d.id, id, after)); }
            drag.current = null;
          }
        };
      }
      const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const hiddenCount = groups.reduce((n, g) => n + g.models.filter(m => prefs.hidden[modelKey(g.id, m.id)]).length, 0);
      const sections = groups.map(g => {
        const rows = ordered(g.models, prefs.models[g.id]).filter(m => {
          const key = modelKey(g.id, m.id);
          return (showHidden || !prefs.hidden[key]) && tokens.every(t => [g.id, g.name, m.id, m.name, prefs.labels[key]].filter(Boolean).join(' ').toLowerCase().includes(t));
        });
        if (!rows.length) return null;
        const expanded = tokens.length > 0 || prefs.collapsed[g.id] === false;
        return h('section', { className: 'ms-group', key: g.id },
          h('button', { type: 'button', className: 'ms-group-head', 'aria-expanded': expanded, onClick: () => setMap('collapsed', g.id, expanded), ...dragProps('group', '', g.id) }, editing && h('span', { className: 'ms-handle' }, '⋮⋮'), h('span', { className: 'ms-caret' }, expanded ? '▼' : '▶'), h('strong', null, g.name || g.id), h('span', { className: 'ms-count' }, rows.length), current?.provider === g.id && h('span', { className: 'ms-current' }, '当前')),
          expanded && rows.map(m => {
            const key = modelKey(g.id, m.id), hidden = !!prefs.hidden[key], selected = current?.provider === g.id && current.model === m.id;
            return h('div', { key, className: 'ms-row' + (editing ? ' editing' : '') + (selected ? ' selected' : '') + (hidden ? ' is-hidden' : ''), ...dragProps('model', g.id, m.id) },
              editing && h('span', { className: 'ms-handle' }, '⋮⋮'),
              h('button', { type: 'button', className: 'ms-pick', disabled: disabled || editing || hidden, onClick: () => pick(g, m), title: m.id }, h('div', { className: 'ms-name' }, m.name || m.id), h('div', { className: 'ms-sub' }, m.id)),
              h('input', { className: 'ms-label', value: prefs.labels[key] || '', placeholder: '自定义', maxLength: 32, 'aria-label': (m.name || m.id) + '自定义标签', title: '填写自己的标签，自动保存', onChange: e => setMap('labels', key, e.target.value), onKeyDown: e => { if (e.key !== 'Escape') e.stopPropagation(); }, draggable: false }),
              (editing || hidden) && h('button', { type: 'button', className: 'ms-btn', onClick: () => setMap('hidden', key, !hidden), 'aria-label': (hidden ? '恢复显示 ' : '隐藏 ') + (m.name || m.id) }, hidden ? '恢复' : '隐藏'),
              selected && h('span', { className: 'ms-check' }, '✓'));
          }));
      }).filter(Boolean);
      const reason = currentModel?.reasoning;
      const effective = current?.reasoningEffort ?? reason?.defaultEffort;
      return h('div', { className: 'ms-seat' },
        h('button', { ref: anchor, type: 'button', className: 'ms-trigger', disabled, 'aria-haspopup': 'dialog', 'aria-expanded': open, title: '模型整理 · ' + (currentGroup?.name || ''), onClick: () => { setError(''); load(); setOpen(v => !v); } }, busy ? '正在切换…' : (currentModel?.name || current?.model || '选择模型'), h(Chevron, { open })),
        reason && h('select', { className: 'ms-effort', 'aria-label': '思考等级', disabled, value: effective ?? '', onChange: e => submit({ provider: current.provider, model: current.model, ...(e.target.value ? { reasoningEffort: e.target.value } : {}) }) }, effective === undefined && h('option', { value: '' }, '默认思考'), ...(reason.efforts || []).map(e => h('option', { key: e.id, value: e.id }, e.name || e.id))),
        open && createPortal(h('div', { ref: menu, className: 'ms-menu', role: 'dialog', 'aria-label': '模型整理', style: position },
          h('div', { className: 'ms-head' }, h('strong', null, '选择模型'), h('div', { className: 'ms-actions' }, h('button', { type: 'button', className: 'ms-btn', onClick: () => { const anyExpanded = groups.some(g => preferences.collapsed[g.id] === false); update(p => ({ ...p, collapsed: Object.fromEntries(groups.map(g => [g.id, anyExpanded])) })); } }, groups.some(g => prefs.collapsed[g.id] === false) ? '全部收起' : '全部展开'), h('button', { type: 'button', className: 'ms-btn' + (editing ? ' active' : ''), onClick: () => setEditing(v => !v) }, editing ? '✓ 完成' : '↕ 整理'))),
          h('input', { ref: search, className: 'ms-search', placeholder: '搜索模型、供应商或标签…', value: query, 'aria-label': '搜索模型', onChange: e => setQuery(e.target.value) }),
          h('div', { className: 'ms-controls' }, h('label', null, h('input', { type: 'checkbox', checked: showHidden, onChange: e => setShowHidden(e.target.checked) }), '显示已隐藏'), h('span', null, '已隐藏 ' + hiddenCount + ' 个')),
          editing && h('div', { className: 'ms-help' }, '拖动 ⋮⋮ 排序；点击隐藏，随时可恢复。'),
          (error || storageError) && h('div', { className: 'ms-message', role: 'alert' }, error || storageError),
          state.error && h('div', { className: 'ms-message' }, String(state.error?.message || state.error), h('button', { className: 'ms-btn', onClick: load }, '重试')),
          ...(state.failures || []).map((f, i) => h('div', { className: 'ms-message', key: 'failure-' + i }, (f.name || f.id) + '：' + f.message)),
          h('div', { className: 'ms-list' }, sections.length ? sections : h('div', { className: 'ms-empty' }, state.status === 'loading' ? '正在加载模型…' : hiddenCount ? '暂无可见模型，勾选“显示已隐藏”可恢复。' : '没有匹配的模型')),
          h('div', { className: 'ms-foot' }, h('span', null, '自动保存 · 当前浏览器'), h('span', null, '初版 0.1.2'))
        ), document.body));
    }
    const inject = ['slots', 'modelDirectories', 'sessions', 'remote', 'remote.session'];
    function apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style'); style.dataset.plugin = 'dsh-model-shelf'; style.textContent = css; document.head.append(style);
        const sync = e => { if (e.key === KEY || e.key === null) { preferences = readPreferences(); notify(); } };
        window.addEventListener('storage', sync);
        return () => { style.remove(); window.removeEventListener('storage', sync); };
      }, 'model-shelf styles and preferences');
      ctx.inject(inject, scope => {
        scope.slots.inject('conversation.input.model', () => scope.slots.register({
          name: 'conversation.input.model', priority: -2, registrant: 'dsh-model-shelf',
          inject(sessionId) {
            const directory = scope.modelDirectories.directoryFor(sessionId);
            const available = scope.sessions.subagentAddress(sessionId) === undefined;
            return { available, directory: directory.store, load() { if (available) directory.load().catch(() => {}); }, select(selection) { if (!available) return Promise.reject(new Error('当前子代理会话不可切换模型')); return directory.select(selection); } };
          }
        }, Seat));
      });
    }
    return { inject, apply };
  }
});
