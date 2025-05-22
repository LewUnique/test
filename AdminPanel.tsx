import { useState } from 'react';
import Header from '@/components/Header';
import ConfigPanel from '@/components/ConfigPanel';
import PreviewPanel from '@/components/PreviewPanel';
import LogsPanel from '@/components/LogsPanel';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPanel() {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  
  // Fetch guides to pass along to components
  const { data: guides, isLoading } = useQuery({
    queryKey: ['/api/guides'],
  });

  // Fetch bot config
  const { data: botConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['/api/bot-config'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-discord-dark text-white">
      <Header isConnected={Boolean(botConfig)} />
      
      <div className="container mx-auto p-4 mt-4 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Config Panel - Left Column */}
          <div className="col-span-1 lg:col-span-1">
            {isLoading || isLoadingConfig ? (
              <Skeleton className="h-[800px] w-full bg-discord-secondary rounded-lg" />
            ) : (
              <ConfigPanel 
                guides={guides || []} 
                botConfig={botConfig}
                selectedGuide={selectedGuide}
                setSelectedGuide={setSelectedGuide}
              />
            )}
          </div>
          
          {/* Preview and Logs - Right Column */}
          <div className="col-span-1 lg:col-span-2">
            <PreviewPanel 
              guides={guides || []}
              selectedGuide={selectedGuide}
            />
            <LogsPanel />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
