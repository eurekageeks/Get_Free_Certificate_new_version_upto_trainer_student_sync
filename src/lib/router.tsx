import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface RouteState {
  path: string;
  params: Record<string, string>;
}

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  navigate: (path: string) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname));
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setRoute(parsePath(path));
    window.scrollTo(0, 0);
  }

  return (
    <RouterContext.Provider value={{ ...route, navigate, redirectAfterLogin, setRedirectAfterLogin }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

function parsePath(pathname: string): RouteState {
  const routes: [RegExp, string[]][] = [
    [/^\/$/, []],
    [/^\/courses$/, []],
    [/^\/course\/([^/]+)$/, ['slug']],
    [/^\/login$/, []],
    [/^\/register$/, []],
    [/^\/dashboard$/, []],
    [/^\/enroll\/([^/]+)$/, ['slug']],
    [/^\/certificate\/([^/]+)$/, ['id']],
    [/^\/verify\/?([^/]*)$/, ['certificateNumber']],
    [/^\/admin\/login$/, []],
    [/^\/admin\/register$/, []],
    [/^\/admin\/dashboard$/, []],
    [/^\/trainer\/login$/, []],
    [/^\/trainer\/register$/, []],
    [/^\/trainer\/dashboard$/, []],
    [/^\/trainer\/profile$/, []],
    [/^\/about$/, []],
    [/^\/terms$/, []],
    [/^\/refund$/, []],
    [/^\/contact$/, []],
  ];

  for (const [pattern, paramNames] of routes) {
    const match = pathname.match(pattern);
    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { path: pathname, params };
    }
  }

  return { path: pathname, params: {} };
}

export function Link({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
