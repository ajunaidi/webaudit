/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditReport, AuditIssue, AuditCategory, Severity, SeoChecklistItem } from '../types';
import { CustomChart } from './CustomChart';
import { Trash2, Edit3, Plus, Check, X, AlertTriangle, Info, ShieldAlert, Sparkles, Sliders, ListTodo, ChevronDown, ChevronUp, RefreshCw, HelpCircle } from 'lucide-react';

interface AuditEditorProps {
  report: AuditReport;
  onUpdate: (updatedReport: AuditReport) => void;
}

export const AuditEditor: React.FC<AuditEditorProps> = ({ report, onUpdate }) => {
  const [filterCategory, setFilterCategory] = useState<AuditCategory | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  
  // Local states for editing elements
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(report.clientSummary);
  
  const [editingScores, setEditingScores] = useState(false);
  const [tempScores, setTempScores] = useState({ ...report.scores });

  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<Partial<AuditIssue>>({});

  // Adding new issue
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIssue, setNewIssue] = useState<Omit<AuditIssue, 'id'>>({
    category: 'design',
    severity: 'medium',
    title: '',
    description: '',
    solution: ''
  });

  // Categories metadata
  const categoriesList: { value: AuditCategory; label: string; color: string }[] = [
    { value: 'design', label: 'Design', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/50' },
    { value: 'content', label: 'Content', color: 'bg-pink-50 text-pink-700 border-pink-200/50' },
    { value: 'seo', label: 'SEO', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
    { value: 'cro', label: 'CRO', color: 'bg-amber-50 text-amber-700 border-amber-200/50' },
    { value: 'ui', label: 'UI/UX', color: 'bg-cyan-50 text-cyan-700 border-cyan-200/50' },
  ];

  // Severity metadata
  const severityMetadata = {
    high: { label: 'High', color: 'bg-rose-50 text-rose-700 border-rose-200/50', icon: ShieldAlert },
    medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200/50', icon: AlertTriangle },
    low: { label: 'Low', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', icon: Info },
  };

  // Triggered when client summary is edited
  const handleSaveSummary = () => {
    onUpdate({
      ...report,
      clientSummary: summaryText
    });
    setEditingSummary(false);
  };

  // Triggered when scores are edited
  const handleSaveScores = () => {
    // Recalculate average overall score
    const avg = Math.round(
      (Number(tempScores.design) +
        Number(tempScores.content) +
        Number(tempScores.seo) +
        Number(tempScores.cro) +
        Number(tempScores.ui)) / 5
    );
    
    const updatedScores = {
      ...tempScores,
      overall: avg
    };

    onUpdate({
      ...report,
      scores: updatedScores
    });
    setEditingScores(false);
  };

  // Issue CRUD methods
  const handleStartEditIssue = (issue: AuditIssue) => {
    setEditingIssueId(issue.id);
    setEditingIssue({ ...issue });
  };

  const handleSaveIssue = () => {
    if (!editingIssue.title || !editingIssue.description || !editingIssue.solution) return;
    
    const updatedIssues = report.issues.map(iss => 
      iss.id === editingIssueId ? (editingIssue as AuditIssue) : iss
    );

    onUpdate({
      ...report,
      issues: updatedIssues
    });
    setEditingIssueId(null);
    setEditingIssue({});
  };

  const handleDeleteIssue = (id: string) => {
    const updatedIssues = report.issues.filter(iss => iss.id !== id);
    onUpdate({
      ...report,
      issues: updatedIssues
    });
  };

  const handleAddIssue = () => {
    if (!newIssue.title || !newIssue.description || !newIssue.solution) return;

    const created: AuditIssue = {
      ...newIssue,
      id: `custom-${Date.now()}`
    };

    onUpdate({
      ...report,
      issues: [...report.issues, created]
    });

    setNewIssue({
      category: 'design',
      severity: 'medium',
      title: '',
      description: '',
      solution: ''
    });
    setShowAddForm(false);
  };

  // Filtered issues list
  const filteredIssues = report.issues.filter(iss => {
    const matchCat = filterCategory === 'all' || iss.category === filterCategory;
    const matchSev = filterSeverity === 'all' || iss.severity === filterSeverity;
    return matchCat && matchSev;
  });

  // Default SEO Checklist items
  const DEFAULT_SEO_CHECKLIST: SeoChecklistItem[] = [
    { id: 'meta-title', category: 'meta', label: 'Optimize Title Tag (under 60 chars with focus keywords)', completed: false, details: 'The title tag should be brief, catchy, and contain the target domain keyword at the start.' },
    { id: 'meta-desc', category: 'meta', label: 'Draft Meta Description (140-160 chars with strong CTA)', completed: false, details: 'Summarize the page value and include a user action command like Buy, Shop, or Learn.' },
    { id: 'meta-og', category: 'meta', label: 'Configure Open Graph (OG) tags for social preview', completed: false, details: 'Add og:title, og:description, and og:image tags for polished Slack/Twitter/Facebook cards.' },
    { id: 'meta-canonical', category: 'meta', label: 'Define proper Canonical URL tags', completed: false, details: 'Ensures search engines do not flag duplicate content variations like http vs https.' },
    
    { id: 'alt-logo', category: 'alt', label: 'Set Logo Image descriptive Alt attribute', completed: false, details: 'Use branding-specific text like "Brandname - Premium Handcrafted Jewelry Logo" instead of just "logo".' },
    { id: 'alt-hero', category: 'alt', label: 'Include keyword-rich Alt tags in Hero/Banners', completed: false, details: 'Explain what is shown in the hero image while naturally adding 1-2 primary niche keywords.' },
    { id: 'alt-products', category: 'alt', label: 'Set Alt attributes for product & gallery elements', completed: false, details: 'Describe products specifically, e.g., "Handmade sterling silver spinner ring".' },
    { id: 'alt-decorative', category: 'alt', label: 'Mark purely decorative icons with alt=""', completed: false, details: 'Prevents screen readers from reading out useless icon file names or raw decorative vector paths.' },
    
    { id: 'headings-one', category: 'headings', label: 'Verify exactly one H1 tag exists on the page', completed: false, details: 'Multiple H1 elements dilute search relevance. Use H1 for the main branding or primary statement only.' },
    { id: 'headings-nest', category: 'headings', label: 'Nest subheadings sequentially (H2 -> H3 -> H4)', completed: false, details: 'Never skip levels (e.g. from H1 directly to H3) as this breaks semantic crawl structures.' },
    { id: 'headings-keywords', category: 'headings', label: 'Infuse primary keywords into H1 & H2 subheadings', completed: false, details: 'Search crawlers assign disproportionate ranking weight to terms contained inside heading blocks.' },
    { id: 'headings-mobile', category: 'headings', label: 'Verify H2-H6 scale proportionally on mobile viewports', completed: false, details: 'Prevents huge layout shifts or horizontal clipping on smaller, touch-focused screens.' }
  ];

  const checklist = report.seoChecklist || DEFAULT_SEO_CHECKLIST;

  const [newSeoLabel, setNewSeoLabel] = useState('');
  const [newSeoCategory, setNewSeoCategory] = useState<'meta' | 'alt' | 'headings'>('meta');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    meta: true,
    alt: true,
    headings: true
  });
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  const handleToggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdate({
      ...report,
      seoChecklist: updatedChecklist
    });
  };

  const handleAddChecklistItem = () => {
    if (!newSeoLabel.trim()) return;
    const newItem: SeoChecklistItem = {
      id: `custom-seo-${Date.now()}`,
      category: newSeoCategory,
      label: newSeoLabel.trim(),
      completed: false,
      details: 'Custom user-defined SEO quality checkpoint.'
    };
    onUpdate({
      ...report,
      seoChecklist: [...checklist, newItem]
    });
    setNewSeoLabel('');
  };

  const handleDeleteChecklistItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChecklist = checklist.filter(item => item.id !== id);
    onUpdate({
      ...report,
      seoChecklist: updatedChecklist
    });
  };

  const handleResetChecklist = () => {
    if (window.confirm('Are you sure you want to reset the SEO Checklist to defaults? This will erase your progress and custom items.')) {
      onUpdate({
        ...report,
        seoChecklist: DEFAULT_SEO_CHECKLIST
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Meta info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-indigo-600 tracking-widest uppercase">Currently Auditing URL</span>
          <h3 className="text-xl font-bold text-slate-900 truncate mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {report.url}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Audit Run Date: <span className="text-slate-700 font-medium">{report.date}</span></p>
          
          {report.keywords && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">Focus Keywords:</span>
              <p className="text-xs font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{report.keywords}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setEditingScores(!editingScores)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          {editingScores ? 'Close Editor' : 'Adjust Scores'}
        </button>
      </div>

      {/* Real-time score modifiers panel */}
      {editingScores && (
        <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200/50 shadow-inner grid grid-cols-2 md:grid-cols-5 gap-4 animate-slide-down">
          {categoriesList.map((cat) => (
            <div key={cat.value} className="flex flex-col bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700">{cat.label} Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={tempScores[cat.value]}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                  setTempScores({ ...tempScores, [cat.value]: val });
                }}
                className="mt-2 bg-white text-indigo-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-bold text-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
          <div className="col-span-2 md:col-span-5 flex justify-end gap-3 mt-1">
            <button
              onClick={() => {
                setTempScores({ ...report.scores });
                setEditingScores(false);
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-xs font-bold rounded-lg text-slate-600 border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveScores}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Apply New Scores
            </button>
          </div>
        </div>
      )}

      {/* Visual representation graphs */}
      <CustomChart scores={report.scores} />

      {/* Executive Summary panel (Client facing) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-bold text-slate-900">Executive Summary (Client Report)</h4>
          </div>
          {!editingSummary ? (
            <button
              onClick={() => {
                setSummaryText(report.clientSummary);
                setEditingSummary(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Summary
            </button>
          ) : null}
        </div>

        {editingSummary ? (
          <div className="space-y-3">
            <textarea
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              rows={6}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 text-sm leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Write executive summary here..."
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setEditingSummary(false)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg text-slate-650 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSummary}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Summary
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4.5 rounded-xl border border-slate-100">
            {report.clientSummary}
          </div>
        )}
      </div>

      {/* Grid containing Issues List (left) and SEO Checklist Side-Panel (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Audit Issues list (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Website Audit Issues
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
                  {filteredIssues.length} found
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Filter, edit, delete, or add specific improvements for your client.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Focus Domains</option>
                <option value="design">Design Issues Only</option>
                <option value="content">Content Issues Only</option>
                <option value="seo">SEO Issues Only</option>
                <option value="cro">CRO Issues Only</option>
                <option value="ui">UI/UX Issues Only</option>
              </select>

              {/* Severity Filter */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="high">High Severity Only</option>
                <option value="medium">Medium Severity Only</option>
                <option value="low">Low Severity Only</option>
              </select>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Issue
              </button>
            </div>
          </div>

          {/* Add custom issue form */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 shadow-sm space-y-4 animate-slide-down">
              <h5 className="text-sm font-bold text-slate-900">Add New Website Improvement Issue</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">Issue Category</label>
                  <select
                    value={newIssue.category}
                    onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value as AuditCategory })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="design">Design</option>
                    <option value="content">Content</option>
                    <option value="seo">SEO</option>
                    <option value="cro">CRO</option>
                    <option value="ui">UI/UX</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">Severity</label>
                  <select
                    value={newIssue.severity}
                    onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value as Severity })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="high">High (Urgent Impact)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Minor Polish)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-700 mb-1.5">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Hero Section Button lacks sufficient contrast"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">Description (English)</label>
                  <textarea
                    placeholder="Describe the current issue and its impact on users (e.g., checkout button is hard to find on mobile)..."
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    rows={3}
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">Solution / Recommended Action (English)</label>
                  <textarea
                    placeholder="How should this be fixed and what is the expected benefit? (e.g., increase button target size to 44px and use a high-contrast color)..."
                    value={newIssue.solution}
                    onChange={(e) => setNewIssue({ ...newIssue, solution: e.target.value })}
                    rows={3}
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIssue}
                  disabled={!newIssue.title || !newIssue.description || !newIssue.solution}
                  className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-xs font-bold rounded-lg text-white shadow-md cursor-pointer"
                >
                  Create Issue
                </button>
              </div>
            </div>
          )}

          {/* List of issues */}
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                No issues matched your filters. Adjust filters or create a custom issue!
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isEditing = editingIssueId === issue.id;
                const catMeta = categoriesList.find(c => c.value === issue.category) || categoriesList[0];
                const sevMeta = severityMetadata[issue.severity] || severityMetadata.medium;
                const SevIcon = sevMeta.icon;

                return (
                  <div
                    key={issue.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 ${
                      isEditing 
                        ? 'bg-indigo-50/15 border-indigo-400 ring-1 ring-indigo-400/25' 
                        : 'bg-white hover:bg-slate-50/50 border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isEditing ? (
                      /* EDIT MODE FORM */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-600 mb-1">Issue Title</label>
                            <input
                              type="text"
                              value={editingIssue.title || ''}
                              onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-600 mb-1">Category</label>
                            <select
                              value={editingIssue.category}
                              onChange={(e) => setEditingIssue({ ...editingIssue, category: e.target.value as AuditCategory })}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="design">Design</option>
                              <option value="content">Content</option>
                              <option value="seo">SEO</option>
                              <option value="cro">CRO</option>
                              <option value="ui">UI/UX</option>
                            </select>
                          </div>

                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-600 mb-1">Severity</label>
                            <select
                              value={editingIssue.severity}
                              onChange={(e) => setEditingIssue({ ...editingIssue, severity: e.target.value as Severity })}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-600 mb-1">Description (English)</label>
                            <textarea
                              value={editingIssue.description || ''}
                              onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                              rows={3}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-600 mb-1">Solution (English)</label>
                            <textarea
                              value={editingIssue.solution || ''}
                              onChange={(e) => setEditingIssue({ ...editingIssue, solution: e.target.value })}
                              rows={3}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => {
                              setEditingIssueId(null);
                              setEditingIssue({});
                            }}
                            className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveIssue}
                            className="px-3 py-1 bg-indigo-650 hover:bg-indigo-600 text-xs font-semibold rounded text-white cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* READ MODE DISPLAY */
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          {/* Title and Badge row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-sm font-bold text-slate-900 leading-tight pr-2">
                              {issue.title}
                            </h5>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.color} capitalize`}>
                              {catMeta.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${sevMeta.color}`}>
                              <SevIcon className="w-3 h-3" />
                              {sevMeta.label}
                            </span>
                          </div>

                          {/* Side by side descriptive layout */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Before / Issue:</span>
                              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                {issue.description}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">After / Recommendation:</span>
                              <p className="text-xs text-indigo-850 leading-relaxed bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50">
                                {issue.solution}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Side Actions */}
                        <div className="flex flex-col items-center gap-2 pt-0.5 self-start">
                          <button
                            onClick={() => handleStartEditIssue(issue)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit issue details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete issue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - SEO Checklist Side-Panel (lg:col-span-1) */}
        <div className="lg:col-span-1">
          <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-6 self-start">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">SEO Checklist</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Quality checkpoints</p>
                </div>
              </div>
              <button 
                onClick={handleResetChecklist}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="Reset checklist to default templates"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Overall Progress Meter */}
            {(() => {
              const totalItems = checklist.length;
              const completedItems = checklist.filter(item => item.completed).length;
              const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

              return (
                <div className="space-y-2 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700">Audit Implementation</span>
                    <span className="font-black text-emerald-600 bg-white border border-emerald-150 px-2 py-0.5 rounded-lg text-[10px]">
                      {completedItems} / {totalItems} ({overallPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden border border-slate-300/30">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/10" 
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Category Checklists Accordion */}
            {(() => {
              const categories: { key: 'meta' | 'alt' | 'headings'; label: string; icon: string; desc: string; color: string; badgeBg: string }[] = [
                { key: 'meta', label: 'Meta Tags & Crawl Info', icon: '📝', desc: 'Title, description, social Open Graph tags', color: 'bg-indigo-50 border-indigo-200/50 text-indigo-700', badgeBg: 'bg-indigo-500' },
                { key: 'alt', label: 'Image Alt Descriptions', icon: '🖼️', desc: 'Alt tags for hero, logo & product items', color: 'bg-pink-50 border-pink-200/50 text-pink-700', badgeBg: 'bg-pink-500' },
                { key: 'headings', label: 'Heading Hierarchies', icon: '🏷️', desc: 'Single H1 tag, logical nested tag structure', color: 'bg-cyan-50 border-cyan-200/50 text-cyan-700', badgeBg: 'bg-cyan-500' }
              ];

              return (
                <div className="space-y-3.5">
                  {categories.map((cat) => {
                    const catItems = checklist.filter(item => item.category === cat.key);
                    const catCompleted = catItems.filter(item => item.completed).length;
                    const catTotal = catItems.length;
                    const catPercentage = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
                    const isExpanded = expandedCategories[cat.key];

                    return (
                      <div key={cat.key} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Accordion Trigger row */}
                        <div 
                          onClick={() => setExpandedCategories({ ...expandedCategories, [cat.key]: !isExpanded })}
                          className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm flex-shrink-0">{cat.icon}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 block truncate leading-tight">{cat.label}</span>
                              <span className="text-[9px] text-slate-400 block truncate mt-0.5">{cat.desc}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] font-black text-slate-500 bg-white border border-slate-250/60 px-1.5 py-0.5 rounded-md">
                              {catCompleted}/{catTotal}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                        </div>

                        {/* Accordion Content list */}
                        {isExpanded && (
                          <div className="divide-y divide-slate-100 p-1 bg-white">
                            {catItems.length === 0 ? (
                              <div className="p-3.5 text-center text-[10px] text-slate-400 font-bold uppercase">
                                No Checkpoints Added
                              </div>
                            ) : (
                              catItems.map((item) => {
                                const isDetailOpen = expandedDetailsId === item.id;
                                return (
                                  <div key={item.id} className="p-2 rounded-lg hover:bg-slate-50/70 transition-all duration-200 group">
                                    <div className="flex items-start gap-2.5">
                                      {/* Checkbox wrapper */}
                                      <button
                                        onClick={() => handleToggleChecklistItem(item.id)}
                                        className="mt-0.5 flex-shrink-0 focus:outline-none transition-transform active:scale-90 cursor-pointer"
                                      >
                                        {item.completed ? (
                                          <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center border border-emerald-600 shadow-sm shadow-emerald-500/20">
                                            <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                          </div>
                                        ) : (
                                          <div className="w-4 h-4 rounded border border-slate-300 hover:border-emerald-500 bg-white transition-all shadow-sm" />
                                        )}
                                      </button>

                                      {/* Checklist description */}
                                      <div className="flex-1 min-w-0">
                                        <span 
                                          onClick={() => handleToggleChecklistItem(item.id)}
                                          className={`text-[11px] font-bold leading-normal block cursor-pointer select-none transition-all ${
                                            item.completed 
                                              ? 'text-slate-400 line-through' 
                                              : 'text-slate-750 group-hover:text-slate-900'
                                          }`}
                                        >
                                          {item.label}
                                        </span>

                                        <div className="flex items-center gap-2 mt-1">
                                          {item.details && (
                                            <button
                                              onClick={() => setExpandedDetailsId(isDetailOpen ? null : item.id)}
                                              className="text-[9px] font-bold text-slate-400 hover:text-indigo-650 flex items-center gap-0.5 cursor-pointer"
                                            >
                                              <HelpCircle className="w-2.5 h-2.5" /> {isDetailOpen ? 'Hide Tip' : 'Show Tip'}
                                            </button>
                                          )}

                                          {item.id.startsWith('custom-') && (
                                            <button
                                              onClick={(e) => handleDeleteChecklistItem(item.id, e)}
                                              className="text-[9px] font-black text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                              Delete
                                            </button>
                                          )}
                                        </div>

                                        {/* Expanded Details / Tips */}
                                        {isDetailOpen && item.details && (
                                          <div className="mt-1.5 p-2 bg-indigo-50/50 border border-indigo-100 text-[10px] text-indigo-950 rounded-lg leading-relaxed animate-fade-in font-medium">
                                            {item.details}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Add Custom Checkpoint segment */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-[10px] font-extrabold text-slate-700 block uppercase tracking-wider">Add Custom Checkpoint</span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g., Setup viewport tags for mobile crawlers"
                  value={newSeoLabel}
                  onChange={(e) => setNewSeoLabel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
                />
                
                <div className="flex items-center gap-2">
                  <select
                    value={newSeoCategory}
                    onChange={(e) => setNewSeoCategory(e.target.value as any)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="meta">Meta Tags</option>
                    <option value="alt">Image Alts</option>
                    <option value="headings">Headings</option>
                  </select>
                  
                  <button
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
