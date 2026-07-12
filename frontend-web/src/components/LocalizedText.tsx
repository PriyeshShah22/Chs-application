import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useLanguageStore } from "../store/language";

export function useLocalizedTexts(texts: string[]) {
  const language = useLanguageStore((state) => state.language);
  const query = useQuery({ queryKey: ["localized-text", language, ...texts], enabled: language !== "en" && texts.some(Boolean), staleTime: Infinity, queryFn: async () => (await api.post("/ai/translate-ui", { language, texts })).data.translations as string[] });
  return language === "en" ? texts : (query.data ?? texts);
}
export function LocalizedText({ children }: { children: string }) { const [text] = useLocalizedTexts([children]); return <>{text}</>; }
