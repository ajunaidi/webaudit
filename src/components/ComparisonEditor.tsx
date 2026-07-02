/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ComparisonReport, ComparisonItem } from '../types';
import { 
  Edit3, 
  Check, 
  Trash2, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  LayoutGrid, 
  Layers, 
  ArrowRight, 
  X, 
  Sliders, 
  Eye, 
  MessageSquare,
  Info
} from 'lucide-react';

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

  // Client-side visual comparison states
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side' | 'annotator'>('slider');
  const [sliderPos, setSliderPos] = useState(50);
  const [pendingHotspot, setPendingHotspot] = useState<{ x: number; y: number } | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

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
      id: `comp-${Date.now()}`,
      ...(pendingHotspot ? { x: pendingHotspot.x, y: pendingHotspot.y } : {})
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
    setPendingHotspot(null);
    setShowAddForm(false);
  };

  // Add click listener for hotspot plotting on NEW image
  const handleNewImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (comparisonMode !== 'annotator') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;

    setPendingHotspot({ x, y });
    setNewItem({
      element: `Redesign Accent (Point ${Math.round(x)}%, ${Math.round(y)}%)`,
      oldState: 'Legacy layout details...',
      newState: 'Redesigned visual enhancement...',
      benefit: 'Significantly elevates visual engagement and click rates.'
    });
    setShowAddForm(true);
  };

  const scrollToItem = (id: string) => {
    const el = document.getElementById(`item-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight
      el.classList.add('ring-2', 'ring-indigo-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500'), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Comparison Studio Header & Tabs */}
      {(oldImageSrc || newImageSrc) && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">Visual Review Workspace</span>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Redesign Interactive Comparison Studio
              </h4>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-250">
              <button
                onClick={() => { setComparisonMode('slider'); setPendingHotspot(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  comparisonMode === 'slider'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Wipe Slider
              </button>

              <button
                onClick={() => { setComparisonMode('side-by-side'); setPendingHotspot(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Side-by-Side
              </button>

              <button
                onClick={() => { setComparisonMode('annotator'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  comparisonMode === 'annotator'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mark hotspots directly on the redesigned layout"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Pin Hotspots
              </button>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          {comparisonMode === 'slider' && oldImageSrc && newImageSrc && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold px-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span> Left: Legacy Design</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">Drag slider below to swipe between layouts</span>
                <span className="flex items-center gap-1">Right: Modern Redesign <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span></span>
              </div>
              <div className="relative w-full aspect-[16/10] sm:aspect-video select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                {/* Old Image (Right/Background) */}
                <img
                  src={oldImageSrc}
                  alt="Legacy Design"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  referrerPolicy="no-referrer"
                />

                {/* New Image Container (Left/Foreground, width-controlled) */}
                <div 
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl pointer-events-none z-10 transition-all duration-75"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={newImageSrc}
                    alt="New Redesign"
                    className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                    style={{ width: '100%', maxWidth: 'none', height: '100%' }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Slider bar center handle */}
                <div 
                  className="absolute inset-y-0 w-0.5 bg-white pointer-events-none z-20 flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-indigo-600 border border-slate-300 shadow-xl flex items-center justify-center text-sm font-black select-none pointer-events-none transform -translate-x-1/2">
                    ↔
                  </div>
                </div>

                {/* Range Input Overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            </div>
          )}

          {comparisonMode === 'side-by-side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {comparisonMode === 'annotator' && newImageSrc && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-950 leading-relaxed">
                  <strong className="font-bold">Annotation Mockup Mode:</strong> Click directly on any area of the redesigned (NEW) screenshot below to plot a visual review hotspot. You can specify what was wrong previously, what has been improved, and the strategic business value!
                </div>
              </div>

              <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-xl border border-indigo-200 bg-slate-100 overflow-hidden cursor-crosshair">
                <div 
                  className="w-full h-full flex items-center justify-center relative"
                  onClick={handleNewImageClick}
                >
                  <img
                    src={newImageSrc}
                    alt="Click to Annotate Mockup"
                    className="w-full h-full object-contain pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                  />

                  {/* Render existing annotated items as numbered pulses */}
                  {report.items.map((item, index) => {
                    if (item.x === undefined || item.y === undefined) return null;
                    const isHovered = hoveredHotspotId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="absolute z-20 group"
                        style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                        onMouseEnter={() => setHoveredHotspotId(item.id)}
                        onMouseLeave={() => setHoveredHotspotId(null)}
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid plotting new pin
                          scrollToItem(item.id);
                        }}
                      >
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative flex items-center justify-center rounded-full h-6 w-6 bg-indigo-600 text-white font-extrabold text-xs border-2 border-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                            {index + 1}
                          </span>
                        </div>

                        {/* Hover Tooltip card */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-slate-900/95 text-white p-2.5 rounded-lg shadow-xl text-[11px] pointer-events-none transition-all duration-200 z-30 ${
                          isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                        }`}>
                          <div className="font-bold text-indigo-300 border-b border-white/10 pb-1 mb-1 truncate">
                            {index + 1}. {item.element}
                          </div>
                          <p className="line-clamp-2 text-slate-300">
                            {item.newState}
                          </p>
                          <div className="text-[9px] font-semibold text-emerald-400 mt-1">
                            Click to inspect breakdown
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pending/New active pin representation */}
                  {pendingHotspot && (
                    <div 
                      className="absolute z-30 flex items-center justify-center"
                      style={{ left: `${pendingHotspot.x}%`, top: `${pendingHotspot.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-rose-400 opacity-80"></span>
                      <span className="relative flex items-center justify-center rounded-full h-7 w-7 bg-rose-600 text-white font-black text-xs border-2 border-white shadow-xl">
                        ★
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
                  id={`item-card-${item.id}`}
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
