'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';

const LOCALES = [
  { code: 'es', label: 'ES', flag: 'fi fi-es' },
  { code: 'en', label: 'EN', flag: 'fi fi-gb' },
  { code: 'it', label: 'IT', flag: 'fi fi-it' },
  { code: 'pt', label: 'PT', flag: 'fi fi-pt' }
];

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  const handleLanguageChange = (nextLocale) => {
    setIsOpen(false);
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '8px 15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      >
        <span className={currentLocale.flag} style={{ borderRadius: '2px', fontSize: '1.2em' }}></span>
        {currentLocale.label}
        <span style={{ fontSize: '0.8em', marginLeft: '4px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'rgba(10, 15, 30, 0.95)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '12px',
          padding: '8px 0',
          minWidth: '120px',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5), 0 0 10px rgba(0, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          {LOCALES.map((l) => (
            <div 
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              style={{
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: l.code === locale ? '#00f0ff' : '#fff',
                background: l.code === locale ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => { if(l.code !== locale) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseOut={(e) => { if(l.code !== locale) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className={l.flag} style={{ borderRadius: '2px', fontSize: '1.2em' }}></span>
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
