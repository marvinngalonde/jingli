import os
import re

assignment_file = r'C:\arvip\jingli\frontend\src\pages\teacher\TeacherAssignments.tsx'
materials_file = r'C:\arvip\jingli\frontend\src\pages\teacher\TeacherCourseMaterials.tsx'

with open(assignment_file, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace CALA form state
old_state = """    // CALA Form state
    const [calaTitle, setCalaTitle] = useState('');
    const [calaTask, setCalaTask] = useState('');
    const [calaCompetency, setCalaCompetency] = useState('');
    const [calaMaxMarks, setCalaMaxMarks] = useState<number | ''>(50);
    const [calaSubjectId, setCalaSubjectId] = useState('');"""

new_state = """    // CALA Form state
    const [calaTaskName, setCalaTaskName] = useState('');
    const [calaScore, setCalaScore] = useState<number | ''>('');
    const [calaMaxMarks, setCalaMaxMarks] = useState<number | ''>(50);
    const [calaSubjectId, setCalaSubjectId] = useState('');
    const [calaStudentId, setCalaStudentId] = useState('');
    const [calaTermId, setCalaTermId] = useState('');
    const [calaDate, setCalaDate] = useState('');
    const [calaTeacherRemarks, setCalaTeacherRemarks] = useState('');

    const [availableStudents, setAvailableStudents] = useState<{ value: string; label: string }[]>([]);
    const [availableTerms, setAvailableTerms] = useState<{ value: string; label: string }[]>([]);"""

text = text.replace(old_state, new_state)

# Replace useEffect for students
old_effect = """    // Fetch subjects when global section changes
    useEffect(() => {
        if (sectionId || !selectedGlobalSectionId) return;
        (async () => {
            try {
                const { data } = await api.get('/teacher/classes');
                const cls = data.find((c: any) => c.section.id === selectedGlobalSectionId);
                if (cls) {
                    setAvailableSubjects(cls.subjects.map((s: any) => ({ value: s.id, label: `${s.name} (${s.code})` })));
                    if (cls.subjects.length > 0) setSubjectId(cls.subjects[0].id);
                }
            } catch { /* ignore */ }
        })();
    }, [selectedGlobalSectionId, sectionId]);"""

new_effect = """    // Fetch subjects and students when global section changes
    useEffect(() => {
        const targetSectionId = sectionId || selectedGlobalSectionId;
        if (!targetSectionId) {
            setAvailableStudents([]);
            return;
        }
        (async () => {
            try {
                const [classesRes, studentsRes, termsRes] = await Promise.all([
                    api.get('/teacher/classes'),
                    api.get(`/teacher/classes/${targetSectionId}/students`),
                    api.get('/exams/terms')
                ]);
                
                const cls = classesRes.data.find((c: any) => c.section.id === targetSectionId);
                if (cls) {
                    setAvailableSubjects(cls.subjects.map((s: any) => ({ value: s.id, label: `${s.name} (${s.code})` })));
                    if (cls.subjects.length > 0 && !subjectId) setSubjectId(cls.subjects[0].id);
                }
                
                setAvailableStudents(studentsRes.data.map((s: any) => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.admissionNo})` })));
                setAvailableTerms(Array.isArray(termsRes.data) ? termsRes.data.map((t: any) => ({ value: t.id, label: t.name })) : []);
            } catch { /* ignore */ }
        })();
    }, [selectedGlobalSectionId, sectionId]);"""

text = text.replace(old_effect, new_effect)


# Replace CALA CRUD
old_crud = """    // ─── CALA CRUD ───
    const resetCalaForm = () => { setCalaTitle(''); setCalaTask(''); setCalaCompetency(''); setCalaMaxMarks(50); setCalaSubjectId(''); setCalaEditingId(null); };

    const openCreateCala = () => { resetCalaForm(); openCalaDrawer(); };

    const openEditCala = (c: CalaRecord) => {
        setCalaEditingId(c.id);
        setCalaTitle(c.title);
        setCalaTask(c.task);
        setCalaCompetency(c.competency);
        setCalaMaxMarks(c.maxMarks);
        setCalaSubjectId(c.subject?.id || '');
        openCalaDrawer();
    };

    const handleSaveCala = async () => {
        if (!calaTitle || !calaTask || !calaCompetency || calaMaxMarks === '') return;
        setCalaSaving(true);
        try {
            if (calaEditingId) {
                await api.patch(`/cala/${calaEditingId}`, { title: calaTitle, task: calaTask, competency: calaCompetency, maxMarks: calaMaxMarks });
                notifications.show({ title: 'Updated', message: `CALA "${calaTitle}" updated`, color: 'green' });
            } else {
                await api.post('/cala', { title: calaTitle, task: calaTask, competency: calaCompetency, maxMarks: calaMaxMarks, subjectId: calaSubjectId || undefined });
                notifications.show({ title: 'Created', message: `CALA "${calaTitle}" created`, color: 'green' });
            }
            closeCalaDrawer();
            resetCalaForm();
            fetchCala();
        } catch { notifications.show({ title: 'Error', message: 'Failed to save CALA record', color: 'red' }); }
        finally { setCalaSaving(false); }
    };"""

new_crud = """    // ─── CALA CRUD ───
    const resetCalaForm = () => { setCalaTaskName(''); setCalaScore(''); setCalaDate(''); setCalaTeacherRemarks(''); setCalaMaxMarks(50); setCalaSubjectId(''); setCalaStudentId(''); setCalaTermId(''); setCalaEditingId(null); };

    const openCreateCala = () => { resetCalaForm(); openCalaDrawer(); };

    const openEditCala = (c: CalaRecord) => {
        setCalaEditingId(c.id);
        setCalaTaskName(c.taskName || c.title || '');
        setCalaScore(c.score || c.marks || '');
        setCalaMaxMarks(c.maxScore || c.maxMarks || 50);
        setCalaSubjectId(c.subject?.id || '');
        setCalaStudentId(c.student?.id || '');
        setCalaTermId(c.term?.id || '');
        setCalaDate(c.date ? new Date(c.date).toISOString().split('T')[0] : '');
        setCalaTeacherRemarks(c.teacherRemarks || c.comment || '');
        openCalaDrawer();
    };

    const handleSaveCala = async () => {
        if (!calaTaskName || calaScore === '' || calaMaxMarks === '' || !calaStudentId || !calaTermId || !calaDate) return;
        setCalaSaving(true);
        const payload = {
            taskName: calaTaskName,
            score: Number(calaScore),
            maxScore: Number(calaMaxMarks),
            subjectId: calaSubjectId,
            studentId: calaStudentId,
            termId: calaTermId,
            date: calaDate,
            teacherRemarks: calaTeacherRemarks
        };
        try {
            if (calaEditingId) {
                await api.patch(`/cala/${calaEditingId}`, payload);
                notifications.show({ title: 'Updated', message: `CALA updated`, color: 'green' });
            } else {
                await api.post('/cala', payload);
                notifications.show({ title: 'Created', message: `CALA created`, color: 'green' });
            }
            closeCalaDrawer();
            resetCalaForm();
            fetchCala();
        } catch { notifications.show({ title: 'Error', message: 'Failed to save CALA record', color: 'red' }); }
        finally { setCalaSaving(false); }
    };"""

text = text.replace(old_crud, new_crud)

# Replace CALA Table

old_cala_table = """                                        <Table.Tr>
                                            <Table.Th>Title</Table.Th>
                                            <Table.Th>Task</Table.Th>
                                            <Table.Th>Competency</Table.Th>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Student</Table.Th>
                                            <Table.Th>Max Marks</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {calaRecords.map(c => (
                                            <Table.Tr key={c.id}>
                                                <Table.Td><Text size="sm" fw={500}>{c.title}</Text></Table.Td>
                                                <Table.Td><Text size="sm" lineClamp={1}>{c.task}</Text></Table.Td>
                                                <Table.Td><Badge variant="light" color="teal">{c.competency}</Badge></Table.Td>
                                                <Table.Td><Badge variant="light" color="grape">{c.subject?.name || '—'}</Badge></Table.Td>
                                                <Table.Td><Text size="sm">{c.student ? `${c.student.firstName} ${c.student.lastName}` : '—'}</Text></Table.Td>
                                                <Table.Td><Text size="sm" fw={600}>{c.maxMarks}</Text></Table.Td>"""

new_cala_table = """                                        <Table.Tr>
                                            <Table.Th>Task Name</Table.Th>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Student</Table.Th>
                                            <Table.Th>Term</Table.Th>
                                            <Table.Th>Score</Table.Th>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {calaRecords.map((c: any) => (
                                            <Table.Tr key={c.id}>
                                                <Table.Td><Text size="sm" fw={500}>{c.taskName || c.title}</Text></Table.Td>
                                                <Table.Td><Badge variant="light" color="grape">{c.subject?.name || '—'}</Badge></Table.Td>
                                                <Table.Td><Text size="sm">{c.student ? `${c.student.firstName} ${c.student.lastName}` : '—'}</Text></Table.Td>
                                                <Table.Td><Text size="sm">{c.term?.name || '—'}</Text></Table.Td>
                                                <Table.Td><Text size="sm" fw={600}>{c.score || c.marks} / {c.maxScore || c.maxMarks}</Text></Table.Td>
                                                <Table.Td><Text size="sm">{c.date ? format(new Date(c.date), 'MMM dd, yyyy') : '—'}</Text></Table.Td>"""

text = text.replace(old_cala_table, new_cala_table)

# Replace CALA Drawer

old_cala_drawer = """            {/* ═══════════ CALA DRAWER ═══════════ */}
            <Drawer opened={calaDrawerOpened} onClose={closeCalaDrawer} title={calaEditingId ? 'Edit CALA Record' : 'Add CALA Record'} position="right" size="md" padding="lg">
                <Stack gap="md">
                    <TextInput label="Title" placeholder="E.g., Practical Investigation — Acids" value={calaTitle} onChange={e => setCalaTitle(e.target.value)} required />
                    <Textarea label="Task Description" placeholder="Describe the activity, objectives, and expected outcomes..." value={calaTask} onChange={e => setCalaTask(e.target.value)} minRows={3} required />
                    <TextInput label="Competency" placeholder="E.g., Scientific Investigation, Problem Solving" value={calaCompetency} onChange={e => setCalaCompetency(e.target.value)} required />
                    {!calaEditingId && (
                        <Select label="Subject" placeholder="Select subject" data={availableSubjects} value={calaSubjectId} onChange={v => setCalaSubjectId(v || '')} searchable />
                    )}
                    <NumberInput label="Max Marks" placeholder="50" value={calaMaxMarks} onChange={v => setCalaMaxMarks(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)} required min={1} />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeCalaDrawer}>Cancel</Button>
                        <Button color="green" onClick={handleSaveCala} loading={calaSaving} disabled={!calaTitle || !calaTask || !calaCompetency || calaMaxMarks === ''}>
                            {calaEditingId ? 'Update' : 'Create'}
                        </Button>
                    </Group>
                </Stack>
            </Drawer>"""

new_cala_drawer = """            {/* ═══════════ CALA DRAWER ═══════════ */}
            <Drawer opened={calaDrawerOpened} onClose={closeCalaDrawer} title={calaEditingId ? 'Edit CALA Record' : 'Add CALA Record'} position="right" size="md" padding="lg">
                <Stack gap="md">
                    <TextInput label="Task Name" placeholder="E.g., Practical Investigation — Acids" value={calaTaskName} onChange={e => setCalaTaskName(e.target.value)} required />
                    
                    {!sectionId && !calaEditingId && (
                        <Select label="Target Class" placeholder="Select class" data={availableClasses} value={selectedGlobalSectionId} onChange={setSelectedGlobalSectionId} searchable />
                    )}

                    <Select label="Student" placeholder="Select student" data={availableStudents} value={calaStudentId} onChange={v => setCalaStudentId(v || '')} required searchable />
                    <Select label="Subject" placeholder="Select subject" data={availableSubjects} value={calaSubjectId} onChange={v => setCalaSubjectId(v || '')} searchable required />
                    <Select label="Term" placeholder="Select EXAM term" data={availableTerms} value={calaTermId} onChange={v => setCalaTermId(v || '')} searchable required />
                    
                    <Group grow>
                        <NumberInput label="Score" placeholder="Earned marks" value={calaScore} onChange={v => setCalaScore(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)} required min={0} />
                        <NumberInput label="Max Score" placeholder="50" value={calaMaxMarks} onChange={v => setCalaMaxMarks(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)} required min={1} />
                    </Group>
                    
                    <TextInput label="Date" type="date" value={calaDate} onChange={e => setCalaDate(e.target.value)} required />
                    <Textarea label="Teacher Remarks" placeholder="Comments..." value={calaTeacherRemarks} onChange={e => setCalaTeacherRemarks(e.target.value)} minRows={2} />
                    
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeCalaDrawer}>Cancel</Button>
                        <Button color="green" onClick={handleSaveCala} loading={calaSaving} disabled={!calaTaskName || calaScore === '' || calaMaxMarks === '' || !calaStudentId || !calaTermId || !calaDate}>
                            {calaEditingId ? 'Update' : 'Create'}
                        </Button>
                    </Group>
                </Stack>
            </Drawer>"""

text = text.replace(old_cala_drawer, new_cala_drawer)

with open(assignment_file, 'w', encoding='utf-8') as f:
    f.write(text)


####### Fix Course Materials File #######

with open(materials_file, 'r', encoding='utf-8') as f:
    materials_text = f.read()

import_statement = "import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, TextInput, Select, Drawer, Textarea, ScrollArea, SimpleGrid, Paper, ThemeIcon, Modal, FileInput } from '@mantine/core';"
materials_text = materials_text.replace("import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, TextInput, Select, Drawer, Textarea, ScrollArea, SimpleGrid, Paper, ThemeIcon, Modal } from '@mantine/core';", import_statement)

imports_extra = "import { IconUpload, IconFile, IconTrash, IconDownload, IconEdit, IconSearch, IconFileText, IconPhoto, IconVideo, IconFileSpreadsheet, IconCloudDownload, IconFileCheck } from '@tabler/icons-react';"
materials_text = materials_text.replace("import { IconUpload, IconFile, IconTrash, IconDownload, IconEdit, IconSearch, IconFileText, IconPhoto, IconVideo, IconFileSpreadsheet, IconCloudDownload } from '@tabler/icons-react';", imports_extra)

storage_import = "import { storageService } from '../../services/storageService';\n"
materials_text = materials_text.replace("import { api } from '../../services/api';", "import { api } from '../../services/api';\n" + storage_import)

# State for file
file_state = """    const [description, setDescription] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);"""
materials_text = materials_text.replace("    const [description, setDescription] = useState('');\n    const [fileUrl, setFileUrl] = useState('');", file_state)

reset_form = "const resetForm = () => { setTitle(''); setDescription(''); setFileUrl(''); setFile(null); setSubjectId(''); setEditingId(null); if (!sectionId) setSelectedGlobalSectionId(null); };"
materials_text = materials_text.replace("const resetForm = () => { setTitle(''); setDescription(''); setFileUrl(''); setSubjectId(''); setEditingId(null); if (!sectionId) setSelectedGlobalSectionId(null); };", reset_form)

handle_save_old = """    const handleSave = async () => {
        const targetSectionId = sectionId || selectedGlobalSectionId;
        if (!title || !fileUrl) return;
        setSaving(true);
        try {
            if (editingId) {
                // Update — backend may not have a PATCH for materials via teacher controller, 
                // so we delete and re-create as workaround
                await api.delete(`/teacher/materials/${editingId}`);
                if (targetSectionId && subjectId) {
                    await api.post(`/teacher/classes/${targetSectionId}/materials`, {
                        title, description, fileUrl,
                        fileType: fileUrl.split('.').pop() || 'unknown',
                        subjectId,
                    });
                }
                notifications.show({ title: 'Updated', message: `"${title}" updated successfully`, color: 'green' });
            } else {
                if (!subjectId || !targetSectionId) return;
                await api.post(`/teacher/classes/${targetSectionId}/materials`, {
                    title, description, fileUrl,
                    fileType: fileUrl.split('.').pop() || 'unknown',
                    subjectId,
                });
                notifications.show({ title: 'Uploaded', message: `"${title}" uploaded successfully`, color: 'green' });
            }
            closeDrawer();
            resetForm();
            fetchMaterials();
        } catch { notifications.show({ title: 'Error', message: 'Failed to save material', color: 'red' }); }
        finally { setSaving(false); }
    };"""

handle_save_new = """    const handleSave = async () => {
        const targetSectionId = sectionId || selectedGlobalSectionId;
        if (!title || (!fileUrl && !file)) return;
        setSaving(true);
        try {
            let uploadedUrl = fileUrl;
            let fileType = fileUrl ? fileUrl.split('.').pop() || 'unknown' : 'unknown';

            if (file) {
                const path = await storageService.uploadDocument('materials', file.name, file);
                uploadedUrl = storageService.getPublicUrl('documents', path);
                fileType = file.name.split('.').pop() || 'unknown';
            }

            if (editingId) {
                await api.delete(`/teacher/materials/${editingId}`);
                if (targetSectionId && subjectId) {
                    await api.post(`/teacher/classes/${targetSectionId}/materials`, {
                        title, description, fileUrl: uploadedUrl,
                        fileType,
                        subjectId,
                    });
                }
                notifications.show({ title: 'Updated', message: `"${title}" updated successfully`, color: 'green' });
            } else {
                if (!subjectId || !targetSectionId) return;
                await api.post(`/teacher/classes/${targetSectionId}/materials`, {
                    title, description, fileUrl: uploadedUrl,
                    fileType,
                    subjectId,
                });
                notifications.show({ title: 'Uploaded', message: `"${title}" uploaded successfully`, color: 'green' });
            }
            closeDrawer();
            resetForm();
            fetchMaterials();
        } catch { notifications.show({ title: 'Error', message: 'Failed to save material', color: 'red' }); }
        finally { setSaving(false); }
    };"""

materials_text = materials_text.replace(handle_save_old, handle_save_new)

drawer_inputs_old = """                    <TextInput
                        label="File URL"
                        placeholder="https://link-to-your-file.pdf"
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        required
                        description="Paste a direct link to the file. Supports PDFs, videos, images, documents."
                    />"""

drawer_inputs_new = """                    <FileInput
                        label="Upload File"
                        placeholder="Select file from computer"
                        value={file}
                        onChange={setFile}
                        leftSection={<IconUpload size={14} />}
                        required={!fileUrl}
                        description="Upload a local file or provide a URL below."
                        clearable
                    />
                    <TextInput
                        label="Or File URL"
                        placeholder="https://link-to-your-file.pdf"
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        required={!file}
                        disabled={!!file}
                        description="Paste a direct link to the file if it's hosted elsewhere."
                    />"""

materials_text = materials_text.replace(drawer_inputs_old, drawer_inputs_new)

button_disabled_old = "loading={saving} disabled={!title || !fileUrl}>"
button_disabled_new = "loading={saving} disabled={!title || (!fileUrl && !file)}>"
materials_text = materials_text.replace(button_disabled_old, button_disabled_new)

with open(materials_file, 'w', encoding='utf-8') as f:
    f.write(materials_text)

print("Done")
