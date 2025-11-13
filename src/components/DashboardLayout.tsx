import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Mic, 
  Mail, 
  MessageSquare, 
  Globe, 
  Wifi, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  User,
  LogOut,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Sprachsteuerung', href: '/voice-commands', icon: Mic, active: true },
  { name: 'Anfragen & Tickets', href: '/admin', icon: Mail, active: true },
  { name: 'Chat', href: '/chat', icon: MessageSquare, active: false },
  { name: 'Meeting-Webseiten', href: '/meetings', icon: Globe, active: false },
  { name: 'Kiosk-Modul', href: '/kiosk', icon: Wifi, active: false },
  { name: 'Einstellungen', href: '/settings', icon: Settings, active: true },
  { name: 'Hilfe', href: '/help', icon: HelpCircle, active: false },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2 font-semibold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">KI</span>
            </div>
            <span className="hidden sm:inline">KI-Sekretärin</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tickets, E-Mails, Kontakte durchsuchen..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Mein Account</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/help" className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Hilfe
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "top-16 lg:top-0"
          )}
        >
          <nav className="flex flex-col gap-1 p-4 pt-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.active ? item.href : '#'}
                  onClick={(e) => {
                    if (!item.active) {
                      e.preventDefault();
                    } else {
                      setSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative group",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : item.active
                      ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                      : "text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.active && (
                    <span className="ml-auto">
                      <span className="flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                  )}
                  {!item.active && (
                    <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                      Bald
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
