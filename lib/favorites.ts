"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Favorites, saved in this browser only (localStorage) — no login, no server.
 * Stored as a JSON array of product slugs under one key. Every component that
 * uses `useFavorites()` stays in sync, including across browser tabs.
 */
const STORAGE_KEY = "smart-finds:favorites";
const CHANGE_EVENT = "smart-finds:favorites-change";
const EMPTY = "[]";

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage full or blocked (e.g. some private modes) — favorites just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Cache the parsed array per raw string so the snapshot is referentially stable.
let lastRaw = EMPTY;
let lastParsed: string[] = [];
function snapshot(): string[] {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parse(raw);
  }
  return lastParsed;
}
const serverSnapshot: string[] = [];

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const toggleFavorite = useCallback((slug: string) => {
    const current = parse(readRaw());
    write(current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current]);
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
