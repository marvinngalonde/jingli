import { Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

interface StudentPickerProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string | null) => void;
    required?: boolean;
    error?: string;
    description?: string;
}

export function StudentPicker({ label = 'Student', placeholder = 'Search by name or admission no...', value, onChange, required, error, description }: StudentPickerProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        studentService.getAll({ limit: 1000 })
            .then(result => setStudents(result.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Select
            label={label}
            placeholder={placeholder}
            description={description}
            data={students.map(s => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName} (${s.admissionNo})`,
            }))}
            value={value}
            onChange={onChange}
            searchable
            clearable
            required={required}
            error={error}
            nothingFoundMessage="No students found"
            disabled={loading}
        />
    );
}
