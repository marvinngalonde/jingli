import { notifications } from '@mantine/notifications';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// Using unique IDs prevents duplicate notifications from showing
// When the same notification is shown multiple times (e.g., from React StrictMode),
// Mantine will update the existing notification instead of creating a new one.

export const showSuccessNotification = (message: string, title?: string) => {
    const id = `success-${message}`;
    notifications.show({
        id,
        title: title || 'Success',
        message,
        color: 'green',
        icon: <Check size={18} />,
        autoClose: 3000,
    });
};

export const showErrorNotification = (message: string, title?: string) => {
    const id = `error-${message}`;
    notifications.show({
        id,
        title: title || 'Error',
        message,
        color: 'red',
        icon: <X size={18} />,
        autoClose: 4000,
    });
};

export const showWarningNotification = (message: string, title?: string) => {
    const id = `warning-${message}`;
    notifications.show({
        id,
        title: title || 'Warning',
        message,
        color: 'orange',
        icon: <AlertCircle size={18} />,
        autoClose: 3500,
    });
};

export const showInfoNotification = (message: string, title?: string) => {
    const id = `info-${message}`;
    notifications.show({
        id,
        title: title || 'Info',
        message,
        color: 'blue',
        icon: <Info size={18} />,
        autoClose: 3000,
    });
};

// Helper to show a deduplicated notification with a custom ID
export const showNotification = (opts: { id?: string; title: string; message: string; color: string }) => {
    const id = opts.id || `${opts.color}-${opts.message}`;
    notifications.show({
        id,
        title: opts.title,
        message: opts.message,
        color: opts.color,
        autoClose: 3000,
    });
};
