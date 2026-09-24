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
  const render = () => {
    items = suggest(input.value);
    if (!input.value.trim()) { list.hidden = true; return; }
    list.hidden = false;
    list.innerHTML = items.length
      ? items.map((i) => `<a class="sug-item" href="${i.href}"><span class="sug-kind">${i.kind}</span><span class="sug-label">${esc(i.label)}</span><span class="sug-sub">${esc(i.sub)}</span></a>`).join('')
      : '<div class="sug-empty">該当する魔法が見つかりません</div>';
  };
  const renderAsync = () => { if (IDX) render(); else loadIdx().then(render); };
  input.addEventListener('input', renderAsync);
  input.addEventListener('focus', renderAsync);
  input.addEventListener('blur', () => setTimeout(() => (list.hidden = true), 150));
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') list.hidden = true; });
  box.addEventListener('submit', (e) => { e.preventDefault(); loadIdx().then(() => { render(); if (items[0]) location.href = items[0].href; }); });
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

// トップの「たとえば〜」帯：タブ切替（6秒ごとに自動、クリックで停止）
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];
if (tabs.length) {
  const panels = [...document.querySelectorAll<HTMLElement>('[data-panel]')];
  let cur = 0, auto = true;
  const show = (i: number) => {
    cur = i;
    tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === i)));
    panels.forEach((p, j) => (p.hidden = j !== i));
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => { auto = false; show(i); }));
  setInterval(() => auto && show((cur + 1) % tabs.length), 6000);
}
