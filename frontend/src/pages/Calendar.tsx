import React, { useState, useEffect } from 'react';
import { Title, Text, Button, Group, Card, Modal, TextInput, Textarea, Select, Stack, ColorInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconPlus } from '@tabler/icons-react';
import { api } from '../services/api';

interface SchoolEvent {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    type: string;
    allDay: boolean;
    location?: string;
}

const CalendarPage = () => {
    const [events, setEvents] = useState<SchoolEvent[]>([]);
    const [opened, setOpened] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            type: 'GENERAL',
            location: '',
            allDay: false
        },
        validate: {
            title: (value) => (value.length < 2 ? 'Title must be at least 2 characters' : null),
        },
    });

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            const formattedEvents = response.data.map((event: any) => ({
                id: event.id,
                title: event.title,
                start: event.startDate,
                end: event.endDate,
                allDay: event.allDay,
                extendedProps: { ...event },
                backgroundColor: getEventColor(event.type),
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getEventColor = (type: string) => {
        switch (type) {
            case 'HOLIDAY': return '#f03e3e';
            case 'EXAM': return '#1c7ed6';
            case 'SPORTS': return '#40c057';
            default: return '#7048e8';
        }
    };

    const handleSubmit = async (values: typeof form.values) => {
        try {
            if (selectedEvent) {
                await api.patch(`/events/${selectedEvent.id}`, values);
                notifications.show({ title: 'Success', message: 'Event updated successfully', color: 'green' });
            } else {
                await api.post('/events', values);
                notifications.show({ title: 'Success', message: 'Event created successfully', color: 'green' });
            }
            setOpened(false);
            form.reset();
            setSelectedEvent(null);
            fetchEvents();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to save event', color: 'red' });
        }
    };

    const handleDateClick = (arg: any) => {
        form.reset();
        form.setValues({
            ...form.values,
            startDate: arg.date,
            endDate: arg.date
        });
        setSelectedEvent(null);
        setOpened(true);
    };

    const handleEventClick = (arg: any) => {
        const eventData = arg.event.extendedProps;
        setSelectedEvent(eventData);
        form.setValues({
            title: eventData.title,
            description: eventData.description || '',
            startDate: new Date(eventData.startDate),
            endDate: new Date(eventData.endDate),
            type: eventData.type,
            location: eventData.location || '',
            allDay: eventData.allDay
        });
        setOpened(true);
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <div>
                    <Title order={2}>School Calendar</Title>
                    <Text c="dimmed">Manage school events, holidays, and exam schedules</Text>
                </div>
                <Button leftSection={<IconPlus size={18} />} onClick={() => { form.reset(); setSelectedEvent(null); setOpened(true); }}>
                    Add Event
                </Button>
            </Group>

            <Card withBorder radius="md" p="md">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events as any}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="70vh"
                />
            </Card>

            <Modal opened={opened} onClose={() => setOpened(false)} title={selectedEvent ? 'Edit Event' : 'Add New Event'}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput label="Event Title" placeholder="e.g., Annual Sports Day" required {...form.getInputProps('title')} />
                        <Textarea label="Description" placeholder="Event details..." {...form.getInputProps('description')} />
                        <Group grow>
                            <DatePickerInput label="Start Date" required {...form.getInputProps('startDate')} />
                            <DatePickerInput label="End Date" required {...form.getInputProps('endDate')} />
                        </Group>
                        <Select
                            label="Event Type"
                            data={[
                                { value: 'GENERAL', label: 'General' },
                                { value: 'HOLIDAY', label: 'Holiday' },
                                { value: 'EXAM', label: 'Exam' },
                                { value: 'SPORTS', label: 'Sports' },
                            ]}
                            {...form.getInputProps('type')}
                        />
                        <TextInput label="Location" placeholder="School Hall, Playground, etc." {...form.getInputProps('location')} />
                        <Button type="submit" fullWidth mt="md">
                            {selectedEvent ? 'Update Event' : 'Create Event'}
                        </Button>
                        {selectedEvent && (
                            <Button color="red" variant="light" fullWidth onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this event?')) {
                                    await api.delete(`/events/${selectedEvent.id}`);
                                    setOpened(false);
                                    fetchEvents();
                                }
                            }}>Delete Event</Button>
                        )}
                    </Stack>
                </form>
            </Modal>
        </Stack>
    );
};

export default CalendarPage;
