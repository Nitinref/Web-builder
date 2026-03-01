"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, token, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: () => toast.error("Invalid email or password"),
  });

  const signupMutation = useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name?: string }) =>
      authApi.signup(email, password, name),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Account created!");
      router.push("/dashboard");
    },
    onError: () => toast.error("Could not create account"),
  });

  const logout = () => {
    clearAuth();
    qc.clear();
    router.push("/login");
    toast.success("Signed out");
  };

  return { user, token, isAuthenticated, loginMutation, signupMutation, logout };
}