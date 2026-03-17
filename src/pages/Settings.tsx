import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/session/AuthContext';
import { Button } from '../components/ui/Button';
import { useNavigateBack } from '../hooks/useNavigateBack';

import { SettingsSessions } from '../components/ui/SettingsSessions';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  Settings2,
  Lock,
  Bell,
  Moon,
  ChevronRight,
  UserCircle,
  ArrowLeft,
  Bookmark,
  History,
  UserX,
  ShieldCheck,
  LogOut,
  Info
} from 'lucide-react';

type SectionId = 'profile' | 'account' | 'security' | 'privacy' | 'notifications' | 'display' | 'saved' | 'activity' | 'blocked' | 'logout';

interface MenuItem {
  id: SectionId;
  label: string;
  icon: any;
  value?: string;
  isDanger?: boolean;
  onClick?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navigateBack = useNavigateBack();

  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Your Account',
      items: [
        { id: 'profile', label: 'Edit Profile', icon: UserCircle, onClick: () => navigate('/profile') },
        { id: 'account', label: 'Personal Information', icon: Info, value: user?.email },
      ]
    },
    {
      title: 'How you use SocialPulse',
      items: [
        { id: 'saved', label: 'Saved', icon: Bookmark },
        { id: 'activity', label: 'Your activity', icon: History },
        { id: 'notifications', label: 'Notifications', icon: Bell, onClick: () => navigate('/notifications') },
      ]
    },
    {
      title: 'Who can see your content',
      items: [
        { id: 'privacy', label: 'Account privacy', icon: Lock, value: 'Public' },
        { id: 'blocked', label: 'Blocked', icon: UserX },
      ]
    },
    {
      title: 'App and media',
      items: [
        { id: 'display', label: 'Display', icon: Moon },
      ]
    },
    {
      title: 'Login',
      items: [
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'logout', label: 'Log out', icon: LogOut, isDanger: true, onClick: handleLogout },
      ]
    }
  ];

  const renderDetailView = () => {
    if (selectedSection === 'security') {
      return <SettingsSessions />;
    }

    return (
      <div className="py-20 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-primary-500/20">
          <Settings2 className="w-10 h-10 text-primary-400" />
        </div>
        <h2 className="text-2xl font-black text-white capitalize">{selectedSection?.replace('-', ' ')}</h2>
        <p className="text-gray-500 mt-2 max-w-xs mx-auto">This section is currently being developed for a future release.</p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => setSelectedSection(null)}
        >
          Go Back
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 p-4 flex items-center gap-6">
        <Button
          variant="ghost"
          className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-3"
          onClick={selectedSection ? () => setSelectedSection(null) : navigateBack}
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Button>
        <h1 className="text-xl font-bold">
          {selectedSection ? selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1).replace('-', ' ') : 'Settings and activity'}
        </h1>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full pb-20">
        {!selectedSection ? (
          <div className="divide-y divide-white/5">
            {menuSections.map((group) => (
              <div key={group.title} className="py-4">
                <h2 className="px-5 mb-2 text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h2>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.onClick ? item.onClick() : setSelectedSection(item.id)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className={`w-6 h-6 ${item.isDanger ? 'text-red-500' : 'text-gray-300 group-hover:text-white transition-colors'}`} />
                        <span className={`text-[15px] font-medium ${item.isDanger ? 'text-red-500' : 'text-gray-200 group-hover:text-white transition-colors'}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.value && (
                          <span className="text-sm text-gray-500 max-w-[120px] truncate">{item.value}</span>
                        )}
                        {!item.isDanger && (
                          <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gray-500 transition-colors" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="px-5 py-8 text-center">
              <p className="text-xs text-gray-600 italic">Version 0.2.0-alpha · SocialPulse Team</p>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6">
            {renderDetailView()}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
        title="Log Out Account?"
        message="Are you sure you want to log out? You will need to sign back in to access your profile and settings."
        confirmLabel="Log Out"
        variant="danger"
      />
    </div>
  );
}
