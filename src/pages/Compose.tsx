
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Image as ImageIcon, Video, Link as LinkIcon, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigateBack } from '../hooks/useNavigateBack';


export function ComposePage() {
  const navigateBack = useNavigateBack();

  return (
    <div className="flex flex-col w-full min-h-full">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
        <Button
          variant="ghost"
          className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-3"
          onClick={navigateBack}
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Button>
        <h1 className="text-xl font-bold">Create Post</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto w-full mt-4">
        <Card className="border border-gray-800">
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[150px] bg-surface/50 border border-gray-700 rounded-md p-3 text-gray-100 placeholder:text-gray-500 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="What do you want to share with the developer community?"
              disabled
            />

            <div className="flex items-center justify-between opacity-50 select-none">
              <div className="flex space-x-4 text-primary-500">
                <button className="p-2 hover:bg-surface rounded-full"><ImageIcon className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-surface rounded-full"><Video className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-surface rounded-full"><LinkIcon className="w-5 h-5" /></button>
              </div>
              <Button disabled>Publish</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-600">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-500">Posts API Not Available Yet</h3>
            <p className="text-sm text-yellow-500/80 mt-1">
              The backend for post creation is currently on the roadmap.
              Once the data models and routes are merged, this feature will be enabled automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
