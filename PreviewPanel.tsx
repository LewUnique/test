import { useState, useEffect } from 'react';
import { Guide } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface PreviewPanelProps {
  guides: Guide[];
  selectedGuide: string | null;
}

export default function PreviewPanel({ guides, selectedGuide }: PreviewPanelProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  
  const selectedGuideData = selectedGuide 
    ? guides.find(g => g.id.toString() === selectedGuide) 
    : guides.length > 0 ? guides[0] : null;

  // Reset and show dropdown when a guide is selected
  useEffect(() => {
    if (selectedGuide) {
      // Reset sequence
      setShowDropdown(false);
      setShowUserSelection(false);
      setShowResponse(false);
      
      // Start sequence
      const timer1 = setTimeout(() => setShowDropdown(true), 300);
      const timer2 = setTimeout(() => setShowUserSelection(true), 1000);
      const timer3 = setTimeout(() => setShowResponse(true), 1500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [selectedGuide]);

  return (
    <div className="bg-discord-secondary rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <span className="material-icons mr-2 text-discord-primary">visibility</span>
        Discord Preview
      </h2>
      
      {/* Discord Server Preview */}
      <div className="bg-discord-dark rounded-lg overflow-hidden border border-gray-800">
        {/* Server Header */}
        <div className="bg-discord-darker p-3 flex items-center">
          <span className="material-icons text-discord-light mr-2">tag</span>
          <span className="text-white font-medium">guides</span>
        </div>
        
        {/* Channel Content */}
        <div className="h-[500px] p-4 overflow-y-auto">
          {/* Bot Message */}
          <div className="flex mb-4">
            <div className="flex-shrink-0 mr-3">
              {/* Bot avatar */}
              <div className="w-10 h-10 rounded-full bg-discord-primary flex items-center justify-center">
                <span className="material-icons text-white">smart_toy</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="font-semibold text-white mr-2">Guide Bot</span>
                <span className="text-xs text-discord-light">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="bg-discord-secondary border border-gray-700 rounded-md p-4">
                <p className="text-white mb-3">Need help with something?<br/>Select a topic below:</p>
                
                {/* Discord Select Menu Preview */}
                <div className="bg-discord-darker rounded-md overflow-hidden border border-gray-700">
                  <div className={`p-2 text-white text-sm ${showDropdown ? 'bg-discord-primary' : ''}`}>
                    Select guide topic...
                  </div>
                  <div className="p-2 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-xs text-discord-light">Select an option</span>
                    <span className="material-icons text-discord-light text-sm">
                      {showDropdown ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                  
                  {/* Dropdown Options */}
                  {showDropdown && (
                    <div className="max-h-48 overflow-y-auto border-t border-gray-700">
                      {guides.map((guide) => (
                        <div 
                          key={guide.id}
                          className={`p-2 hover:bg-discord-secondary cursor-pointer flex items-center ${selectedGuideData?.id === guide.id ? 'bg-discord-secondary' : ''}`}
                        >
                          <span className="text-sm text-white">{guide.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* User Interaction */}
          {showUserSelection && selectedGuideData && (
            <div className="rounded-md border border-gray-700 bg-discord-darker p-3 mx-16 mb-4 max-w-md">
              <div className="text-xs text-discord-light mb-1">
                <span>user123</span> selected <span className="text-discord-primary">{selectedGuideData.label}</span>
              </div>
            </div>
          )}
          
          {/* Ephemeral Response */}
          {showResponse && selectedGuideData && (
            <div className="rounded-md border border-indigo-600 bg-discord-darker p-4 mx-16 mb-4 max-w-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-discord-primary flex items-center justify-center mr-2">
                    <span className="material-icons text-white text-xs">smart_toy</span>
                  </div>
                  <span className="font-semibold text-white text-sm">Guide Bot</span>
                </div>
                <div className="text-xs text-discord-light italic">Only you can see this</div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>
                  {selectedGuideData.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
