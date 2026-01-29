import { useState } from "react";
import { Home, BookOpen, User } from "lucide-react";
import { NavLink } from "./NavLink";
import { useLocation } from "react-router-dom";
import questsIcon from "@/assets/quests-icon.webp";

const PawPrint = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
      <svg 
        viewBox="0 0 24 24" 
        className="w-5 h-5 text-primary animate-paw-print"
        fill="currentColor"
      >
        <ellipse cx="12" cy="17" rx="4" ry="5" />
        <circle cx="6" cy="10" r="2.5" />
        <circle cx="18" cy="10" r="2.5" />
        <circle cx="8" cy="5" r="2" />
        <circle cx="16" cy="5" r="2" />
      </svg>
    </div>
  );
};

export const BottomNav = () => {
  const location = useLocation();
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  
  // Hide nav on auth, onboarding, and landing pages
  if (location.pathname === '/auth' || location.pathname === '/onboarding' || location.pathname === '/landing') {
    return null;
  }

  const handleTabClick = (path: string) => {
    setLastClicked(path);
    setTimeout(() => setLastClicked(null), 600);
  };

  const tabs = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/hellobook", icon: BookOpen, label: "Hellobook" },
    { to: "/challenges", icon: null, label: "Quests", customIcon: questsIcon },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center h-18 px-2 relative">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            onClick={() => handleTabClick(tab.to)}
            className="relative flex flex-col items-center gap-1 py-3 px-4 text-muted-foreground transition-all duration-200 hover:text-primary"
            activeClassName="text-primary"
          >
            <PawPrint show={lastClicked === tab.to} />
            <tab.icon 
              size={24} 
              className="transition-transform duration-200" 
              strokeWidth={location.pathname === tab.to ? 2.5 : 2}
            />
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
