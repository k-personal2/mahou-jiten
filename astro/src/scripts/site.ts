type Idx = {
  magics: { id: string; n: string; k?: string; g: string }[];
  els: { name: string; al: string[]; href: string }[];
  fxs: { name: string; href: string }[];
  games: { name: string; short: string; href: string }[];
};
// 検索インデックスは初回の検索・ランダム時に取得（全ページへの埋め込みを避ける）
let IDX: Idx | null = null;
let loading: Promise<Idx> | null = null;
const loadIdx = () => (loading ??= fetch('/search-index.json').then((r) => r.json() as Promise<Idx>).then((d) => (IDX = d)));
const kata = (s: string) => s.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
const norm = (s: string) => kata((s || '').toLowerCase()).replace(/属性|魔法|呪文/g, '').trim();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

type Sug = { kind: string; label: string; sub: string; href: string };
function suggest(q: string): Sug[] {
  const n = norm(q);
  if (!n || !IDX) return [];
  const out: Sug[] = [];
  IDX.magics
    .filter((m) => norm(m.n).includes(n) || (m.k && norm(m.k).includes(n)) || m.id.includes(n))
    .sort((a, b) => Number(norm(b.n).startsWith(n)) - Number(norm(a.n).startsWith(n)))
    .slice(0, 6)
    .forEach((m) => out.push({ kind: '魔法', label: m.n, sub: m.g, href: '/magic/' + m.id }));
  IDX.els.forEach((e) => { if (e.al.some((a) => norm(a).includes(n) || n.includes(norm(a)))) out.push({ kind: '属性', label: e.name + '属性の攻撃魔法', sub: '横断比較', href: e.href }); });
  IDX.fxs.forEach((f) => { if (norm(f.name).includes(n)) out.push({ kind: '用途', label: f.name + '魔法', sub: '横断比較', href: f.href }); });
  IDX.games.forEach((g) => { if (norm(g.name).includes(n) || norm(g.short).includes(n)) out.push({ kind: '作品', label: g.name, sub: '魔法体系', href: g.href }); });
  return out.slice(0, 9);
}

document.querySelectorAll<HTMLFormElement>('[data-search]').forEach((box) => {
  const input = box.querySelector('input')!, list = box.querySelector<HTMLElement>('[data-sug]')!;
  let items: Sug[] = [];
  // ↑↓で選んでいる候補（-1 は未選択。Enter で1件目へ）。フォーカスは入力欄に置いたまま aria-activedescendant で示す
  let active = -1;
  const show = (open: boolean) => { list.hidden = !open; input.setAttribute('aria-expanded', String(open)); };
  const setActive = (i: number) => {
    active = i;
    list.querySelectorAll('[role="option"]').forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
    if (i < 0) input.removeAttribute('aria-activedescendant');
    else { input.setAttribute('aria-activedescendant', `${list.id}-${i}`); list.querySelector(`#${list.id}-${i}`)!.scrollIntoView({ block: 'nearest' }); }
  };
  const render = () => {
    items = suggest(input.value);
    active = -1;
    input.removeAttribute('aria-activedescendant');
    if (!input.value.trim()) { show(false); return; }
    show(true);
    list.innerHTML = items.length
      ? items.map((i, j) => `<a class="sug__item" id="${list.id}-${j}" role="option" aria-selected="false" href="${i.href}"><span class="sug__kind">${i.kind}</span><span class="sug__label">${esc(i.label)}</span><span class="sug__sub">${esc(i.sub)}</span></a>`).join('')
      : '<p class="sug__empty" role="status">見つかりませんでした。別の表記（ひらがな・カタカナ）でも試せます。</p>';
  };
  const renderAsync = () => { if (IDX) render(); else loadIdx().then(render); };
  input.addEventListener('input', renderAsync);
  input.addEventListener('focus', renderAsync);
  input.addEventListener('blur', () => setTimeout(() => show(false), 150));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { show(false); setActive(-1); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (list.hidden) { renderAsync(); return; }
    if (!items.length) return;
    // 未選択(-1)〜最後の候補を輪にして回す。末尾の次は未選択（入力欄）に戻る
    const n = items.length + 1, step = e.key === 'ArrowDown' ? 1 : -1;
    setActive(((active + 1 + step + n) % n) - 1);
  });
  box.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = items[active];
    if (target) { location.href = target.href; return; }
    loadIdx().then(() => { render(); if (items[0]) location.href = items[0].href; });
  });
});

document.querySelectorAll<HTMLElement>('[data-fill]').forEach((b) =>
  b.addEventListener('click', () => {
    const input = document.querySelector<HTMLInputElement>('[data-search] input');
    if (!input) return;
    input.value = b.dataset.fill!;
    input.focus();
    input.dispatchEvent(new Event('input'));
  }),
);

document.querySelectorAll<HTMLElement>('[data-random]').forEach((b) =>
  b.addEventListener('click', (e) => {
    e.preventDefault();
    loadIdx().then((d) => { location.href = '/magic/' + d.magics[Math.floor(Math.random() * d.magics.length)].id; });
  }),
);

// トップの呼び名の帯：タブ切替
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];
const panels = [...document.querySelectorAll<HTMLElement>('[data-panel]')];
// Tab キーでは選択中のタブだけに止まり、タブ間は ←→・Home・End で移る（WAI-ARIA のタブの作法）
const selectTab = (i: number) => {
  tabs.forEach((x, j) => { x.setAttribute('aria-selected', String(j === i)); x.tabIndex = j === i ? 0 : -1; });
  panels.forEach((p, j) => (p.hidden = j !== i));
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(i));
  t.addEventListener('keydown', (e) => {
    const n = tabs.length;
    const to = ({ ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 } as Record<string, number>)[e.key];
    if (to === undefined) return;
    e.preventDefault();
    selectTab(to);
    tabs[to].focus();
  });
});

// 「すべて表示」：data-more="名前" のボタンで data-more-item="名前" の行を出し入れする
document.querySelectorAll<HTMLButtonElement>('[data-more]').forEach((b) => {
  const items = document.querySelectorAll<HTMLElement>(`[data-more-item="${b.dataset.more}"]`);
  const closed = b.textContent!;
  b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    items.forEach((x) => (x.hidden = !open));
    b.setAttribute('aria-expanded', String(open));
    b.textContent = open ? b.dataset.less! : closed;
  });
});
