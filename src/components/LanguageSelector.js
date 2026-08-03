'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e) => {
    const nextLocale = e.target.value;
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    router.push(`/${nextLocale}${pathWithoutLocale}`);
  };

  return (
    <select 
      value={locale} 
      onChange={handleLanguageChange}
      style={{
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '5px 10px',
        cursor: 'pointer'
      }}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="it">Italiano</option>
      <option value="pt">Português</option>
    </select>
  );
}
