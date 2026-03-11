import React from 'react';
import { MessageSquare, Calendar, BookOpen, Clock, Reply, CheckCircle, XCircle } from 'lucide-react';

export type NotificationType = 'message' | 'reply' | 'session' | 'reminder' | 'resource' | 'request' | 'system';

export interface ProfessionalNotificationProps {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
  timestamp?: string;
  read?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const ProfessionalNotification: React.FC<ProfessionalNotificationProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onClick,
  timestamp,
  read = false,
  className = '',
  variant = 'default',
}) => {
  const getIcon = () => {
    // Variants avec couleurs spécifiques pour Voix d'Avenir
    if (variant === 'success') return <CheckCircle className="w-5 h-5 text-purple-600" />;
    if (variant === 'error') return <XCircle className="w-5 h-5 text-pink-600" />;
    if (variant === 'warning') return <Clock className="w-5 h-5 text-pink-500" />;

    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'reply':
        return <Reply className="w-5 h-5 text-pink-600" />;
      case 'session':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-pink-600" />;
      case 'resource':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'request':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
    }
  };

  const getBgColor = () => {
    if (read) return 'bg-white';
    // Couleurs alignées avec Voix d'Avenir (rose et violet)
    if (variant === 'success') return 'bg-purple-50';
    if (variant === 'error') return 'bg-pink-50';
    if (variant === 'warning') return 'bg-pink-50';

    switch (type) {
      case 'message':
      case 'reply':
        return 'bg-purple-50';
      case 'session':
      case 'reminder':
        return 'bg-pink-50';
      case 'resource':
        return 'bg-purple-50';
      case 'request':
        return 'bg-purple-50';
      case 'system':
        return 'bg-purple-50';
      default:
        return 'bg-purple-50';
    }
  };

  const getBorderColor = () => {
    // Bordures alignées avec Voix d'Avenir (rose et violet)
    if (variant === 'success') return 'border-purple-200';
    if (variant === 'error') return 'border-pink-200';
    if (variant === 'warning') return 'border-pink-200';

    switch (type) {
      case 'message':
      case 'reply':
        return 'border-purple-200';
      case 'session':
      case 'reminder':
        return 'border-pink-200';
      case 'resource':
        return 'border-purple-200';
      case 'request':
        return 'border-purple-200';
      case 'system':
        return 'border-purple-200';
      default:
        return 'border-purple-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border ${getBorderColor()} ${getBgColor()} shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-full bg-white shadow-sm ${read ? 'opacity-50' : ''}`}>
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-semibold ${read ? 'text-gray-600' : 'text-gray-900'}`}>
              {title}
            </h4>
            {timestamp && (
              <span className="text-xs text-gray-500 font-medium">
                {timestamp}
              </span>
            )}
          </div>

          <p className={`text-sm mb-3 ${read ? 'text-gray-500' : 'text-gray-700'}`}>
            {message}
          </p>

          {actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-105 shadow-md"
            >
              {actionLabel}
            </button>
          )}
        </div>

        {!read && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalNotification;
