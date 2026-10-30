import { PAGE_MAGICS } from '../../lib/dict';
import { searchIndexEn } from '../../lib/i18n';

// 英語版の検索インデックス（ローマ字・日本語・英語版の公式名で引ける）
export const GET = () => new Response(JSON.stringify(searchIndexEn(PAGE_MAGICS)), { headers: { 'Content-Type': 'application/json' } });
