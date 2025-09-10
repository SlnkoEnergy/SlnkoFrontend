import { useEffect, useRef } from "react";
import { useUser } from "@stackframe/react";
import { useLocation } from "react-router-dom";


export default function EnsureSelectedTeam({ defaultTeamId }) {
  const { user } = useUser();
  const location = useLocation();
  const onceRef = useRef(false);

  useEffect(() => {
    
    if (location.pathname.startsWith("/handler/")) return;

   
    if (onceRef.current) return;
    onceRef.current = true;

    let cancelled = false;

    (async () => {
      try {
      
        if (!user) return;

        
        if (user.selectedTeam || user.selected_team_id) return;

      
        const teams = await user.listTeams();
        if (cancelled) return;
        if (!Array.isArray(teams) || teams.length === 0) return;

     
        const urlTeamId = new URLSearchParams(window.location.search).get("teamId");
        const envTeamId = process.env.REACT_APP_DEFAULT_TEAM_ID || null;
        const storedTeamId = localStorage.getItem("preferred_team_id") || null;

        const desiredId =
          urlTeamId || defaultTeamId || envTeamId || storedTeamId || teams[0]?.id;

        const target = teams.find(t => t.id === desiredId) ?? teams[0];
        if (!target) return;

       
        try {
          await user.setSelectedTeam(target);
          if (!cancelled) {
            localStorage.setItem("preferred_team_id", target.id);
          
          }
        } catch (e) {
        
          if (!cancelled) console.warn("[EnsureSelectedTeam] setSelectedTeam ignored:", e?.message || e);
        }
      } catch (e) {
        if (!cancelled) console.warn("[EnsureSelectedTeam] ignored:", e?.message || e);
      }
    })();

    return () => {
      cancelled = true; 
    };
  }, [user, defaultTeamId, location.pathname]);

  return null;
}
