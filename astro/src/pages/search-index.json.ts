import { searchIndex } from '../lib/dict';

// 検索インデックスは全ページに埋め込まず、検索を使うときだけ読み込む
export const GET = () => new Response(JSON.stringify(searchIndex), { headers: { 'Content-Type': 'application/json' } });
