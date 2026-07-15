/**
 * A lightweight, UI-agnostic Notification Service.
 * Publishes structured notification events to registered listeners.
 * Designed to act as the architectural boundary between the infrastructure (API layer) 
 * and the UI layer (React Context/Toast).
 */
class NotificationService {
  constructor() {
    this.listeners = new Set();
  }

  /**
   * Subscribe to notifications.
   * @param {Function} listener - Callback function receiving notification payload
   * @returns {Function} - Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Publish a generic notification.
   * @param {Object} notification - { type, title, message, ...data }
   */
  notify(notification) {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('Notification listener failed:', err);
      }
    });
  }

  error(message, title = 'Error') {
    this.notify({ type: 'error', title, message });
  }

  success(message, title = 'Success') {
    this.notify({ type: 'success', title, message });
  }

  warning(message, title = 'Warning') {
    this.notify({ type: 'warning', title, message });
  }

  info(message, title = 'Info') {
    this.notify({ type: 'info', title, message });
  }
}

export const notificationService = new NotificationService();
