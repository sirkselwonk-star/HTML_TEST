/**
 * Fetches traits for all 1000 NFTs and writes traits-data.js
 * Usage: node fetch-traits.mjs
 */

import { writeFileSync } from 'fs';

const MIRROR_NODE = 'https://mainnet-public.mirrornode.hedera.com';
const IPFS_GW     = 'https://ipfs.io/ipfs/';
const TOKEN       = '0.0.9474754';
const TOTAL       = 1000;
const CONCURRENCY = 10; // parallel requests at a time

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

  const js = `var TRAITS_DATA=${JSON.stringify(result)};`;
  writeFileSync('traits-data.js', js);
  console.log('Done → traits-data.js');
}

run();
