import { useEffect, useState, useCallback } from "react";
import type { User } from "../schemas/auth";
import { authService } from "../services";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, setUser, loading, refresh };
}

export default useUser;
