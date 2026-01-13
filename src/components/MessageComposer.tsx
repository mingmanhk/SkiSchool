
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-react';

export default function MessageComposer({ threadId, onNewMessage }) {
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const optimisticMessage = {
      id: Math.random().toString(), // Temporary ID
      thread_id: threadId,
      sender_id: user.id,
      body: message,
      created_at: new Date().toISOString(),
      sender_first_name: user.user_metadata.first_name || 'You',
      sender_last_name: user.user_metadata.last_name || '',
    };

    onNewMessage(optimisticMessage);
    setMessage('');

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({ thread_id: threadId, sender_id: user.id, body: message })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      // Handle error, maybe revert optimistic update
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
      />
    </form>
  );
}
