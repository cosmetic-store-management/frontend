import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/language.store";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const changeLanguage = (lng: 'en' | 'vi') => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-ink hover:text-brand transition-colors p-1 outline-none text-sm font-medium cursor-pointer">
          <Globe className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline-block uppercase">{language}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-white rounded-sm border-border">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={`cursor-pointer rounded-sm ${language === 'en' ? 'bg-muted/50 font-semibold text-brand' : ''}`}
        >
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('vi')}
          className={`cursor-pointer rounded-sm ${language === 'vi' ? 'bg-muted/50 font-semibold text-brand' : ''}`}
        >
          🇻🇳 Tiếng Việt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
