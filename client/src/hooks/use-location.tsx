
import { useCallback, useContext, useEffect, useState, createContext } from 'react';

type LocationContextType = {
  path: string;
  navigate: (path: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);
  
  const navigate = useCallback((newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  }, []);
  
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  return (
    <LocationContext.Provider value={{ path, navigate }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): [string, (path: string) => void] {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return [context.path, context.navigate];
}

export function useNavigate() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useNavigate must be used within a LocationProvider');
  }
  return context.navigate;
}
