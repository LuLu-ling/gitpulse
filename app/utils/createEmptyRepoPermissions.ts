export interface RepoPermissions {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
  canEditLabels: boolean;
  canLockIssue: boolean;
}

type RepoPermissionsSource = Partial<Record<keyof RepoPermissions, unknown>> | null | undefined;

export function normalizeRepoPermissions(source: RepoPermissionsSource): RepoPermissions {
  return {
    admin: Boolean(source?.admin),
    maintain: Boolean(source?.maintain),
    push: Boolean(source?.push),
    triage: Boolean(source?.triage),
    pull: Boolean(source?.pull),
    canEditLabels: Boolean(source?.canEditLabels),
    canLockIssue: Boolean(source?.canLockIssue),
  };
}

export default function createEmptyRepoPermissions(): RepoPermissions {
  return normalizeRepoPermissions(null);
}
