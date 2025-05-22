import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BotLog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch logs
  const { data: logs, isLoading } = useQuery<BotLog[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/logs', undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      toast({
        title: "Logs Cleared",
        description: "All logs have been cleared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to clear logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Export logs
  const handleExportLogs = () => {
    // Create a download link for the logs export endpoint
    const downloadLink = document.createElement('a');
    downloadLink.href = '/api/logs/export';
    downloadLink.download = 'discord-bot-logs.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({
      title: "Logs Exported",
      description: "Your logs have been exported successfully.",
    });
  };

  // Clear logs with confirmation
  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      clearLogsMutation.mutate();
    }
  };

  // Get CSS class for log level
  const getLogLevelClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Format log timestamp
  const formatLogTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `[${date.toISOString().replace('T', ' ').substring(0, 19)}]`;
  };

  return (
    <div className="bg-discord-secondary rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="material-icons mr-2 text-discord-primary">receipt_long</span>
        Bot Logs
      </h2>
      
      {isLoading ? (
        <Skeleton className="h-48 w-full bg-discord-darker rounded-lg" />
      ) : (
        <div className="bg-discord-darker rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className={getLogLevelClass(log.level)}>
                {formatLogTimestamp(log.timestamp.toString())} {log.message}
              </div>
            ))
          ) : (
            <div className="text-discord-light">No logs available</div>
          )}
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="ghost" 
          className="text-discord-light hover:text-white text-sm flex items-center h-auto"
          onClick={handleExportLogs}
        >
          <span className="material-icons mr-1 text-sm">download</span>
          Export Logs
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-discord-light hover:text-white text-sm flex items-center h-auto"
          onClick={handleClearLogs}
          disabled={clearLogsMutation.isPending}
        >
          <span className="material-icons mr-1 text-sm">delete</span>
          {clearLogsMutation.isPending ? 'Clearing...' : 'Clear Logs'}
        </Button>
      </div>
    </div>
  );
}
