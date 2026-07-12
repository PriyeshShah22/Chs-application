import { useEffect, useRef } from "react";
import { api } from "../api/client";
import { useLanguageStore, words } from "../store/language";

const originals = new WeakMap<Node, string>();
const translatedValues = new Set(Object.values(words).flatMap((entry) => [entry.hi, entry.mr]));
const dynamicCache = new Map<string, string>();
const reverse = new Map<string, string>(Object.entries(words).flatMap(([english, entry]) => [[entry.hi, english], [entry.mr, english]]));
const cacheKey = (language: string, text: string) => `${language}:${text}`;

function applyTranslations(language: "en" | "hi" | "mr") {
  const root = document.getElementById("root"); if (!root) return [] as string[];
  const unknown = new Set<string>(); const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let node: Node | null;
  while ((node = walker.nextNode())) {
    const current = node.textContent ?? ""; const trimmed = current.trim(); if (!trimmed) continue;
    if (language === "en" && reverse.has(trimmed)) { const english = reverse.get(trimmed)!; originals.set(node, english); node.textContent = current.replace(trimmed, english); continue; }
    if (!originals.has(node) || (!translatedValues.has(trimmed) && !dynamicCache.has(cacheKey(language, trimmed)) && !words[trimmed])) originals.set(node, trimmed);
    const original = originals.get(node) ?? trimmed; const replacement = words[original]?.[language] ?? dynamicCache.get(cacheKey(language, original)) ?? original;
    if (language !== "en" && replacement === original && shouldTranslate(original)) unknown.add(original);
    if (trimmed !== replacement) node.textContent = current.replace(trimmed, replacement);
  }
  root.querySelectorAll<HTMLInputElement>("input[placeholder], textarea[placeholder]").forEach((element) => { const original = reverse.get(element.placeholder) ?? element.dataset.originalPlaceholder ?? element.placeholder; element.dataset.originalPlaceholder = original; element.placeholder = words[original]?.[language] ?? dynamicCache.get(cacheKey(language, original)) ?? original; if (language !== "en" && element.placeholder === original && shouldTranslate(original)) unknown.add(original); });
  document.documentElement.lang = language === "en" ? "en" : `${language}-IN`; return [...unknown].slice(0, 200);
}
function shouldTranslate(text: string) { return text.length >= 3 && text.length <= 500 && !text.includes("@") && !/^[-+#₹\d\s.,:/]+$/.test(text) && !/^[A-Z]{2,8}$/.test(text); }

export function SiteTranslator() {
  const language = useLanguageStore((state) => state.language); const timer = useRef<number | null>(null); const inFlight = useRef(false);
  useEffect(() => {
    let active = true;
    const run = async () => { const unknown = applyTranslations(language); if (language === "en" || !unknown.length || inFlight.current) return; inFlight.current = true; try { const result = (await api.post("/ai/translate-ui", { language, texts: unknown })).data; unknown.forEach((text, index) => { const translated = result.translations[index] || text; dynamicCache.set(cacheKey(language, text), translated); reverse.set(translated, text); const existing = words[text] ?? { en: text, hi: text, mr: text }; words[text] = { ...existing, [language]: translated }; }); if (active) applyTranslations(language); } catch { /* Known dictionary translations remain available when AI translation is offline. */ } finally { inFlight.current = false; } };
    void run(); const root = document.getElementById("root"); const observer = new MutationObserver(() => { if (timer.current) clearTimeout(timer.current); timer.current = window.setTimeout(() => void run(), 180); }); if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => { active = false; observer.disconnect(); if (timer.current) clearTimeout(timer.current); };
  }, [language]); return null;
}
