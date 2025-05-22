import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import GuideEditor from './GuideEditor';
import { Guide, BotConfig } from '@/lib/types';

interface ConfigPanelProps {
  guides: Guide[];
  botConfig: BotConfig | undefined;
  selectedGuide: string | null;
  setSelectedGuide: (guideId: string | null) => void;
}

export default function ConfigPanel({ 
  guides, 
  botConfig, 
  selectedGuide, 
  setSelectedGuide 
}: ConfigPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [targetChannelId, setTargetChannelId] = useState('');
  const [showToken, setShowToken] = useState(false);
  
  useEffect(() => {
    if (botConfig?.targetChannelId) {
      setTargetChannelId(botConfig.targetChannelId);
    }
  }, [botConfig]);

  const selectedGuideData = selectedGuide 
    ? guides.find(g => g.id.toString() === selectedGuide) 
    : guides.length > 0 ? guides[0] : null;

  useEffect(() => {
    if (!selectedGuide && guides.length > 0) {
      setSelectedGuide(guides[0].id.toString());
    }
  }, [guides, selectedGuide, setSelectedGuide]);

  // Save bot configuration
  const saveBotConfigMutation = useMutation({
    mutationFn: async () => {
      if (!botConfig) return null;
      return apiRequest('PUT', `/api/bot-config/${botConfig.id}`, {
        targetChannelId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot-config'] });
      toast({
        title: "Configuration Saved",
        description: "Your bot configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Reconnect bot
  const reconnectBotMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bot/reconnect', {});
    },
    onSuccess: () => {
      toast({
        title: "Bot Reconnected",
        description: "Your bot has been reconnected successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reconnect bot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Deploy new menu
  const deployMenuMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bot/deploy-menu', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot-config'] });
      toast({
        title: "Menu Deployed",
        description: "New guide menu has been deployed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to deploy menu: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Update existing menu
  const updateMenuMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bot/update-menu', {});
    },
    onSuccess: () => {
      toast({
        title: "Menu Updated",
        description: "Guide menu has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update menu: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleSelectGuide = (value: string) => {
    setSelectedGuide(value);
  };

  const handleSaveConfig = () => {
    saveBotConfigMutation.mutate();
  };

  const handleReconnectBot = () => {
    reconnectBotMutation.mutate();
  };

  const formatDeployedTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="bg-discord-secondary rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <span className="material-icons mr-2 text-discord-primary">settings</span>
        Bot Configuration
      </h2>
      
      {/* Bot Connection Form */}
      <div className="mb-8">
        <h3 className="text-lg text-discord-light mb-4">Connection Settings</h3>
        
        <div className="mb-4">
          <Label className="block text-discord-light mb-2 text-sm">Bot Token</Label>
          <div className="relative">
            <Input 
              type={showToken ? "text" : "password"} 
              value="●●●●●●●●●●●●●●●●●●●●" 
              className="w-full bg-discord-dark border border-gray-700 p-2 rounded text-white" 
              disabled 
            />
            <button 
              className="absolute right-2 top-2 text-discord-light hover:text-white"
              onClick={() => setShowToken(!showToken)}
            >
              <span className="material-icons text-sm">
                {showToken ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <p className="text-xs text-discord-light mt-1">Your bot token is stored securely</p>
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-light mb-2 text-sm">Target Channel ID</Label>
          <Input 
            type="text" 
            value={targetChannelId} 
            onChange={(e) => setTargetChannelId(e.target.value)}
            className="w-full bg-discord-dark border border-gray-700 p-2 rounded text-white"
          />
        </div>
        
        <div className="flex justify-between mb-2">
          <Button 
            className="bg-discord-primary text-white hover:bg-opacity-80" 
            onClick={handleSaveConfig}
            disabled={saveBotConfigMutation.isPending}
          >
            {saveBotConfigMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button 
            className="bg-discord-dark text-white hover:bg-opacity-80" 
            onClick={handleReconnectBot}
            disabled={reconnectBotMutation.isPending}
          >
            {reconnectBotMutation.isPending ? 'Reconnecting...' : 'Reconnect Bot'}
          </Button>
        </div>
      </div>
      
      {/* Guide Content Configuration */}
      <div>
        <h3 className="text-lg text-discord-light mb-4">Guide Content</h3>
        
        <GuideEditor 
          guides={guides} 
          selectedGuide={selectedGuideData} 
          onSelectGuide={handleSelectGuide}
        />
      </div>
      
      {/* Deployment Controls */}
      <div className="mt-8 pt-5 border-t border-gray-700">
        <h3 className="text-lg text-discord-light mb-4">Bot Deployment</h3>
        
        <div className="bg-discord-dark p-4 rounded mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Guide Menu Status:</span>
            <span className={`px-2 py-1 ${botConfig?.messageId ? 'bg-discord-success' : 'bg-discord-warning'} text-xs rounded-full`}>
              {botConfig?.messageId ? 'Active' : 'Not Deployed'}
            </span>
          </div>
          <p className="text-xs text-discord-light">
            Last deployed: {formatDeployedTime(botConfig?.lastDeployed?.toString())}
          </p>
        </div>
        
        <div className="flex justify-between">
          <Button 
            className="bg-discord-darker text-white hover:bg-opacity-80 border border-gray-700" 
            onClick={() => updateMenuMutation.mutate()}
            disabled={updateMenuMutation.isPending || !botConfig?.messageId}
          >
            {updateMenuMutation.isPending ? 'Updating...' : 'Update Existing Menu'}
          </Button>
          
          <Button 
            className="bg-discord-primary text-white hover:bg-opacity-80" 
            onClick={() => deployMenuMutation.mutate()}
            disabled={deployMenuMutation.isPending}
          >
            {deployMenuMutation.isPending ? 'Deploying...' : 'Deploy New Menu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
