/**
 * Fetches traits for all 1000 NFTs and injects them inline into index.html
 * Usage: node fetch-traits.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const MIRROR_NODE = 'https://mainnet-public.mirrornode.hedera.com';
const IPFS_GW     = 'https://ipfs.io/ipfs/';
const TOKEN       = '0.0.9474754';
const TOTAL       = 1000;
const CONCURRENCY = 10;

const MARKER_START = '<!-- TRAITS_DATA_START -->';
const MARKER_END   = '<!-- TRAITS_DATA_END -->';

async function fetchWithRetry(url, retries = 4, delay = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i === retries) throw e;
      console.warn(`  retry ${i + 1} for ${url}`);
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
}

async function fetchTraits(serial) {
  try {
    const nft = await fetchWithRetry(`${MIRROR_NODE}/api/v1/tokens/${TOKEN}/nfts/${serial}`);
    const uri = atob(nft.metadata).replace('ipfs://', IPFS_GW);
    const meta = await fetchWithRetry(uri);
    const attrs = meta.attributes || meta.properties || [];
    return Array.isArray(attrs) ? attrs : [];
  } catch (e) {
    console.warn(`  serial ${serial} failed: ${e.message}`);
    return [];
  }
}

async function run() {
  const result = {};
  const serials = Array.from({ length: TOTAL }, (_, i) => i + 1);

  for (let i = 0; i < serials.length; i += CONCURRENCY) {
    const batch = serials.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(s => fetchTraits(s)));
    batch.forEach((s, idx) => { result[s] = results[idx]; });
    console.log(`${i + batch.length} / ${TOTAL}`);
  }

  const block = `${MARKER_START}\n<script>var TRAITS_DATA=${JSON.stringify(result)};<\/script>\n${MARKER_END}`;

  let html = readFileSync('index.html', 'utf8');

  // Replace existing block if present, otherwise replace the external script tag
  if (html.includes(MARKER_START)) {
    html = html.replace(new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`), block);
  } else {
    html = html.replace('<script src="traits-data.js"></script>', block);
  }

  writeFileSync('index.html', html);
  console.log('Done → traits inlined into index.html');
}

run();
