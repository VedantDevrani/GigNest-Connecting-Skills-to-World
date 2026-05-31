import React from 'react';
import { ChatInterface } from '@/components/messaging/ChatInterface';

export const metadata = {
    title: 'Messages | GigNest',
    description: 'Chat with your active contract clients on GigNest.',
};

export default function FreelancerMessagesPage() {
    return <ChatInterface role="FREELANCER" />;
}
