import { useI18n } from "../store/language";

export function useLocalizedTexts(texts: string[]) {
  const { t } = useI18n();
  return texts.map(t);
}

export function LocalizedText({ children }: { children: string }) {
  const { t } = useI18n();
  return <>{t(children)}</>;
}
