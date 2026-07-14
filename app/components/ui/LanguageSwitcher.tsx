
import { useLanguageStore } from "../../store/language.store";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {

  const { language, setLanguage } = useLanguageStore();

  const changeLanguage = (lng: 'en' | 'vi') => {
    setLanguage(lng);
    
    // Set or clear Google Translate cookie
    if (lng === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.aisq.site;";
    } else {
      document.cookie = `googtrans=/en/${lng}; path=/;`;
      document.cookie = `googtrans=/en/${lng}; path=/; domain=.aisq.site;`;
    }
    
    // Trigger Google Translate Widget
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = lng;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
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
          className={`cursor-pointer rounded-sm flex items-center gap-2 ${language === 'en' ? 'bg-muted/50 font-semibold text-brand' : ''}`}
        >
          <img src="https://flagcdn.com/w20/us.png" srcSet="https://flagcdn.com/w40/us.png 2x" width="20" alt="English" />
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('vi')}
          className={`cursor-pointer rounded-sm flex items-center gap-2 ${language === 'vi' ? 'bg-muted/50 font-semibold text-brand' : ''}`}
        >
          <img src="https://flagcdn.com/w20/vn.png" srcSet="https://flagcdn.com/w40/vn.png 2x" width="20" alt="Vietnamese" />
          Vietnamese
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
