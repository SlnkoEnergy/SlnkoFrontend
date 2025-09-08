import { useHasTeamPermission } from "../../redux/auth/TeamPermission";

export default function RequirePermission({
  permission,
  teamId,
  children,
  fallback = null,
}) {
  const allowed = useHasTeamPermission(permission, teamId);
  if (allowed === "loading") return null; // or a tiny skeleton if you want
  return allowed ? children : (fallback ?? null);
}
