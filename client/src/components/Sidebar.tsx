import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Target, Calendar, Clock, FileText, TrendingUp, User, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ mobile = false, onNavigate }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    onNavigate?.(); // Close mobile menu
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.(); // Close mobile menu on navigation
  };

  // Navigation items - General purpose study app
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Books', path: '/books' },
    { icon: Target, label: 'Daily Goals', path: '/daily-goals' },
    { icon: Calendar, label: 'Monthly Plan', path: '/monthly-plan' },
    { icon: Clock, label: 'Study Sessions', path: '/study-sessions' },
    { icon: FileText, label: 'Syllabus Tracker', path: '/syllabus-tracker' },
    { icon: TrendingUp, label: 'Progress Analytics', path: '/advanced-progress' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: LogOut, label: 'Logout', path: '/logout', action: 'logout' },
  ];

  return (
    <aside className="w-64 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shadow-lg">
      <div className="flex h-full flex-col">
        <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(var(--sidebar-accent))] flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-lg font-black text-[hsl(var(--sidebar-primary))]">E</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[hsl(var(--sidebar-foreground))] tracking-tight">
                Examprep
              </h1>
              <p className="text-xs text-[hsl(var(--sidebar-foreground))] opacity-75">Study Smart</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[hsl(var(--sidebar-primary))] bg-opacity-10 border border-[hsl(var(--sidebar-primary))] border-opacity-20">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-primary))] bg-opacity-20 flex items-center justify-center">
              <User className="h-4 w-4 text-[hsl(var(--sidebar-foreground))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-[hsl(var(--sidebar-foreground))] opacity-75">Student</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 bg-[hsl(var(--sidebar-background))]">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              // Handle logout action differently
              if (item.action === 'logout') {
                return (
                  <div key={item.path} className="pt-2 mt-2 border-t border-white border-opacity-20">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-[hsl(var(--sidebar-foreground))] hover:bg-white hover:bg-opacity-15 w-full text-left group">
                          <Icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                          {item.label}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to logout? You will need to sign in again to access your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            Yes, Logout
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              }
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => mobile && onNavigate?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-white bg-opacity-20 text-[hsl(var(--sidebar-foreground))] shadow-sm border border-white border-opacity-30'
                        : 'text-[hsl(var(--sidebar-foreground))] opacity-80 hover:opacity-100 hover:bg-white hover:bg-opacity-10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-4 w-4 transition-all duration-200 ${isActive ? 'text-[hsl(var(--sidebar-foreground))]' : 'opacity-70 group-hover:opacity-90'}`} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
