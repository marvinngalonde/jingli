import { Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';

interface StaffPickerProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string | null) => void;
    required?: boolean;
    error?: string;
    description?: string;
}

export function StaffPicker({ label = 'Staff Member', placeholder = 'Search by name...', value, onChange, required, error, description }: StaffPickerProps) {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        staffService.getAll()
            .then(data => setStaff(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Select
            label={label}
            placeholder={placeholder}
            description={description}
            data={staff.map(s => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName} (${s.employeeId || 'Staff'})`,
            }))}
            value={value}
            onChange={onChange}
            searchable
            clearable
            required={required}
            error={error}
            nothingFoundMessage="No staff found"
            disabled={loading}
        />
    );
}
