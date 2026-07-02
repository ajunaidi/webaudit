/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditReport, AuditIssue, AuditCategory, Severity } from '../types';
import { CustomChart } from './CustomChart';
import { Trash2, Edit3, Plus, Check, X, AlertTriangle, Info, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

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

      {/* Issues Listing and filters */}
      <div className="space-y-6">
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
    </div>
  );
};
