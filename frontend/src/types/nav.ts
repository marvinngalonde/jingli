import React from 'react';

export interface NavItem {
    icon: React.ElementType;
    label: string;
    to: string;
    color: string;
}
