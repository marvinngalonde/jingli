export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
    readAt: string | null;
    sender: {
        email: string;
        staffProfile?: { firstName: string; lastName: string };
        studentProfile?: { firstName: string; lastName: string };
    };
}

export interface Conversation {
    partner: {
        id: string;
        email: string;
        role: string;
        staffProfile?: { firstName: string; lastName: string };
        studentProfile?: { firstName: string; lastName: string };
    };
    lastMessage: Message;
}

export interface CreateMessageDto {
    senderId: string;
    receiverId: string;
    content: string;
}
