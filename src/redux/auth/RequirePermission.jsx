import { useUser } from "@stackframe/react";

export default function RequirePermission({ permission, teamId, children }) {
  const { user } = useUser();
  if (!user) return null;

  return user.hasPermission(permission, teamId) ? children : null;
}
