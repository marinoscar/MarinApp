const RETURN_TO_KEY = "marinapp.returnTo";

export const authRedirect = {
  store(path: string): void {
    if (!path || path === "/") {
      return;
    }
    sessionStorage.setItem(RETURN_TO_KEY, path);
  },
  consume(): string | null {
    const value = sessionStorage.getItem(RETURN_TO_KEY);
    if (value) {
      sessionStorage.removeItem(RETURN_TO_KEY);
    }
    return value;
  },
  clear(): void {
    sessionStorage.removeItem(RETURN_TO_KEY);
  }
};
