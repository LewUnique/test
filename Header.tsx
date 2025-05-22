import { useState } from 'react';

interface HeaderProps {
  isConnected: boolean;
}

export default function Header({ isConnected }: HeaderProps) {
  return (
    <header className="bg-discord-darker p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="material-icons text-discord-primary mr-2">smart_toy</span>
          <h1 className="text-xl font-bold text-white">Discord Guide Bot Panel</h1>
        </div>
        <div>
          <span className={`px-3 py-1 ${isConnected ? 'bg-green-500' : 'bg-discord-danger'} text-white rounded-full text-xs font-medium`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}
