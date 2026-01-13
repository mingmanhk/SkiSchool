
'use client'

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import MessageComposer from './MessageComposer';

export default function MessageThreadView({ messages: initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const params = useParams();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);


  const handleNewMessage = (newMessage) => {
    setMessages(currentMessages => [...currentMessages, newMessage]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto p-4 flex-grow">
        {messages.map(message => (
          <div key={message.id} className="mb-4">
            <div className="font-bold">{message.sender_first_name} {message.sender_last_name}</div>
            <div>{message.body}</div>
            <div className="text-xs text-gray-500">{new Date(message.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <MessageComposer threadId={params.threadId as string} onNewMessage={handleNewMessage} />
      </div>
    </div>
  );
}
