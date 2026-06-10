import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { simulateLogin, simulateLogout } from "@/lib/mockTrpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: import.meta.env.VITE_MOCK_API !== 'true', // Disable actual query if mock API is enabled
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (import.meta.env.VITE_MOCK_API === 'true') {
      simulateLogout();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      return;
    }
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    let userData = meQuery.data;
    if (import.meta.env.VITE_MOCK_API === 'true' && !userData) {
      // For mock API, if no user data, try to simulate a login
      const mockUser = JSON.parse(localStorage.getItem('mockCurrentUser') || 'null');
      if (mockUser) {
        userData = mockUser;
      } else {
        // Simulate a default admin login for quick testing
        simulateLogin({
          id: 1,
          name: 'Mock Admin',
          email: 'admin@example.com',
          role: 'company_admin',
          companyId: 1,
          openId: 'mock-admin-openid',
          status: 'active',
          company: {
            id: 1,
            name: 'Mock Company',
            email: 'company@example.com',
            plan: 'professional',
            subscriptionStatus: 'active',
          },
        });
        userData = JSON.parse(localStorage.getItem('mockCurrentUser') || 'null');
      }
    }
    
    // Determine subscription status
    // For super_admin, always active
    // For others, check if company has active subscription
    const subscriptionActive = userData?.role === "super_admin" || userData?.company?.subscriptionStatus === "active";

    const userWithSubscription = userData ? {
      ...userData,
      subscriptionActive,
    } : null;

    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(userWithSubscription)
    );

    return {
      user: userWithSubscription,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
