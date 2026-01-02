import { notifications } from '@mantine/notifications';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export const showSuccessNotification = (message: string, title?: string) => {
    notifications.show({
        title: title || 'Success',
        message,
        color: 'green',
        icon: <Check size={18} />,
        autoClose: 3000,
    });
};

export const showErrorNotification = (message: string, title?: string) => {
    notifications.show({
        title: title || 'Error',
        message,
        color: 'red',
        icon: <X size={18} />,
        autoClose: 4000,
    });
};

export const showWarningNotification = (message: string, title?: string) => {
    notifications.show({
        title: title || 'Warning',
        message,
        color: 'orange',
        icon: <AlertCircle size={18} />,
        autoClose: 3500,
    });
};

export const showInfoNotification = (message: string, title?: string) => {
    notifications.show({
        title: title || 'Info',
        message,
        color: 'blue',
        icon: <Info size={18} />,
        autoClose: 3000,
    });
};
