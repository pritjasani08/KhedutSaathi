/**
 * Generates a unique error ID for tracking and debugging purposes.
 * @returns {string} A unique alphanumeric string (e.g. "ERR-A1B2C3D4")
 */
export const generateErrorId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ERR-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Safely reloads the application without relying on React Router,
 * bypassing potentially corrupted React state.
 */
export const safeAppReload = () => {
  window.location.href = '/';
};
