import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_ALLOWED_PATHS = ["/", "/clipboard"];

export const useAppNavigation = (allowedPaths: string[] = DEFAULT_ALLOWED_PATHS) => {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || "/");
  const allowed = useMemo(() => new Set(allowedPaths), [allowedPaths]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setCurrentPath(path);
  }, []);

  useEffect(() => {
    if (!allowed.has(currentPath)) {
      navigate("/");
    }
  }, [allowed, currentPath, navigate]);

  return { currentPath, navigate };
};
