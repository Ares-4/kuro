import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Users, Bell, Map, Building, GraduationCap, Shield,
  BookOpen, Globe, Edit3, Megaphone, LayoutTemplate, Activity,
  Settings, LogOut, X, ChevronDown, BarChart3, LayoutDashboard,
  Navigation, Plane, BrainCircuit, Radio, CalendarClock,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { label: 'Applications', icon: FileText, path: '/admin/applications' },
      { label: 'Leads', icon: Users, path: '/admin/leads' },
      { label: 'Notices', icon: Bell, path: '/admin/notices' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Destinations', icon: Map, path: '/admin/destinations' },
      { label: 'Roadmaps', icon: Navigation, path: '/admin/roadmaps' },
      { label: 'Visa info', icon: Plane, path: '/admin/visa-info' },
      { label: 'Country updates', icon: Radio, path: '/admin/country-updates' },
      { label: 'Institutions', icon: Building, path: '/admin/universities' },
      { label: 'Programs', icon: GraduationCap, path: '/admin/courses' },
      { label: 'Scholarships', icon: GraduationCap, path: '/admin/scholarships' },
      { label: 'Deadlines', icon: CalendarClock, path: '/admin/deadlines' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Groups', icon: Users, path: '/admin/groups' },
      { label: 'Moderators', icon: Shield, path: '/admin/moderators' },
    ],
  },
  {
    label: 'Content & Marketing',
    items: [
      { label: 'Blog', icon: BookOpen, path: '/admin/blog' },
      { label: 'Public content', icon: Globe, path: '/admin/public-content' },
      { label: 'Website builder', icon: LayoutDashboard, path: '/admin/builder' },
      { label: 'Content manager', icon: Edit3, path: '/admin/content' },
      { label: 'Promotions', icon: Megaphone, path: '/admin/promos' },
      { label: 'Promo placement', icon: LayoutTemplate, path: '/admin/promos/placement' },
      { label: 'Promo diagnostics', icon: Activity, path: '/admin/promos/diagnostics' },
      { label: 'Knowledge base', icon: BrainCircuit, path: '/admin/knowledge-base' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
  },
];

function NavGroup({ group, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-1.5 rounded-md text-[10px] font-bold text-muted-foreground hover:text-slate-400 transition-colors tracking-[0.12em] uppercase"
      >
        {group.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pb-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                      isActive
                        ? 'bg-primary/12 text-primary border border-primary/20 font-medium'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-normal'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SidebarContent = ({ onClose, isMobile }) => {
  const { logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logoutAdmin();
    navigate('/admin-login');
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/60 text-white">
      {/* Header */}
      <div className="h-16 px-5 border-b border-border/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Kuro Admin</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Control panel</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-white transition-colors rounded-md">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} defaultOpen={['Operations', 'Catalog'].includes(group.label)} />
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-border/60 shrink-0">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = ({ isOpen, onClose }) => (
  <>
    {/* Desktop */}
    <div className="hidden md:flex w-56 h-full fixed left-0 top-0 bottom-0 z-30">
      <div className="w-full">
        <SidebarContent isMobile={false} />
      </div>
    </div>

    {/* Mobile drawer */}
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl md:hidden"
          >
            <SidebarContent isMobile={true} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
);

export default AdminSidebar;
