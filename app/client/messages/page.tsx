import React from 'react';
import { ChatInterface } from '@/components/messaging/ChatInterface';

export const metadata = {
    title: 'Messages | GigNest',
    description: 'Chat with your active contract partners on GigNest.',
};

export default function ClientMessagesPage() {
    return <ChatInterface role="CLIENT" />;
}
