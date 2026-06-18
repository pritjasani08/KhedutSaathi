import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'gu', label: 'ગુજરાતી' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // setIsOpen(false); // Removed to fix cascading render warning
  }, [location]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/crop-health', label: 'Crop Health' },
    { path: '/crop-planning', label: 'Crop Planning' },
    { path: '/market-prices', label: 'Market Prices' },
    { path: '/expert-help', label: 'Expert Help' },
    { path: '/resources', label: 'News & Schemes' },
    { path: '/features', label: 'Features' },
    { path: '/about', label: 'About' },
  ];


  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center h-16 lg:h-20 px-4 sm:px-6 lg:px-8">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300">🌾</span>
            <span className="font-display font-bold text-xl lg:text-2xl gradient-text">
              KhedutSaathi
            </span>
          </Link>

          {/* CENTER/RIGHT: Nav Links */}
          <div className="hidden lg:flex flex-1 justify-end items-center gap-2 xl:gap-5 px-6 xl:px-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* FAR RIGHT: Utilities */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0 ml-auto lg:ml-0">
            {/* Language Switcher */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="p-2.5 rounded-xl bg-surface hover:bg-surface-muted border border-transparent hover:border-subtle text-slate-700 dark:text-slate-200 transition-all duration-300"
                aria-label="Change Language"
              >
                <Globe className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {langDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-32 bg-surface/90 backdrop-blur-xl rounded-xl shadow-glass border border-subtle overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLangDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                          i18n.language === lang.code 
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-light' 
                            : 'text-body hover:bg-surface-muted'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-surface hover:bg-surface-muted border border-transparent hover:border-subtle text-slate-700 dark:text-slate-200 transition-all duration-300"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-surface hover:bg-surface-muted border border-transparent hover:border-subtle transition-colors duration-300"
            >
              {isOpen ? <X className="w-6 h-6 text-slate-700 dark:text-slate-300" /> : <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-surface/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'text-primary bg-primary-50'
                        : 'text-slate-600 hover:text-primary hover:bg-primary-50/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {/* Mobile Language Switcher */}
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          i18n.language === lang.code
                            ? 'bg-primary text-white'
                            : 'bg-surface-muted border border-subtle text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>



                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
