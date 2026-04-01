export type GovernanceActivityType = "Proposed" | "Voted" | "Concluded" | "Withdrawn";

export type GovernanceActivity = {
  id: string;
  type: GovernanceActivityType;
  title: string;
  description: string;
  proposalId?: number;
  txHash: string;
  timestamp: string;
};

const STORAGE_KEY = "base-simple-govern-activity";

export function getStoredActivities(): GovernanceActivity[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GovernanceActivity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addStoredActivity(activity: Omit<GovernanceActivity, "id" | "timestamp">) {
  if (typeof window === "undefined") return;

  const next: GovernanceActivity = {
    ...activity,
    id: `${activity.type}-${activity.txHash}-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  const current = getStoredActivities();
  const updated = [next, ...current].slice(0, 40);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
