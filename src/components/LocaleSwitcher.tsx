import { SUPPORTED_LOCALES, type SupportedLocale } from '@nextjob/shared';
import { Globe } from 'lucide-react';
import type React from 'react';
import { useI18n } from '../i18n';

export const LocaleSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center gap-1.5 text-xs text-fog ${className}`}>
      <Globe className="w-3.5 h-3.5 text-fog shrink-0" aria-hidden="true" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as SupportedLocale)}
        className="bg-panel border border-white/10 rounded px-2 py-1 text-xs text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-1 focus-visible:ring-offset-ink transition-colors cursor-pointer"
        aria-label="Select language"
      >
        {Object.values(SUPPORTED_LOCALES).map((loc) => (
          <option key={loc.code} value={loc.code} className="bg-ink text-paper">
            {loc.nativeName} ({loc.code})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocaleSwitcher;
