import os
import re

file_path = r"C:\arvip\jingli\frontend\src\pages\teacher\TeacherCBT.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for classes and subjects
if "const [availableClasses, setAvailableClasses]" not in content:
    state_injection = """    const [availableClasses, setAvailableClasses] = useState<{ value: string, label: string }[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<{ value: string, label: string }[]>([]);
    const [rawClasses, setRawClasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const { data } = await api.get('/teacher/classes');
                setRawClasses(data);
                setAvailableClasses(data.map((cls: any) => ({
                    value: cls.section.id,
                    label: `${cls.section.classLevel.name} ${cls.section.name}`
                })));
            } catch (e) {
                console.error("Failed to load classes", e);
            }
        };
        fetchDropdownData();
    }, []);

    // Update subjects when section changes
    useEffect(() => {
        if (quizForm.values.sectionId) {
            const cls = rawClasses.find(c => c.section.id === quizForm.values.sectionId);
            if (cls) {
                setAvailableSubjects(cls.subjects.map((s: any) => ({
                    value: s.id,
                    label: `${s.name} (${s.code})`
                })));
            } else {
                setAvailableSubjects([]);
            }
            quizForm.setFieldValue('subjectId', '');
        } else {
            setAvailableSubjects([]);
            quizForm.setFieldValue('subjectId', '');
        }
    }, [quizForm.values.sectionId, rawClasses]);
"""
    content = content.replace("    const [tab, setTab] = useState<string | null>('all');", "    const [tab, setTab] = useState<string | null>('all');\n" + state_injection)

# Replace TextInput with Select
target_subject = "<TextInput label=\"Subject ID (optional)\" placeholder=\"UUID...\" {...quizForm.getInputProps('subjectId')} />"
target_section = "<TextInput label=\"Section ID (optional)\" placeholder=\"UUID...\" {...quizForm.getInputProps('sectionId')} />"

replacement_subject = "<Select label=\"Subject\" placeholder=\"Select subject\" data={availableSubjects} {...quizForm.getInputProps('subjectId')} searchable clearable />"
replacement_section = "<Select label=\"Target Class\" placeholder=\"Select class\" data={availableClasses} {...quizForm.getInputProps('sectionId')} searchable clearable />"

content = content.replace(target_subject, replacement_subject)
content = content.replace(target_section, replacement_section)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("TeacherCBT.tsx updated with dropdowns")
