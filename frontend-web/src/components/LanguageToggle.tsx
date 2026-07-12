import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useLanguageStore, type AppLanguage } from "../store/language";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();
  return <ToggleButtonGroup exclusive size="small" value={language} onChange={(_event, value: AppLanguage | null) => value && setLanguage(value)} aria-label="Site language" sx={{ bgcolor: "background.paper", "& .MuiToggleButton-root": { px: { xs: 1, sm: 1.5 }, minHeight: 36, fontWeight: 850 } }}><ToggleButton value="en">EN</ToggleButton><ToggleButton value="hi">हिं</ToggleButton><ToggleButton value="mr">मर</ToggleButton></ToggleButtonGroup>;
}
