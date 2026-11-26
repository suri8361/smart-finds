#!/usr/bin/env node
/**
 * Smart Finds — standalone local Google Chat reader (read only).
 *
 * Opens https://chat.google.com/room/AAQAnYvfwq8 in a local Playwright Chromium window using a
 * persistent local browser profile folder (./chrome-profile, gitignored). Sign into Google once
 * in the opened browser window; subsequent runs reuse that local login.
 *
 * Captures posts newer than state.json lastCutoff and saves attachment images via CDP Network
 * response capture (handles cross-origin lh3.googleusercontent.com/chat_attachment/ URLs).
 *
 * Setup (one time):
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   node chat-reader-local.mjs                  # reads posts since state.json lastCutoff + saves images
 *   node chat-reader-local.mjs 2026-11-20T00:00:00Z  # custom ISO cutoff
 *   node chat-reader-local.mjs --commit         # advance state.json lastCutoff after importing
 *   node chat-reader-local.mjs --headed         # show browser window (use first time to sign in)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SPACE = "https://chat.google.com/room/AAQAnYvfwq8";
const STATE_PATH = path.join(HERE, "state.json");
const PROFILE_DIR = path.join(HERE, "chrome-profile");

const args = process.argv.slice(2);
const headed = args.includes("--headed");
const commit = args.includes("--commit");
const state = fs.existsSync(STATE_PATH) ? JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) : {};
const cutoffIso = args.find((a) => !a.startsWith("--")) || state.lastCutoff || new Date(Date.now() - 7 * 864e5).toISOString();
const cutoff = Date.parse(cutoffIso);

const COLLECT = `(() => {
  const out = [];
  for (const c of document.querySelectorAll('c-wiz[data-topic-id][data-is-main-view="true"]')) {
    const ms = [...c.querySelectorAll('[data-id][data-user-id]')];
    for (const m of ms) {
      const tsEl = m.querySelector('[data-absolute-timestamp]') || c.querySelector('[data-absolute-timestamp]');
      const tx = m.querySelector('[jsname="bgckF"]');
      out.push({
        topic_id: c.getAttribute('data-topic-id'),
        message_id: m.getAttribute('data-id'),
        reply: m.getAttribute('data-is-initial-message-of-thread') !== 'true',
        t: +(tsEl ? tsEl.getAttribute('data-absolute-timestamp') : c.getAttribute('data-local-sort-time-msec')),
        user_id: m.getAttribute('data-user-id'),
        author: m.getAttribute('data-name') || '',
        text: (tx ? tx.innerText : m.innerText || '').trim(),
        links: [...m.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => /^https?:/.test(h) && !/chat\.google\.com/.test(h)),
        images: [...m.querySelectorAll('img[src]')].map((i) => i.src).filter((s) => /chat_attachment|googleusercontent\.com/.test(s) && !/\/a-\//.test(s))
      });
    }
  }
  return out;
})()`;

const context = await chromium.launchPersistentContext(PROFILE_DIR, { headless: !headed });
const page = context.pages()[0] || (await context.newPage());
const cdp = await context.newCDPSession(page);
await cdp.send("Network.enable");

const imgRequests = new Map();
cdp.on("Network.responseReceived", (ev) => {
  const url = ev.response?.url || "";
  const ct = ev.response?.headers?.["content-type"] || ev.response?.headers?.["Content-Type"] || "";
  if (/chat_attachment|googleusercontent\.com/.test(url) && !/\/a-\//.test(url) && /image/i.test(ct)) {
    imgRequests.set(url, ev.requestId);
  }
});

await page.goto(SPACE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(6000);

if (/accounts\.google\.com/.test(page.url())) {
  console.error(JSON.stringify({ error: "signed_out", note: "Run again with --headed and sign into your Google account once." }));
  await context.close();
  process.exit(3);
}

// Scroll up a few times to load recent history back to cutoff
const seen = new Map();
for (let step = 0; step < 12; step++) {
  const batch = await page.evaluate(COLLECT);
  for (const m of batch) if (m.message_id) seen.set(m.message_id, m);
  const oldest = Math.min(...[...seen.values()].map((m) => m.t || Infinity));
  if (oldest <= cutoff) break;
  await page.mouse.wheel(0, -1800);
  await page.waitForTimeout(1500);
}

const posts = [...seen.values()].filter((m) => m.t > cutoff).sort((a, b) => a.t - b.t);
const dateStr = new Date().toISOString().slice(0, 10);
const imgDir = path.join(HERE, "..", "new-posts-images");
fs.mkdirSync(imgDir, { recursive: true });

for (const p of posts) {
  p.saved_images = [];
  for (let i = 0; i < (p.images || []).length; i++) {
    const url = p.images[i];
    const reqId = imgRequests.get(url);
    if (!reqId) continue;
    try {
      const body = await cdp.send("Network.getResponseBody", { requestId: reqId });
      const buf = Buffer.from(body.body, body.base64Encoded ? "base64" : "utf8");
      if (buf.length > 1000) {
        const fn = `${p.message_id}-${i}.jpg`;
        fs.writeFileSync(path.join(imgDir, fn), buf);
        p.saved_images.push(fn);
      }
    } catch {}
  }
}

const outPath = path.join(HERE, "..", `new-posts-${dateStr}.json`);
fs.writeFileSync(outPath, JSON.stringify({ cutoff: cutoffIso, count: posts.length, posts }, null, 2));
console.log(JSON.stringify({ ok: true, out: outPath, count: posts.length }));

if (commit && posts.length) {
  const newest = new Date(posts[posts.length - 1].t).toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify({ ...state, lastCutoff: newest }, null, 2));
  console.log(JSON.stringify({ committed_cutoff: newest }));
}

await context.close();
