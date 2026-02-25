import { TextInput, rem, type TextInputProps } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState, useEffect, useCallback } from 'react';

/**
 * SearchInput — Chief debounced search input component.
 *
 * Wraps Mantine TextInput with:
 * - Search icon
 * - Debounced output (300ms default)
 * - Consistent sizing and styling
 */

interface SearchInputProps extends Omit<TextInputProps, 'onChange'> {
    /** Called with debounced value */
    onSearch: (value: string) => void;
    /** Debounce delay in ms */
    debounce?: number;
    /** Initial value */
    initialValue?: string;
}

export function SearchInput({
    onSearch,
    debounce = 300,
    initialValue = '',
    placeholder = 'Search...',
    ...props
}: SearchInputProps) {
    const [value, setValue] = useState(initialValue);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(value);
        }, debounce);
        return () => clearTimeout(timer);
    }, [value, debounce, onSearch]);

    return (
        <TextInput
            placeholder={placeholder}
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            w={300}
            {...props}
        />
    );
}
