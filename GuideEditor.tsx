import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Guide } from '@/lib/types';

interface GuideEditorProps {
  guides: Guide[];
  selectedGuide: Guide | null;
  onSelectGuide: (guideId: string) => void;
}

export default function GuideEditor({ guides, selectedGuide, onSelectGuide }: GuideEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [markdownHelpOpen, setMarkdownHelpOpen] = useState(false);
  const [newGuideOpen, setNewGuideOpen] = useState(false);
  const [editedLabel, setEditedLabel] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [topicKey, setTopicKey] = useState('');
  
  // Initialize form when selected guide changes
  useState(() => {
    if (selectedGuide) {
      setEditedLabel(selectedGuide.label);
      setEditedContent(selectedGuide.content);
    }
  });

  // Save guide mutation
  const saveGuideMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGuide) return null;
      return apiRequest('PUT', `/api/guides/${selectedGuide.id}`, {
        label: editedLabel,
        content: editedContent
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: "Guide Saved",
        description: "Your guide has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save guide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Delete guide mutation
  const deleteGuideMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGuide) return null;
      return apiRequest('DELETE', `/api/guides/${selectedGuide.id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: "Guide Deleted",
        description: "Your guide has been deleted successfully.",
      });
      
      // Select another guide if available
      if (guides.length > 1) {
        const otherGuide = guides.find(g => g.id !== selectedGuide?.id);
        if (otherGuide) {
          onSelectGuide(otherGuide.id.toString());
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete guide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Create new guide mutation
  const createGuideMutation = useMutation({
    mutationFn: async (newGuide: { label: string; content: string; topicKey: string }) => {
      return apiRequest('POST', '/api/guides', newGuide);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: "Guide Created",
        description: "Your new guide has been created successfully.",
      });
      setNewGuideOpen(false);
      
      // Select the newly created guide
      const newGuide = data?.json();
      if (newGuide && newGuide.id) {
        onSelectGuide(newGuide.id.toString());
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create guide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleGuideChange = (guideId: string) => {
    onSelectGuide(guideId);
    
    // Update form with selected guide data
    const guide = guides.find(g => g.id.toString() === guideId);
    if (guide) {
      setEditedLabel(guide.label);
      setEditedContent(guide.content);
    }
  };

  const handleSaveGuide = () => {
    saveGuideMutation.mutate();
  };

  const handleDeleteGuide = () => {
    if (confirm('Are you sure you want to delete this guide?')) {
      deleteGuideMutation.mutate();
    }
  };

  const handleCreateGuide = () => {
    createGuideMutation.mutate({
      label: editedLabel,
      content: editedContent,
      topicKey: topicKey
    });
  };

  // Handle opening the new guide form
  const openNewGuideDialog = () => {
    setEditedLabel('New Guide');
    setEditedContent('# New Guide\n\nAdd your guide content here.');
    setTopicKey('');
    setNewGuideOpen(true);
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-discord-light text-sm">Guide Topic Selection</Label>
        <Button 
          variant="outline" 
          className="text-xs px-2 py-1 bg-discord-dark hover:bg-opacity-80 h-auto"
          onClick={openNewGuideDialog}
        >
          <span className="material-icons text-xs inline-block align-middle mr-1">add</span> 
          New
        </Button>
      </div>
      
      <Select 
        value={selectedGuide?.id.toString()} 
        onValueChange={handleGuideChange}
      >
        <SelectTrigger className="w-full bg-discord-dark border border-gray-700 text-white mb-4">
          <SelectValue placeholder="Select guide topic..." />
        </SelectTrigger>
        <SelectContent className="bg-discord-dark border border-gray-700 text-white">
          {guides.map(guide => (
            <SelectItem key={guide.id} value={guide.id.toString()} className="focus:bg-discord-secondary focus:text-white">
              {guide.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedGuide && (
        <>
          <div className="mb-4">
            <Label className="block text-discord-light mb-2 text-sm">Guide Label (Dropdown Text)</Label>
            <Input 
              type="text" 
              value={editedLabel} 
              onChange={(e) => setEditedLabel(e.target.value)}
              className="w-full bg-discord-dark border border-gray-700 p-2 rounded text-white"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="block text-discord-light text-sm">Guide Content (Discord Markdown)</Label>
              <Dialog open={markdownHelpOpen} onOpenChange={setMarkdownHelpOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-xs text-discord-primary p-0 h-auto">Markdown Help</Button>
                </DialogTrigger>
                <DialogContent className="bg-discord-secondary text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Discord Markdown Guide</DialogTitle>
                  </DialogHeader>
                  <div className="text-discord-light text-sm">
                    <p className="mb-2">Use these markdown features to format your guides:</p>
                    <ul className="space-y-1">
                      <li><code className="bg-discord-dark px-1 rounded"># Heading 1</code> - Main title</li>
                      <li><code className="bg-discord-dark px-1 rounded">## Heading 2</code> - Section title</li>
                      <li><code className="bg-discord-dark px-1 rounded">**bold**</code> - Bold text</li>
                      <li><code className="bg-discord-dark px-1 rounded">*italic*</code> - Italic text</li>
                      <li><code className="bg-discord-dark px-1 rounded">- item</code> - Bullet list</li>
                      <li><code className="bg-discord-dark px-1 rounded">`code`</code> - Code formatting</li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Textarea 
              value={editedContent} 
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-discord-dark border border-gray-700 p-2 rounded text-white h-64 font-mono text-sm"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="destructive" 
              className="bg-discord-danger text-white hover:bg-opacity-80 h-auto py-1"
              onClick={handleDeleteGuide}
              disabled={deleteGuideMutation.isPending || guides.length <= 1}
            >
              {deleteGuideMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button 
              className="bg-discord-primary text-white hover:bg-opacity-80 h-auto py-1"
              onClick={handleSaveGuide}
              disabled={saveGuideMutation.isPending}
            >
              {saveGuideMutation.isPending ? 'Saving...' : 'Save Guide'}
            </Button>
          </div>
        </>
      )}

      {/* New Guide Dialog */}
      <Dialog open={newGuideOpen} onOpenChange={setNewGuideOpen}>
        <DialogContent className="bg-discord-secondary text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Create New Guide</DialogTitle>
            <DialogDescription className="text-discord-light">
              Add a new support guide to your dropdown menu.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-discord-light">Guide Label</Label>
              <Input 
                value={editedLabel} 
                onChange={(e) => setEditedLabel(e.target.value)}
                className="bg-discord-dark border-gray-700 text-white" 
              />
            </div>
            
            <div>
              <Label className="text-discord-light">Topic Key (unique identifier)</Label>
              <Input 
                value={topicKey} 
                onChange={(e) => setTopicKey(e.target.value)}
                className="bg-discord-dark border-gray-700 text-white" 
                placeholder="e.g. shop, commands, faq" 
              />
              <p className="text-xs text-discord-light mt-1">
                Used for internal reference, must be unique
              </p>
            </div>
            
            <div>
              <Label className="text-discord-light">Guide Content</Label>
              <Textarea 
                value={editedContent} 
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-discord-dark border-gray-700 text-white h-40 font-mono" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewGuideOpen(false)}
              className="bg-discord-dark text-white border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              className="bg-discord-primary text-white"
              onClick={handleCreateGuide}
              disabled={createGuideMutation.isPending || !editedLabel || !topicKey || !editedContent}
            >
              {createGuideMutation.isPending ? 'Creating...' : 'Create Guide'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
