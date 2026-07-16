import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, Info, Zap, Sparkles } from 'lucide-react';
import api from '../../services/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data?.data) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.put(`/notifications/${id}/dismiss`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const addToTimeline = async (id) => {
    try {
      await api.post(`/timeline/convert`, { notification_id: id });
      // Optionally dismiss the notification or show a success toast
      alert('Successfully added to Timeline!');
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to convert to timeline task:', err);
      alert(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to add to Timeline');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'HIGH': return <Zap className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityClass = (priority, isRead) => {
    if (isRead) return 'bg-gray-800/50 border-gray-700';
    switch (priority) {
      case 'CRITICAL': return 'bg-red-900/20 border-red-500/50';
      case 'HIGH': return 'bg-orange-900/20 border-orange-500/50';
      default: return 'bg-blue-900/20 border-blue-500/50';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">AI Proactive Alerts</h3>
            <span className="text-sm text-gray-400">{unreadCount} unread</span>
          </div>
          
          <div className="p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No active notifications.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`relative p-4 rounded-lg border transition-all ${getPriorityClass(notif.priority, notif.is_read)}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {getPriorityIcon(notif.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-medium ${notif.is_read ? 'text-gray-400' : 'text-gray-100'}`}>
                          {notif.title}
                        </h4>
                        <div className="flex gap-2">
                          {!notif.is_read && (
                            <button onClick={() => markAsRead(notif.id)} className="text-gray-400 hover:text-green-500" title="Mark as read">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => dismissNotification(notif.id)} className="text-gray-400 hover:text-red-500" title="Dismiss">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${notif.is_read ? 'text-gray-500' : 'text-gray-300'}`}>
                        {notif.message}
                      </p>
                      <div className="mt-2 text-xs text-gray-500 flex justify-between">
                        <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                        <span>Source: {notif.source}</span>
                      </div>
                      
                      {/* Personalization Factors */}
                      {notif.context_snapshot?.personalization_factors && notif.context_snapshot.personalization_factors.length > 0 && (
                        <div className="mt-3 bg-indigo-900/20 border border-indigo-500/30 p-2.5 rounded-lg">
                          <h5 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Personalized for You
                          </h5>
                          <ul className="space-y-1">
                            {notif.context_snapshot.personalization_factors.map((factor, idx) => (
                              <li key={idx} className="text-xs text-indigo-300">
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <button 
                          onClick={() => addToTimeline(notif.id)} 
                          className="text-xs font-semibold px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-md transition-colors"
                        >
                          Add to Timeline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
