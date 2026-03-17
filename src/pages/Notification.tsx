import { AlertTriangle, Heart, UserPlus, MessageSquare, AtSign, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigateBack } from '../hooks/useNavigateBack';


const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'like',
        user: { name: 'Sarah Chen', username: 'sarahc', avatar: null },
        content: 'liked your post: "Building a Modern Blog Platform with Vibe Coding"',
        time: '2m',
        icon: Heart,
        iconColor: 'text-pink-500',
        bgColor: 'bg-pink-500/10'
    },
    {
        id: 2,
        type: 'follow',
        user: { name: 'Alex Rivera', username: 'arivera', avatar: null },
        content: 'started following you',
        time: '15m',
        icon: UserPlus,
        iconColor: 'text-primary-400',
        bgColor: 'bg-primary-500/10'
    },
    {
        id: 3,
        type: 'mention',
        user: { name: 'Dev Pulse Bot', username: 'system', avatar: null },
        content: 'mentioned you in a post: "Welcome to the community! @username"',
        time: '1h',
        icon: AtSign,
        iconColor: 'text-purple-400',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 4,
        type: 'reply',
        user: { name: 'Marcus Jones', username: 'mjones', avatar: null },
        content: 'replied to your comment: "Great insights on JWT rotation!"',
        time: '3h',
        icon: MessageSquare,
        iconColor: 'text-accent',
        bgColor: 'bg-accent/10'
    }
];

export function NotificationPage() {
    const navigateBack = useNavigateBack();

    return (
        <div className="flex flex-col w-full h-full">
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
                <Button
                    variant="ghost"
                    className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-3"
                    onClick={navigateBack}
                >
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                </Button>
                <h1 className="text-xl font-bold">Notifications</h1>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {/* Coming Soon Banner */}
                <div className="p-6 max-w-2xl mx-auto w-full">
                    <div className="flex items-start gap-4 p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-yellow-500/90 backdrop-blur-sm shadow-[0_8px_32px_rgba(234,179,8,0.1)] mb-8">
                        <div className="bg-yellow-500/10 p-2 rounded-xl">
                            <AlertTriangle className="w-6 h-6 flex-shrink-0 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-500 text-lg">Roadmap Update</h3>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                These are sample notifications. Real-time updates will be enabled as soon as the Notifications API is live.
                            </p>
                        </div>
                    </div>

                    {/* Placeholder Notification List */}
                    <div className="space-y-1">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">Sample Feed</h2>
                        {MOCK_NOTIFICATIONS.map((notif) => (
                            <div
                                key={notif.id}
                                className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-300 cursor-default"
                            >
                                <div className={`p-2.5 rounded-xl ${notif.bgColor} ${notif.iconColor} shadow-inner`}>
                                    <notif.icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 shadow-sm">
                                            <span className="font-bold text-gray-100 group-hover:text-white transition-colors">
                                                {notif.user.name}
                                            </span>
                                            <span className="text-gray-500 text-sm">@{notif.user.username}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{notif.time}</span>
                                    </div>
                                    <p className="text-gray-400 mt-1 text-[15px] leading-relaxed group-hover:text-gray-300 transition-colors">
                                        {notif.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
