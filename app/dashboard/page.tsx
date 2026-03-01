import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell />
    </AuthGuard>
  );
}