/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AuditCategory = 'design' | 'content' | 'seo' | 'cro' | 'ui';
export type Severity = 'high' | 'medium' | 'low';

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: Severity;
  title: string;
  description: string;
  solution: string;
}

export interface AuditScores {
  design: number;
  content: number;
  seo: number;
  cro: number;
  ui: number;
  overall: number;
}

export interface SeoChecklistItem {
  id: string;
  category: 'meta' | 'alt' | 'headings';
  label: string;
  completed: boolean;
  details?: string;
}

export interface AuditReport {
  id: string;
  url: string;
  date: string;
  scores: AuditScores;
  clientSummary: string;
  issues: AuditIssue[];
  keywords?: string;
  seoChecklist?: SeoChecklistItem[];
}

export interface ComparisonItem {
  id: string;
  element: string; // e.g., "Hero Section", "Call to Action", "Navigation Bar", "Typography"
  oldState: string; // Pehlay ya tha
  newState: string; // Ab ya ha
  benefit: string;  // Es say ya fida ho ga
  x?: number;       // Hotspot X percentage
  y?: number;       // Hotspot Y percentage
}

export interface ComparisonReport {
  id: string;
  url: string;
  date: string;
  clientSummary: string;
  improvementScore: number; // overall improvement index, e.g., 0-100 scale
  conversionLift: string; // e.g., "+20% to +35% expected increase"
  items: ComparisonItem[];
  oldImageName?: string;
  newImageName?: string;
}
