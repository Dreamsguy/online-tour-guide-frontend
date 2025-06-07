import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import * as signalR from '@microsoft/signalr';

function Chat() {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'Guide' && user.role !== 'Manager')) {
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5248/chatHub') // Замените на ваш URL
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [user]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('SignalR Connected');
          connection.on('ReceiveMessage', (senderId, message) => {
            setMessages(prev => [...prev, { senderId, message, timestamp: new Date() }]);
          });
        })
        .catch(err => console.error('SignalR Connection Error:', err));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection && message && receiverId) {
      try {
        await connection.invoke('SendMessage', user.id, parseInt(receiverId), message);
        setMessages(prev => [...prev, { senderId: user.id, message, timestamp: new Date() }]);
        setMessage('');
      } catch (err) {
        console.error('Send Error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Чат</h1>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <input
            type="number"
            placeholder="ID получателя"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 mb-4"
          />
          <div className="mb-4 h-64 overflow-y-auto">
            {messages.map((msg, index) => (
              <p key={index}>
                {msg.senderId}: {msg.message} ({msg.timestamp.toLocaleTimeString()})
              </p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Сообщение"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
          />
          <button
            onClick={sendMessage}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition mt-4"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;