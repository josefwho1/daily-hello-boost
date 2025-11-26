import { Home, ListTodo, BookOpen, Settings, Package } from "lucide-react";
import { NavLink } from "./NavLink";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        <NavLink
          to="/"
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </NavLink>
        
        <NavLink
          to="/challenges"
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <ListTodo size={24} />
          <span className="text-xs font-medium">Challenges</span>
        </NavLink>
        
        <NavLink
          to="/packs"
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Package size={24} />
          <span className="text-xs font-medium">Packs</span>
        </NavLink>
        
        <NavLink
          to="/notes"
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <BookOpen size={24} />
          <span className="text-xs font-medium">Notes</span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Settings size={24} />
          <span className="text-xs font-medium">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};
