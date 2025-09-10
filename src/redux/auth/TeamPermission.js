import { useEffect, useState } from "react";
import { useStackApp, useUser } from "@stackframe/react";

/* ---------------- token from context app or current user ---------------- */
async function getAccessTokenFrom(app, user) {
  const tryFns = [
    () => app?.getToken?.(),
    () => app?.getAccessToken?.(),
    () => app?.auth?.getToken?.(),
    () => user?.getAccessToken?.(),
    () => user?.getToken?.(),
  ];
  for (const fn of tryFns) {
    try {
      const t = await fn?.();
      if (t) return t;
    } catch { /* keep trying */ }
  }
  return null; // no token available yet
}

function buildHeaders(token) {
  return {
    "x-stack-access-type": "client",
    "x-stack-project-id": process.env.REACT_APP_STACK_PROJECT_ID,
    "x-stack-publishable-client-key": process.env.REACT_APP_STACK_PUBLISHABLE_KEY,
    ...(token ? { "x-stack-access-token": token } : {}),
  };
}

async function callStackJSON(url, token) {
  const r = await fetch(url.toString ? url.toString() : url, {
    method: "GET",
    headers: buildHeaders(token),
    
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(
      `Stack API ${typeof url === "string" ? url : url.pathname} ${r.status}: ${txt || r.statusText}`
    );
  }
  return r.json();
}

/* ---------------- permission matching (be lenient) ---------------- */
const norm = (x) => (typeof x === "string" ? x.toLowerCase().trim() : "");
function matchesPermission(item, wanted) {
  const w = norm(wanted);
  return (
    norm(item?.id) === w ||
    norm(item?.key) === w ||
    norm(item?.slug) === w ||
    norm(item?.name) === w
  );
}

/* ---------------- API helpers ---------------- */
async function userHasPermissionAggregated(token, permissionId) {
  const url = new URL("https://api.stack-auth.com/api/v1/users/me/permissions");
  url.searchParams.set("include_indirect", "true");
  const data = await callStackJSON(url, token);
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.some((p) => matchesPermission(p, permissionId));
}

async function listUserTeams(token) {
  const url = new URL("https://api.stack-auth.com/api/v1/teams");
  url.searchParams.set("user_id", "me");
  const data = await callStackJSON(url, token);
  return Array.isArray(data?.items) ? data.items : [];
}

async function listTeamPermissionsForUser(token, teamId) {
  const url = new URL("https://api.stack-auth.com/api/v1/permissions/team-permissions");
  url.searchParams.set("user_id", "me");
  url.searchParams.set("team_id", teamId);
  url.searchParams.set("include_indirect", "true");
  const data = await callStackJSON(url, token);
  return Array.isArray(data?.items) ? data.items : [];
}

/* ---------------- main hook ---------------- */
/**
 * useHasTeamPermission(permissionId, teamId?)
 * - If teamId provided: check that team first; if false -> fall back to aggregated.
 * - If teamId not provided: aggregated first.
 * - If still false: scan all teams (no reliance on selected_team_id).
 *
 * Returns: "loading" | true | false
 */
export function useHasTeamPermission(permissionId, teamId) {
  const [state, setState] = useState("loading");
  const app = useStackApp();       // ✅ guaranteed same instance as StackProvider
  const { user } = useUser();      // ✅ currently signed-in user (or null during auth)

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Wait until we have a user; otherwise we can’t get a token
        if (user === undefined) { setState("loading"); return; }
        if (!user) { setState(false); return; }

        const token = await getAccessTokenFrom(app, user);
        if (!token) {
          // No token yet (very early). Treat as not allowed (or "loading" if you prefer).
          setState(false);
          return;
        }

        // 1) strict team first (if caller provided)
        if (teamId) {
          try {
            const items = await listTeamPermissionsForUser(token, teamId);
            if (cancelled) return;
            if (items.some((p) => matchesPermission(p, permissionId))) {
              setState(true);
              return;
            }
          } catch { /* ignore and fall through */ }
        }

        // 2) aggregated (user-wide) permissions
        try {
          const okAny = await userHasPermissionAggregated(token, permissionId);
          if (cancelled) return;
          if (okAny) { setState(true); return; }
        } catch { /* ignore and fall through */ }

        // 3) scan every team
        try {
          const teams = await listUserTeams(token);
          for (const t of teams) {
            if (cancelled) return;
            if (!t?.id) continue;
            const items = await listTeamPermissionsForUser(token, t.id);
            if (items.some((p) => matchesPermission(p, permissionId))) {
              setState(true);
              return;
            }
          }
        } catch { /* ignore */ }

        setState(false);
      } catch (e) {
        console.warn("useHasTeamPermission failed:", e?.message || e);
        setState(false);
      }
    })();

    return () => { cancelled = true; };
  }, [app, user, permissionId, teamId]);

  return state;
}
