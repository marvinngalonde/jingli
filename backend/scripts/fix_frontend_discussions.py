import os
import re

discussions_file = r'C:\arvip\jingli\frontend\src\pages\teacher\TeacherDiscussions.tsx'

with open(discussions_file, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
import_statement = "import { useState, useEffect } from 'react';"
text = text.replace("import { useState } from 'react';", import_statement)

api_import = "import { api } from '../../services/api';\nimport { Title, Text"
text = text.replace("import { Title, Text", api_import)

# 2. State and initial effect
old_state = """export default function TeacherDiscussions() {
    const [threads, setThreads] = useState<Thread[]>(mockThreads);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);"""

new_state = """export default function TeacherDiscussions() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/discussions');
            setThreads(data);
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to load discussions', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, []);"""

text = text.replace(old_state, new_state)

# 3. Create thread
old_create = """    const handleCreateThread = (values: typeof threadForm.values) => {
        const thread: Thread = {
            id: `t-${nextThreadId++}`,
            title: values.title,
            body: values.body,
            subject: values.subject,
            classSection: values.classSection,
            author: 'You',
            authorRole: 'teacher',
            replies: [],
            pinned: false,
            locked: false,
            createdAt: new Date().toISOString(),
        };
        setThreads(prev => [thread, ...prev]);
        setCreateModal(false);
        threadForm.reset();
        notifications.show({ id: 'thread-create', title: 'Posted', message: 'Discussion thread created', color: 'green' });
    };"""

new_create = """    const handleCreateThread = async (values: typeof threadForm.values) => {
        try {
            await api.post('/discussions', values);
            setCreateModal(false);
            threadForm.reset();
            notifications.show({ title: 'Posted', message: 'Discussion thread created', color: 'green' });
            fetchThreads();
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to create thread', color: 'red' });
        }
    };"""

text = text.replace(old_create, new_create)

# 4. Reply
old_reply = """    const handleReply = () => {
        if (!replyText.trim() || !activeThread) return;
        const reply: Reply = {
            id: `r-${nextReplyId++}`,
            author: 'You (Teacher)',
            role: 'teacher',
            content: replyText,
            createdAt: new Date().toISOString(),
        };
        const updated = { ...activeThread, replies: [...activeThread.replies, reply] };
        setActiveThread(updated);
        setThreads(prev => prev.map(t => t.id === updated.id ? updated : t));
        setReplyText('');
    };"""

new_reply = """    const handleReply = async () => {
        if (!replyText.trim() || !activeThread) return;
        try {
            await api.post(`/discussions/${activeThread.id}/replies`, { content: replyText });
            setReplyText('');
            
            // Refetch threads and update active thread
            const { data } = await api.get('/discussions');
            setThreads(data);
            const updatedActive = data.find((t: Thread) => t.id === activeThread.id);
            if (updatedActive) setActiveThread(updatedActive);
            
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to post reply', color: 'red' });
        }
    };"""

text = text.replace(old_reply, new_reply)

# 5. Toggle Pin and Lock
old_pin = """    const togglePin = (thread: Thread) => {
        const updated = { ...thread, pinned: !thread.pinned };
        setThreads(prev => prev.map(t => t.id === updated.id ? updated : t));
        if (activeThread?.id === updated.id) setActiveThread(updated);
        notifications.show({ id: 'pin', title: updated.pinned ? 'Pinned' : 'Unpinned', message: `Thread ${updated.pinned ? 'pinned' : 'unpinned'}`, color: 'blue' });
    };

    const toggleLock = (thread: Thread) => {
        const updated = { ...thread, locked: !thread.locked };
        setThreads(prev => prev.map(t => t.id === updated.id ? updated : t));
        if (activeThread?.id === updated.id) setActiveThread(updated);
        notifications.show({ id: 'lock', title: updated.locked ? 'Locked' : 'Unlocked', message: `Thread ${updated.locked ? 'locked' : 'unlocked'}`, color: 'orange' });
    };"""

new_pin = """    const togglePin = async (thread: Thread) => {
        try {
            const res = await api.put(`/discussions/${thread.id}/pin`);
            fetchThreads();
            if (activeThread?.id === thread.id && res.data) {
                setActiveThread({ ...activeThread, pinned: res.data.pinned });
            }
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to pin thread', color: 'red' });
        }
    };

    const toggleLock = async (thread: Thread) => {
        try {
            const res = await api.put(`/discussions/${thread.id}/lock`);
            fetchThreads();
            if (activeThread?.id === thread.id && res.data) {
                setActiveThread({ ...activeThread, locked: res.data.locked });
            }
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to lock thread', color: 'red' });
        }
    };"""

text = text.replace(old_pin, new_pin)

# Loading Overlay (optional visual enhancement)
old_return = "    return (\n        <div>"
new_return = "    return (\n        <div style={{ position: 'relative' }}>\n            {loading && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', paddingTop: 50 }}>Loading...</div>}"
text = text.replace(old_return, new_return)


with open(discussions_file, 'w', encoding='utf-8') as f:
    f.write(text)

print("Re-wired TeacherDiscussions API")
