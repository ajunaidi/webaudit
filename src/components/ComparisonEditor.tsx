/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ComparisonReport, ComparisonItem } from '../types';
import { Edit3, Check, Trash2, Plus, Sparkles, TrendingUp, HelpCircle, LayoutGrid, Layers, ArrowRight, X } from 'lucide-react';

interface ComparisonEditorProps {
  report: ComparisonReport;
  onUpdate: (updatedReport: ComparisonReport) => void;
  oldImageSrc?: string;
  newImageSrc?: string;
}

export const ComparisonEditor: React.FC<ComparisonEditorProps> = ({
  report,
  onUpdate,
  oldImageSrc,
  newImageSrc
}) => {
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(report.clientSummary);

  const [editingMetrics, setEditingMetrics] = useState(false);
  const [tempScore, setTempScore] = useState(report.improvementScore);
  const [tempLift, setTempLift] = useState(report.conversionLift);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ComparisonItem>>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ComparisonItem, 'id'>>({
    element: '',
    oldState: '',
    newState: '',
    benefit: ''
  });

  const handleSaveSummary = () => {
    onUpdate({
      ...report,
      clientSummary: summaryText
    });
    setEditingSummary(false);
  };

  const handleSaveMetrics = () => {
    onUpdate({
      ...report,
      improvementScore: Math.max(0, Math.min(100, Number(tempScore) || 0)),
      conversionLift: tempLift
    });
    setEditingMetrics(false);
  };

  const handleStartEditItem = (item: ComparisonItem) => {
    setEditingItemId(item.id);
    setEditingItem({ ...item });
  };

  const handleSaveItem = () => {
    if (!editingItem.element || !editingItem.oldState || !editingItem.newState || !editingItem.benefit) return;

    const updatedItems = report.items.map(it => 
      it.id === editingItemId ? (editingItem as ComparisonItem) : it
    );

    onUpdate({
      ...report,
      items: updatedItems
    });
    setEditingItemId(null);
    setEditingItem({});
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = report.items.filter(it => it.id !== id);
    onUpdate({
      ...report,
      items: updatedItems
    });
  };

  const handleAddItem = () => {
    if (!newItem.element || !newItem.oldState || !newItem.newState || !newItem.benefit) return;

    const created: ComparisonItem = {
      ...newItem,
      id: `comp-${Date.now()}`
    };

    onUpdate({
      ...report,
      items: [...report.items, created]
    });

    setNewItem({
      element: '',
      oldState: '',
      newState: '',
      benefit: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Side-by-side Visual comparison preview */}
      {(oldImageSrc || newImageSrc) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-widest bg-rose-50 border border-rose-200/50 px-2.5 py-1 rounded">
                OLD Website Design (Before)
              </span>
              {report.oldImageName && <span className="text-[10px] text-slate-400">{report.oldImageName}</span>}
            </div>
            <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center group relative">
              {oldImageSrc ? (
                <img
                  src={oldImageSrc}
                  alt="Old Website Design"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-slate-400 text-xs">No image provided</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded">
                NEW Redesign (After)
              </span>
              {report.newImageName && <span className="text-[10px] text-slate-400">{report.newImageName}</span>}
            </div>
            <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center group relative">
              {newImageSrc ? (
                <img
                  src={newImageSrc}
                  alt="New Website Design"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-slate-400 text-xs">No image provided</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Section: Improvement Score & Estimated conversion lift */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-indigo-650 tracking-wider uppercase">Strategic Impact Metrics</span>
          <h3 className="text-lg font-bold text-slate-900">Redesign Improvement & Conversion Projection</h3>
          <p className="text-xs text-slate-500">These metrics illustrate estimated performance increases from migrating to the new UI.</p>
        </div>

        {editingMetrics ? (
          <div className="flex flex-wrap items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col w-28">
              <label className="text-[10px] font-bold text-slate-500 mb-1">Improvement %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={tempScore}
                onChange={(e) => setTempScore(Number(e.target.value) || 0)}
                className="bg-white text-indigo-750 border border-slate-200 px-2 py-1 text-sm font-bold rounded focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col w-40">
              <label className="text-[10px] font-bold text-slate-500 mb-1">Conversion Lift</label>
              <input
                type="text"
                value={tempLift}
                onChange={(e) => setTempLift(e.target.value)}
                className="bg-white text-indigo-750 border border-slate-200 px-2 py-1 text-sm font-bold rounded focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditingMetrics(false)}
                className="p-1.5 bg-white rounded border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveMetrics}
                className="p-1.5 bg-indigo-600 rounded hover:bg-indigo-700 text-white cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-inner">
            <div className="text-center px-4 border-r border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Improvement Score</span>
              <span className="text-2xl font-black text-indigo-600">{report.improvementScore}/100</span>
            </div>

            <div className="text-center px-4 flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> Projected Lift
              </span>
              <span className="text-lg font-extrabold text-emerald-600 mt-0.5">{report.conversionLift}</span>
            </div>

            <button
              onClick={() => {
                setTempScore(report.improvementScore);
                setTempLift(report.conversionLift);
                setEditingMetrics(true);
              }}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Edit metrics"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Client facing Comparison summary report */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-bold text-slate-900 font-sans tracking-tight">Executive Comparison Statement</h4>
          </div>
          {!editingSummary ? (
            <button
              onClick={() => {
                setSummaryText(report.clientSummary);
                setEditingSummary(true);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Executive Statement
            </button>
          ) : null}
        </div>

        {editingSummary ? (
          <div className="space-y-3">
            <textarea
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              rows={6}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 text-sm leading-relaxed focus:outline-none focus:border-indigo-500"
              placeholder="Write executive summary of design differences and visual layout changes here..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingSummary(false)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSummary}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded text-white cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-750 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4.5 rounded-xl border border-slate-100">
            {report.clientSummary}
          </p>
        )}
      </div>

      {/* Comparison Items - List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Section Comparison Details
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
                {report.items.length} sections analyzed
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Detail breakdown of exactly what changed, what it improves, and the business benefit.</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>

        {/* Add custom section form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 shadow-sm space-y-4 animate-slide-down">
            <h5 className="text-sm font-bold text-slate-900">Add Section Comparison</h5>
            
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-700 mb-1.5">Page Element / Section Name</label>
              <input
                type="text"
                placeholder="e.g. Hero Section Call-To-Action, Navigation Header, Testimonials Layout"
                value={newItem.element}
                onChange={(e) => setNewItem({ ...newItem, element: e.target.value })}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-700 mb-1.5">Before State (Legacy layout/design)</label>
                <textarea
                  placeholder="e.g., Previous CTA button was too small, low contrast, and lacked vibrant gradients..."
                  value={newItem.oldState}
                  onChange={(e) => setNewItem({ ...newItem, oldState: e.target.value })}
                  rows={3}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-700 mb-1.5">After State (Improved redesign)</label>
                <textarea
                  placeholder="e.g., Redesigned layout utilizes a clear, full-width high-contrast button with elegant padding..."
                  value={newItem.newState}
                  onChange={(e) => setNewItem({ ...newItem, newState: e.target.value })}
                  rows={3}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-700 mb-1.5">Value Benefit (Expected business outcome)</label>
                <textarea
                  placeholder="e.g., Customers find the CTA instantly upon page load, driving higher signup lift..."
                  value={newItem.benefit}
                  onChange={(e) => setNewItem({ ...newItem, benefit: e.target.value })}
                  rows={3}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.element || !newItem.oldState || !newItem.newState || !newItem.benefit}
                className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-xs font-bold rounded-lg text-white shadow-md cursor-pointer"
              >
                Add Comparison Section
              </button>
            </div>
          </div>
        )}

        {/* Comparative items list */}
        <div className="space-y-4">
          {report.items.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              No section comparisons added. Create one using the button above!
            </div>
          ) : (
            report.items.map((item) => {
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    isEditing
                      ? 'bg-indigo-50/15 border-indigo-400 ring-1 ring-indigo-400/25'
                      : 'bg-white hover:bg-slate-50/50 border-slate-200 shadow-sm'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-600 mb-1">Element / Section Name</label>
                        <input
                          type="text"
                          value={editingItem.element || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, element: e.target.value })}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-600 mb-1">Before State (Legacy)</label>
                          <textarea
                            value={editingItem.oldState || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, oldState: e.target.value })}
                            rows={3}
                            className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-600 mb-1">After State (Improved)</label>
                          <textarea
                            value={editingItem.newState || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, newState: e.target.value })}
                            rows={3}
                            className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-600 mb-1">Value Benefit (Expected)</label>
                          <textarea
                            value={editingItem.benefit || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, benefit: e.target.value })}
                            rows={3}
                            className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setEditingItemId(null);
                            setEditingItem({});
                          }}
                          className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveItem}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded text-white cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4 flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          {item.element}
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block">BEFORE STATE:</span>
                            <p className="text-xs text-slate-700 leading-relaxed mt-1">
                              {item.oldState}
                            </p>
                          </div>

                          <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block">AFTER STATE:</span>
                            <p className="text-xs text-slate-700 leading-relaxed mt-1">
                              {item.newState}
                            </p>
                          </div>

                          <div className="space-y-1 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/50">
                            <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-indigo-600" /> VALUE BENEFIT:
                            </span>
                            <p className="text-xs text-indigo-850 leading-relaxed mt-1">
                              {item.benefit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 pt-0.5 self-start">
                        <button
                          onClick={() => handleStartEditItem(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit item comparison"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete comparison item"
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
