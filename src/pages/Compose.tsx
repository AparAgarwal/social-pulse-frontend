import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Image as ImageIcon, Video, Link as LinkIcon, ArrowLeft, Globe, Users, Lock } from 'lucide-react';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { useToast } from '../components/ui/Toast';
import { useCreatePostMutation } from '../hooks/usePosts';

export function ComposePage() {
  const navigateBack = useNavigateBack();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');

  const { mutateAsync: createPost, isPending: isSubmitting } = useCreatePostMutation();

  const handlePublish = async () => {
    if (!content.trim()) return;

    try {
      await createPost({ 
        content: { text: content.trim() },
        visibility
      });
      toast('Post published successfully!', 'success');
      navigateBack();
    } catch {
      toast('Failed to publish post', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
        <button
          className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
          onClick={navigateBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Create Post</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto w-full mt-4">
        <Card className="border border-gray-800 bg-surface/10">
          <CardHeader>
            <CardTitle>What's on your mind?</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[150px] bg-surface/30 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder:text-gray-500 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-lg"
              placeholder="Share your thoughts with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-primary-400">
                <button className="p-2.5 hover:bg-primary-500/10 rounded-full transition-colors disabled:opacity-50" disabled><ImageIcon className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-primary-500/10 rounded-full transition-colors disabled:opacity-50" disabled><Video className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-primary-500/10 rounded-full transition-colors disabled:opacity-50" disabled><LinkIcon className="w-5 h-5" /></button>
                
                <div className="relative group ml-4">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as 'public' | 'followers' | 'private')}
                    className="appearance-none bg-surface/30 border border-white/10 text-sm text-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500/50 pr-10 hover:bg-surface/50 cursor-pointer transition-colors"
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers</option>
                    <option value="private">Private</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    {visibility === 'public' && <Globe className="w-4 h-4" />}
                    {visibility === 'followers' && <Users className="w-4 h-4" />}
                    {visibility === 'private' && <Lock className="w-4 h-4" />}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handlePublish}
                disabled={!content.trim() || isSubmitting}
                className="rounded-full px-8 font-bold shadow-lg shadow-primary-500/10"
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
