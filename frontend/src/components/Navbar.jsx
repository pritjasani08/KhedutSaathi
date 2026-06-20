import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, LogIn, Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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
  const langRef = useRef(null);
  
  const { user, logout } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const profileRef = useRef(null);
  
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const farmerLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/crop-health', label: 'Crop Health' },
    { path: '/market-prices', label: 'Market Intelligence' },
    { path: '/crop-recommendation', label: 'Crop Recommendation' },
    { path: '/agri-marketplace', label: 'Marketplace Feed' },
    { path: '/khedut-ai', label: 'Khedut AI' },
    { path: '/resources', label: 'News & Schemes' },
    { path: '/features', label: 'Features' },
    { path: '/about', label: 'About' },
  ];

  const buyerLinks = [
    { path: '/crop-market', label: 'Crop Market' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/deals', label: 'My Deals' }
  ];

  const sellerLinks = [
    { path: '/seller-dashboard/products', label: 'My Products' },
    { path: '/seller-dashboard/add', label: 'Add Product' },
    { path: '/seller-dashboard/orders', label: 'Incoming Orders' }
  ];

  const publicLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/market-prices', label: 'Market Intelligence' },
    { path: '/agri-marketplace', label: 'Marketplace Feed' },
    { path: '/khedut-ai', label: 'Khedut AI' },
    { path: '/resources', label: 'News & Schemes' },
    { path: '/features', label: 'Features' },
    { path: '/about', label: 'About' },
  ];

  let navLinks = publicLinks;
  if (location.pathname.includes('/seller-dashboard')) {
    navLinks = sellerLinks;
  } else if (user) {
    if (user.user_type === 'buyer') {
      navLinks = buyerLinks;
    } else if (user.user_type === 'farmer') {
      navLinks = farmerLinks;
    }
  }
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
      <div className="w-full max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {/* LEFT: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="inline-flex items-center gap-2 group shrink-0">
              <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300">🌾</span>
              <span className="font-display font-bold text-xl lg:text-2xl gradient-text">
                KhedutSaathi
              </span>
            </Link>
          </div>

          {/* CENTER: Nav Links */}
          <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 2xl:gap-4 shrink w-full max-w-fit">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 xl:px-3 py-2 rounded-xl text-[13px] xl:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
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
          <div className="flex items-center justify-end gap-2 xl:gap-3 flex-1 shrink-0">
            {/* Language Switcher */}
            <div className="relative hidden lg:block" ref={langRef}>
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

            {/* Login / Profile Button */}
            {user ? (
              <div className="relative hidden lg:block" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 text-primary dark:text-primary-light text-sm font-medium transition-all duration-300"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  {user.first_name}
                </button>
                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-surface/90 backdrop-blur-xl rounded-xl shadow-glass border border-subtle overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-subtle">
                        <p className="text-sm font-medium text-heading">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-body opacity-80">{user.email}</p>
                      </div>
                      <Link 
                        to="/profile"
                        onClick={() => setProfileDropdown(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-body hover:bg-surface-muted transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      
                      {user.user_type === 'farmer' && (
                        <>
                          <Link 
                            to="/dashboard"
                            onClick={() => setProfileDropdown(false)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-body hover:bg-surface-muted transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link 
                            to="/deals"
                            onClick={() => setProfileDropdown(false)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-body hover:bg-surface-muted transition-colors"
                          >
                            <User className="w-4 h-4" />
                            My Deals
                          </Link>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-transparent hover:border-subtle text-slate-700 dark:text-slate-200 text-sm font-medium transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
            )}

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
