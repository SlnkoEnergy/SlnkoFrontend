import React, { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const parseDateRangeString = (val) => {
  if (!val) return {};
  const s = String(val).trim();
  if (!s) return {};
  if (s.includes("to")) {
    const [from, to] = s.split("to").map((x) => x.trim());
    return { from, to };
  }
  return { from: s, to: s };
};

const TaskFilterContext = createContext(null);

export const TaskFilterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const raw = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );

  const apiParams = useMemo(() => {
    const {
      from,
      to,
      deadlineFrom,
      deadlineTo,
      createdAt,
      deadline,
      department,
      assigned_to,
      createdBy,
      matchMode,
    } = raw;

    let createdRange = {};
    if (from || to) {
      createdRange = { from, to };
    } else if (createdAt) {
      createdRange = parseDateRangeString(createdAt);
    }

    let deadlineRange = {};
    if (deadlineFrom || deadlineTo) {
      deadlineRange = { deadlineFrom, deadlineTo };
    } else if (deadline) {
      const parsed = parseDateRangeString(deadline);
      deadlineRange = {
        deadlineFrom: parsed.from,
        deadlineTo: parsed.to,
      };
    }

    return {
      ...createdRange,      
      ...deadlineRange,      
      departments: department || "",
      assignedToId: assigned_to || "",
      createdById: createdBy || "",
      mode: matchMode === "any" ? "any" : "all",
    };
  }, [raw]);

  const value = useMemo(
    () => ({
      rawParams: raw,
      apiParams,
      setSearchParams,
    }),
    [raw, apiParams, setSearchParams]
  );

  return (
    <TaskFilterContext.Provider value={value}>
      {children}
    </TaskFilterContext.Provider>
  );
};

export const useTaskFilters = () => {
  const ctx = useContext(TaskFilterContext);
  if (!ctx)
    throw new Error("useTaskFilters must be used within TaskFilterProvider");
  return ctx;
};
