import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, User, Settings, LogOut, X, 
  GraduationCap, MessageSquare, Bell, FolderOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Applications', icon: GraduationCap, path: '/dashboard/applications' },
  { label: 'Documents', icon: FolderOpen, path: '/dashboard/documents' },
  { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
  { label: 'Notices', icon: Bell, path: '/dashboard/notices' },
  { label: 'Profile', icon: User, path: '/dashboard/profile' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const StudentSidebar = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const SidebarContent = ({ isMobile }) => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      {/* Sticky Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 bg-slate-900 z-10 h-20">
        <h1 className="text-xl font-bold flex items-center gap-2">
           <GraduationCap className="w-6 h-6 text-blue-500" />
           <span>Student Portal</span>
        </h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
      
      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (isMobile) onClose(); }}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sticky Footer / Sign Out */}
      <div className="p-4 border-t border-slate-800 shrink-0 sticky bottom-0 bg-slate-900 z-10">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex w-64 h-full fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent isMobile={false} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-xs z-50 shadow-2xl md:hidden"
            >
              <SidebarContent isMobile={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentSidebar;