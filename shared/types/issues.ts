/**
 * Issue detail payload from the GitHub API.
 */

import type { ReactionSummaryItem } from './reactions';

export interface IssueDetailLabel {
  id?: number | string;
  name: string;
  color: string;
  description?: string | null;
}

export interface IssueDetailPayload {
  id: number;
  number: number;
  state: string;
  title: string;
  body?: string | null;
  html_url?: string;
  repository_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  locked?: boolean;

  user?: {
    login: string;
    id?: number | string;
    avatar_url?: string | null;
  } | null;

  assignee?: {
    login: string;
    id?: number | string;
    avatar_url?: string | null;
  } | null;

  labels?: IssueDetailLabel[];
  reactions?: ReactionSummaryItem[];

  [key: string]: unknown;
}
