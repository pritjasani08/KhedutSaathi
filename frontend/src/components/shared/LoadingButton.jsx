import { Loader2 } from 'lucide-react';

/**
 * LoadingButton — Shared UI Primitive
 *
 * Replaces the 9 inline `disabled={loading}` + Loader2 patterns across the codebase.
 * Consumers continue to control their own loading state — this component only
 * handles the visual representation of that state.
 *
 * Props:
 *   isLoading   {boolean}         — Controls spinner vs icon display
 *   children    {ReactNode}       — The idle label text (e.g. "Sign In")
 *   loadingText {string}          — Label while loading (e.g. "Signing In...")
 *   icon        {ReactComponent}  — Optional Lucide icon shown when not loading
 *   variant     {'primary'|'secondary'} — Button style (default: 'primary')
 *   className   {string}          — Extra Tailwind classes for layout overrides
 *   ...rest     {}                — Spread to <button> (type, onClick, form, etc.)
 */
export default function LoadingButton({
  isLoading = false,
  children,
  loadingText,
  icon: Icon,
  variant = 'primary',
  className = '',
  ...rest
}) {
  const base = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

  return (
    <button
      disabled={isLoading}
      className={`${base} flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span>{isLoading ? (loadingText ?? 'Loading...') : children}</span>
    </button>
  );
}
