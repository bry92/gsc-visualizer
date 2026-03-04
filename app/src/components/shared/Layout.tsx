import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, BarChart2, Key, Link2, Users, TrendingUp, 
  Activity, FileText, Menu, ChevronDown, LogOut,
  Settings, Bell, User
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { path: '/tools/audit', icon: Search, label: 'Site Audit' },
  { path: '/tools/keywords', icon: Key, label: 'Keywords' },
  { path: '/tools/backlinks', icon: Link2, label: 'Backlinks' },
  { path: '/tools/competitors', icon: Users, label: 'Competitors' },
  { path: '/tools/rank-tracker', icon: TrendingUp, label: 'Rank Tracker' },
  { path: '/tools/site-health', icon: Activity, label: 'Site Health' },
  { path: '/tools/gsc-visualizer', icon: BarChart2, label: 'GSC Visualizer' },
  { path: '/tools/ctr-optimizer', icon: TrendingUp, label: 'CTR Optimizer' },
  { path: '/tools/intent-reshaper', icon: FileText, label: 'Intent Reshaper' },
  { path: '/tools/intent-classifier', icon: FileText, label: 'Intent Classifier' },
  { path: '/tools/reports', icon: FileText, label: 'Reports' },
];

export default function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-light border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-lime rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-dark" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">SEO Pro</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-lime/10 text-lime border border-lime/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-2">
          <RouterLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 w-full text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </RouterLink>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Exit Toolkit</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-dark-light/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
            {title && (
              <h1 className="text-xl font-semibold text-text-primary hidden sm:block">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-lime rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 bg-lime/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-lime" />
                </div>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-dark-light border border-white/10 rounded-xl shadow-card overflow-hidden z-50">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-text-primary font-medium">Demo User</p>
                    <p className="text-text-secondary text-sm">user@example.com</p>
                  </div>
                  <RouterLink
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="w-full px-4 py-3 text-left text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="w-full text-left">Settings</span>
                  </RouterLink>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full px-4 py-3 text-left text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
