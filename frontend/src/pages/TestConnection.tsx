import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState('disconnected');
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testConnection = async () => {
    try {
      setStatus('connecting');
      addMessage('🔌 Starting connection test...');
      
      await socketService.connect();
      setStatus('connected');
      addMessage('✅ Connected successfully!');
      
      // Test basic functionality
      setTimeout(() => {
        addMessage('🧪 Connection test completed');
      }, 2000);
      
    } catch (error) {
      setStatus('failed');
      addMessage(`❌ Connection failed: ${error}`);
    }
  };

  const disconnect = () => {
    socketService.disconnect();
    setStatus('disconnected');
    addMessage('🔌 Disconnected');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>WebSocket Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
        <button onClick={testConnection} disabled={status === 'connecting'}>
          Test Connection
        </button>
        <button onClick={disconnect} style={{ marginLeft: '10px' }}>
          Disconnect
        </button>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '300px', 
        overflow: 'auto',
        backgroundColor: '#f5f5f5'
      }}>
        <h3>Connection Log:</h3>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestConnection;
