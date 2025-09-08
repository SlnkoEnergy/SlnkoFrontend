import { useEffect, useState } from "react";
import { stackClientApp } from "../../stack";

// Internal helper to call Stack API
async function callStackJSON(url, token) {
  const r = await fetch(url.toString(), {
    headers: {
      "x-stack-access-type": "client",
      "x-stack-project-id": process.env.REACT_APP_STACK_PROJECT_ID,
      "x-stack-publishable-client-key": process.env.REACT_APP_STACK_PUBLISHABLE_KEY,
      "x-stack-access-token": token,
    },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Stack API ${url.pathname} ${r.status}: ${txt || r.statusText}`);
  }
  return r.json();
}

// Check a single team for a permission
async function hasPermInTeam(token, permissionId, teamId) {
  const url = new URL("https://api.stack-auth.com/api/v1/permissions/team-permissions");
  url.searchParams.set("user_id", "me");
  url.searchParams.set("permission_id", permissionId);
  url.searchParams.set("include_indirect", "true");
  if (teamId) url.searchParams.set("team_id", teamId);
  const data = await callStackJSON(url, token);
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.length > 0;
}

export function useHasTeamPermission(permissionId, teamId) {
  const [state, setState] = useState("loading"); // "loading" | true | false

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await stackClientApp.getToken();
        if (!token) {
          if (!cancelled) setState(false);
          return;
        }

        // 1) If explicit teamId is provided
        if (teamId) {
          const ok = await hasPermInTeam(token, permissionId, teamId);
          if (!cancelled) setState(ok);
          return;
        }

        // 2) Try selected team first (if any)
        const meURL = new URL("https://api.stack-auth.com/api/v1/users/me");
        const me = await callStackJSON(meURL, token);
        const selectedTeamId = me?.selected_team_id || null;
        if (selectedTeamId) {
          const ok = await hasPermInTeam(token, permissionId, selectedTeamId);
          if (!cancelled) setState(ok);
          if (ok) return;
        }

        // 3) Fallback: check ALL teams the user belongs to
        const teamsURL = new URL("https://api.stack-auth.com/api/v1/teams");
        teamsURL.searchParams.set("user_id", "me");
        const teamsData = await callStackJSON(teamsURL, token);
        const teams = Array.isArray(teamsData?.items) ? teamsData.items : [];

        for (const t of teams) {
          // stop early if unmounted / cancelled
          if (cancelled) return;
          if (!t?.id) continue;

          const ok = await hasPermInTeam(token, permissionId, t.id);
          if (ok) {
            if (!cancelled) setState(true);
            return;
          }
        }

        if (!cancelled) setState(false);
      } catch (e) {
        console.warn("Permission check failed:", e);
        if (!cancelled) setState(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [permissionId, teamId]);

  return state; // "loading" | true | false
}
