/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  UploadCloud, 
  History, 
  TrendingUp, 
  Download, 
  Save, 
  X, 
  HelpCircle, 
  Layout, 
  FileText, 
  Plus, 
  AlertCircle, 
  Loader2, 
  ArrowLeftRight, 
  Layers, 
  CheckCircle,
  ExternalLink,
  Share2,
  Copy,
  Mail,
  Check
} from 'lucide-react';
import { AuditReport, ComparisonReport, AuditIssue, ComparisonItem, AuditCategory } from './types';
import { AuditEditor } from './components/AuditEditor';
import { ComparisonEditor } from './components/ComparisonEditor';
import { HistoricalTrendChart } from './components/CustomChart';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ==========================================
// SEED/SAMPLE DATA FOR AN INSTANT PREMIUM EXPERIENCE
// ==========================================

const SAMPLE_AUDIT_REPORT: AuditReport = {
  id: 'sample-audit-1',
  url: 'www.shophaven-boutique.pk',
  date: '2026-07-01, 11:30 AM',
  scores: {
    design: 68,
    content: 55,
    seo: 72,
    cro: 48,
    ui: 60,
    overall: 61
  },
  clientSummary: `We have completed the comprehensive audit for the ShopHaven boutique website. While the overall design is relatively clean, we identified significant gaps in the conversion architecture and content flow. 

The primary bottlenecks include slow page load speeds and a lack of prominent Call-to-Action (CTA) buttons, contributing to a high bounce rate. Although basic SEO metadata exists, structured headings are not properly aligned. Addressing the recommended improvements could increase online purchase rates and direct customer actions by an estimated 25-30%.`,
  issues: [
    {
      id: 'iss-1',
      category: 'cro',
      severity: 'high',
      title: 'Hero CTA lacks visual priority and urgency',
      description: 'The primary CTA button on the main landing page banner is too small and blends with the background image, making it difficult for visitors to immediately notice where to click.',
      solution: 'Increase the size of the CTA button, apply a vibrant contrasting color (such as custom blue or orange), and update the text to be more compelling, e.g., "Shop New Arrivals Now - Get 20% Off".'
    },
    {
      id: 'iss-2',
      category: 'seo',
      severity: 'high',
      title: 'Missing SEO meta descriptions and image alt tags',
      description: 'Product images lack descriptive alt attributes and the main landing page is missing an H1 heading, which hinders search engine crawling and indexation.',
      solution: 'Add descriptive alt tags to all product category images and write custom search-optimized meta tags. Include local keywords to improve organic search discoverability.'
    },
    {
      id: 'iss-3',
      category: 'ui',
      severity: 'medium',
      title: 'Mobile navigation menu is difficult to click',
      description: 'The mobile navigation hamburger button has a tiny touch target and the links in the menu drawer are spaced too closely, leading to accidental misclicks.',
      solution: 'Increase the clickable target area of the hamburger button (minimum 44x44px touch target) and add comfortable vertical spacing between individual mobile menu items.'
    },
    {
      id: 'iss-4',
      category: 'design',
      severity: 'medium',
      title: 'Poor text readability over bright background images',
      description: 'The white headings in the hero section are placed directly on top of a bright fashion banner image, causing visual strain and low readability.',
      solution: 'Apply a subtle, semi-transparent dark gradient overlay on top of the banner image to make the white text contrast clearly and ensure effortless readability.'
    }
  ]
};

const SAMPLE_COMPARISON_REPORT: ComparisonReport = {
  id: 'sample-comp-1',
  url: 'www.leadwave-consulting.com',
  date: '2026-07-01, 04:15 PM',
  improvementScore: 84,
  conversionLift: '+28% to +42% estimated conversion lift',
  clientSummary: `We have prepared a detailed side-by-side design comparison between the legacy website layout and the newly proposed redesign.

The redesigned interface performs significantly better across all visual weight and modern layout principles. The legacy design's visual hierarchy issues, flat CTA colors, and text-heavy columns have been replaced with high-impact layouts, structured visual icons, and prominent brand-blue accents. Mobile and desktop usability are now in a pristine state, boosting brand trust and lowering bounce rates.`,
  items: [
    {
      id: 'comp-1',
      element: 'Hero Banner Layout',
      oldState: 'The legacy layout was overcrowded with multiple paragraphs of text and had no visual imagery, causing visitors to lose focus and bounce within the first 5 seconds.',
      newState: 'The new layout features a clear, two-line value proposition on the left side and a high-quality modern success vector graphic on the right.',
      benefit: 'Significantly improves aesthetic appeal and retains visitor engagement within the critical first few seconds.'
    },
    {
      id: 'comp-2',
      element: 'Lead Generation Form',
      oldState: 'The old form had 8 required input fields, asking for redundant contact details, which resulted in a high 60% form abandonment rate.',
      newState: 'The streamlined modern form has only 3 essential inputs: Full Name, Business Email, and Project Type dropdown checklist.',
      benefit: 'Reduces user friction, making it easier to submit inquiries and directly increasing daily lead conversions.'
    },
    {
      id: 'comp-3',
      element: 'Client Testimonial Section',
      oldState: 'Testimonials were displayed as simple plain text blocks without user avatars, company logos, or verified client credentials.',
      newState: 'The new design implements an interactive carousel showcasing verified LinkedIn client headshots, clear company logos, and prominent star ratings.',
      benefit: 'Establishes stronger social proof and builds trust, directly optimizing the sales funnel performance.'
    }
  ],
  oldImageName: 'legacy_home_layout.png',
  newImageName: 'redesign_v2_dashboard.png'
};

// ==========================================
// UNICODE SECURE BASE64 ENCODING HELPERS
// ==========================================
const encodeReport = (report: any, type: 'audit' | 'compare') => {
  const jsonStr = JSON.stringify({ type, data: report });
  return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

export default function App() {
  // Navigation & tabs
  const [activeTab, setActiveTab] = useState<'audit' | 'compare' | 'history'>('audit');
  
  // Sharing report states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Scraped inputs / Audit setup
  const [auditUrl, setAuditUrl] = useState('');
  const [auditNotes, setAuditNotes] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>(['design', 'content', 'seo', 'cro', 'ui']);
  
  // Image comparison inputs
  const [compUrl, setCompUrl] = useState('');
  const [compNotes, setCompNotes] = useState('');
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [oldImageName, setOldImageName] = useState('');
  const [newImageName, setNewImageName] = useState('');

  // Loading, progress & errors
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  // Active Report being viewed/edited
  const [activeAuditReport, setActiveAuditReport] = useState<AuditReport | null>(null);
  const [activeCompReport, setActiveCompReport] = useState<ComparisonReport | null>(null);

  // Storage & History
  const [savedAudits, setSavedAudits] = useState<AuditReport[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<ComparisonReport[]>([]);

  // Load history from localStorage on mount & seed if empty
  useEffect(() => {
    try {
      const auditsStr = localStorage.getItem('webaudit_audits');
      const compsStr = localStorage.getItem('webaudit_comparisons');

      if (auditsStr) {
        setSavedAudits(JSON.parse(auditsStr));
      } else {
        // Seed first audit sample
        setSavedAudits([SAMPLE_AUDIT_REPORT]);
        localStorage.setItem('webaudit_audits', JSON.stringify([SAMPLE_AUDIT_REPORT]));
      }

      if (compsStr) {
        setSavedComparisons(JSON.parse(compsStr));
      } else {
        // Seed first comparison sample
        setSavedComparisons([SAMPLE_COMPARISON_REPORT]);
        localStorage.setItem('webaudit_comparisons', JSON.stringify([SAMPLE_COMPARISON_REPORT]));
      }

      // Detect and parse shared report from URL
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get('share');
      if (shareData) {
        try {
          const decodedStr = decodeURIComponent(Array.prototype.map.call(atob(shareData), (c: string) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const parsed = JSON.parse(decodedStr);
          if (parsed.type === 'audit') {
            setActiveAuditReport(parsed.data);
            setActiveTab('audit');
          } else if (parsed.type === 'compare') {
            setActiveCompReport(parsed.data);
            setActiveTab('compare');
          }
        } catch (urlErr) {
          console.error('Failed to parse shared report from URL query parameter:', urlErr);
        }
      }
    } catch (e) {
      console.error('Failed to load history from storage:', e);
    }
  }, []);

  // Sync state functions
  const saveAuditToHistory = (reportToSave: AuditReport) => {
    const updated = savedAudits.some(a => a.id === reportToSave.id)
      ? savedAudits.map(a => a.id === reportToSave.id ? reportToSave : a)
      : [reportToSave, ...savedAudits];
    
    setSavedAudits(updated);
    localStorage.setItem('webaudit_audits', JSON.stringify(updated));
  };

  const saveComparisonToHistory = (reportToSave: ComparisonReport) => {
    const updated = savedComparisons.some(c => c.id === reportToSave.id)
      ? savedComparisons.map(c => c.id === reportToSave.id ? reportToSave : c)
      : [reportToSave, ...savedComparisons];
    
    setSavedComparisons(updated);
    localStorage.setItem('webaudit_comparisons', JSON.stringify(updated));
  };

  const deleteAuditFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAudits.filter(a => a.id !== id);
    setSavedAudits(updated);
    localStorage.setItem('webaudit_audits', JSON.stringify(updated));
    if (activeAuditReport?.id === id) setActiveAuditReport(null);
  };

  const deleteCompFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedComparisons.filter(c => c.id !== id);
    setSavedComparisons(updated);
    localStorage.setItem('webaudit_comparisons', JSON.stringify(updated));
    if (activeCompReport?.id === id) setActiveCompReport(null);
  };

  // Drag and Drop helpers for image uploads
  const handleImageUpload = (file: File, type: 'old' | 'new') => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'old') {
        setOldImage(base64);
        setOldImageName(file.name);
      } else {
        setNewImage(base64);
        setNewImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryToggle = (cat: AuditCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // API triggers
  const triggerAuditRun = async () => {
    if (!auditUrl) return;
    setLoading(true);
    setErrorMsg(null);
    setLoadingStep('Initializing target website scanning...');

    // Progress updates to keep user engaged
    const steps = [
      'Scraping title tags, headings and structure clues...',
      'Deep content and accessibility checking under progress...',
      'SEO meta tags & CRO elements are being audited...',
      'Gemini AI is generating the detailed expert report in English...',
      'Compiling and saving finalized report layout...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 2800);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: auditUrl,
          content: auditNotes,
          categories: selectedCategories
        })
      });

      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(textResponse.substring(0, 300) || `Server returned invalid content-type with status code ${response.status}`);
      }
      
      clearInterval(interval);

      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'Failed to complete audit');
      }

      const generated: AuditReport = {
        ...data,
        id: `audit-${Date.now()}`,
        url: auditUrl,
        date: new Date().toLocaleString()
      };

      // Set active and automatically save to history
      setActiveAuditReport(generated);
      saveAuditToHistory(generated);
      setLoading(false);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err?.message || 'Server call failed. Please check your internet connection or try again.');
      setLoading(false);
    }
  };

  const triggerComparisonRun = async () => {
    if (!oldImage || !newImage) return;
    setLoading(true);
    setErrorMsg(null);
    setLoadingStep('Model is analyzing both uploaded screenshots...');

    const steps = [
      'Drawing comparison grids for the legacy and new design screenshots...',
      'Analyzing typography, contrast, and layout differences...',
      'Extracting design improvements and conversion highlights...',
      'Estimating the visual upgrade score with Gemini...',
      'Finalizing the agency-ready comparative report in English...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 2800);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldImage,
          newImage,
          url: compUrl,
          content: compNotes
        })
      });

      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(textResponse.substring(0, 300) || `Server returned invalid content-type with status code ${response.status}`);
      }
      
      clearInterval(interval);

      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'Failed to analyze images');
      }

      const generated: ComparisonReport = {
        ...data,
        id: `comp-${Date.now()}`,
        url: compUrl || 'Design Comparison Run',
        date: new Date().toLocaleString(),
        oldImageName,
        newImageName
      };

      setActiveCompReport(generated);
      saveComparisonToHistory(generated);
      setLoading(false);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err?.message || 'Server vision analysis failed. Make sure images are under 5MB.');
      setLoading(false);
    }
  };

  // Advanced programmatic PDF generation using html2canvas & jsPDF
  const triggerPdfExport = async () => {
    const element = document.getElementById('pdf-report-content');
    if (!element) {
      alert('Could not find report content to export. Generating default print fallback.');
      window.print();
      return;
    }

    setIsExportingPdf(true);
    setPdfProgress('Initializing PDF engine & analyzing document elements...');

    try {
      // Small pause to allow state overlay to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPdfProgress('Capturing layout sections into high-resolution canvas...');
      
      const canvas = await html2canvas(element, {
        scale: 2, // 2x device pixel ratio for super crisp vector-like text
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('pdf-report-content');
          if (clonedEl) {
            // Force block visibility on cloned element because print-only has display: none in index.css
            clonedEl.style.setProperty('display', 'block', 'important');
            clonedEl.style.width = '800px';
            clonedEl.style.padding = '40px';
            clonedEl.style.backgroundColor = '#ffffff';
          }
        }
      });

      setPdfProgress('Structuring document pages & rendering vector layers...');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add cover/first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Slices remaining sections across multiple dynamic pages perfectly
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      setPdfProgress('Compressing artifact and initiating download...');
      
      const reportName = activeAuditReport 
        ? `webaudit_${activeAuditReport.url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf` 
        : `webaudit_design_comparison_report.pdf`;

      pdf.save(reportName);
      
      setPdfProgress('Completed successfully!');
      setTimeout(() => {
        setIsExportingPdf(false);
      }, 1000);
    } catch (error: any) {
      console.error('PDF generation failure:', error);
      setIsExportingPdf(false);
      // Fallback to native printer interface
      window.print();
    }
  };

  // Generate public-facing shareable link
  const handleShareClick = () => {
    const activeReport = activeAuditReport || activeCompReport;
    if (!activeReport) return;

    try {
      const type = activeAuditReport ? 'audit' : 'compare';
      const encoded = encodeReport(activeReport, type);
      const origin = window.location.origin + window.location.pathname;
      const url = `${origin}?share=${encoded}`;
      setShareUrl(url);
      setShowShareModal(true);
      setCopied(false);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      alert('Could not generate share link.');
    }
  };

  // Copy URL to Clipboard with double fallback (navigator and element selection)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      try {
        const input = document.getElementById('share-url-input') as HTMLInputElement;
        if (input) {
          input.select();
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (e) {
        console.error('Failed to copy', e);
      }
    });
  };

  // Compose and trigger email draft
  const triggerEmailDraft = () => {
    const activeReport = activeAuditReport || activeCompReport;
    if (!activeReport) return;

    const reportName = activeAuditReport 
      ? `Website Audit Report for ${activeAuditReport.url}` 
      : `Design Comparison Report`;

    const subject = `WebAudit Pro: Shared ${reportName}`;
    const body = `Hi there,\n\nI am sharing the expert analysis report generated with WebAudit Pro.\n\nYou can view the full interactive report and access all recommendations directly at the following public-facing link:\n${shareUrl}\n\nPlease let me know if you have any questions or feedback!\n\nBest regards,`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Trend graph calculator
  const getAuditHistoryTrend = () => {
    return savedAudits
      .map(a => ({
        date: a.date.split(',')[0],
        score: a.scores.overall,
        url: a.url
      }))
      .reverse(); // oldest first
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative pb-16">
      
      {/* Background radial gradient highlights for high-end feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/[0.02] rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-pink-600/[0.02] rounded-full filter blur-[100px] pointer-events-none -z-10" />

      {/* Header (No print) */}
      <header className="no-print w-full border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-md shadow-indigo-600/10 border border-indigo-400/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-display text-slate-900">
                WebAudit <span className="text-indigo-600">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide">EXPERT WEBSITE AUDIT & VISION COMPARISON</p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => { setActiveTab('audit'); setActiveAuditReport(null); setActiveCompReport(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'audit' && !activeAuditReport && !activeCompReport
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Website Audit
            </button>
            <button
              onClick={() => { setActiveTab('compare'); setActiveAuditReport(null); setActiveCompReport(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'compare' && !activeAuditReport && !activeCompReport
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Design Comparison
            </button>
            <button
              onClick={() => { setActiveTab('history'); setActiveAuditReport(null); setActiveCompReport(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Saved History
              {(savedAudits.length + savedComparisons.length) > 0 && (
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-indigo-200/50">
                  {savedAudits.length + savedComparisons.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* IFRAME PRINT NOTIFICATION BANNER */}
        <div className="no-print bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs flex items-center justify-between gap-3 text-amber-850 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-amber-600" />
            <span>
              <strong>PDF Export Tip:</strong> For the best quality when printing or exporting full-page reports, open the application in a new tab using the <strong>"Open in New Tab"</strong> button in the top right. This allows the browser to render the PDF perfectly!
            </span>
          </div>
        </div>

        {/* LOADING SCREEN CONTAINER */}
        {loading && (
          <div className="no-print fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative text-slate-850">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/15">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              
              <div className="pt-4 space-y-2">
                <h4 className="text-base font-bold text-slate-900">AI Expert Audit in Progress...</h4>
                <p className="text-xs text-indigo-700 font-semibold px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 inline-block animate-pulse">
                  {loadingStep}
                </p>
              </div>

              {/* Progress bar simulation */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 w-4/5 animate-pulse rounded-full" />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed px-4">
                Our high-fidelity analysis system is currently evaluating target assets and auditing design patterns. This may take up to 25-35 seconds to complete.
              </p>
            </div>
          </div>
        )}

        {/* ERROR CONTAINER */}
        {errorMsg && (
          <div className="no-print bg-rose-50 border border-rose-200 p-4.5 rounded-2xl mb-8 flex items-start gap-3.5 text-xs text-rose-800 shadow-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-sm text-rose-900">Execution Error Encountered</span>
              <p className="mt-1 leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => setErrorMsg(null)}
                className="mt-3.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg font-bold border border-rose-200 text-rose-800 hover:text-rose-900 transition-all cursor-pointer"
              >
                Acknowledge & Try Again
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE REPORT PREVIEW HEADER & ACTIONS */}
        {(activeAuditReport || activeCompReport) && (
          <div className="space-y-6">
            {/* Top Action bar */}
            <div className="no-print flex items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
                  {activeAuditReport ? <Globe className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {activeAuditReport ? `Website Audit: ${activeAuditReport.url}` : 'Design Comparison Analysis'}
                  </h2>
                  <p className="text-xs text-slate-500">You can edit this report in real-time or export it as a clean client-facing PDF.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-semibold rounded-xl border border-indigo-200 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Generate a public-facing shareable link and draft client email"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Report
                </button>
                <button
                  onClick={triggerPdfExport}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-bold rounded-xl text-white shadow-md shadow-indigo-600/10 cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF / Print
                </button>
                <button
                  onClick={() => {
                    if (activeAuditReport) {
                      saveAuditToHistory(activeAuditReport);
                    } else if (activeCompReport) {
                      saveComparisonToHistory(activeCompReport);
                    }
                    alert('Report successfully saved to history!');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-all"
                  title="Persist changes to local history"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
                <button
                  onClick={() => { setActiveAuditReport(null); setActiveCompReport(null); }}
                  className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 shadow-sm cursor-pointer"
                  title="Close Report"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* THE PRINT COMPONENT (Only visible during printing, hidden via index.css otherwise) */}
            <div id="pdf-report-content" className="print-only">
              <div className="p-10 space-y-8 bg-white text-slate-900">
                <div className="border-b-2 border-indigo-600 pb-5 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">WebAudit Pro</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expert Auditing & Layout Comparison Report</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Generated Date</p>
                    <p className="text-sm font-bold text-slate-800">{activeAuditReport ? activeAuditReport.date : activeCompReport?.date}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-1">{activeAuditReport ? activeAuditReport.url : activeCompReport?.url}</p>
                  </div>
                </div>

                {activeAuditReport && (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Executive Summary (English Audit)</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{activeAuditReport.clientSummary}</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3">Overall Performance Grades</h3>
                      <div className="grid grid-cols-5 gap-3 text-center">
                        {Object.entries(activeAuditReport.scores).map(([k, v]) => (
                          <div key={k} className="p-2 border border-slate-200 bg-white rounded-lg">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{k}</span>
                            <span className="text-lg font-black text-slate-800">{v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identified Issues & Action Items</h3>
                      {activeAuditReport.issues.map((iss, i) => (
                        <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase">{iss.category}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 uppercase">{iss.severity} severity</span>
                            <h4 className="text-sm font-bold text-slate-900">{iss.title}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100">
                            <div>
                              <p className="font-bold text-slate-500">Before (Issue Description):</p>
                              <p className="text-slate-600 mt-0.5">{iss.description}</p>
                            </div>
                            <div>
                              <p className="font-bold text-indigo-600">How to Solve (Recommended Action):</p>
                              <p className="text-slate-700 mt-0.5">{iss.solution}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCompReport && (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Executive Comparison Statement</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{activeCompReport.clientSummary}</p>
                    </div>

                    <div className="flex items-center gap-6 p-4 border border-slate-200 rounded-lg bg-indigo-50/20">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Improvement Score</span>
                        <p className="text-xl font-black text-indigo-700">{activeCompReport.improvementScore}/100</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Conversion Lift</span>
                        <p className="text-base font-black text-emerald-600">{activeCompReport.conversionLift}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Section Redesign Comparison</h3>
                      {activeCompReport.items.map((it, i) => (
                        <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-2">
                          <h4 className="text-sm font-black text-slate-900">{it.element}</h4>
                          <div className="grid grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-100">
                            <div>
                              <p className="font-bold text-rose-600 uppercase tracking-widest text-[9px]">Before Redesign:</p>
                              <p className="text-slate-600 mt-0.5">{it.oldState}</p>
                            </div>
                            <div>
                              <p className="font-bold text-emerald-600 uppercase tracking-widest text-[9px]">After Redesign:</p>
                              <p className="text-slate-600 mt-0.5">{it.newState}</p>
                            </div>
                            <div>
                              <p className="font-bold text-indigo-600 uppercase tracking-widest text-[9px]">Expected Business Benefit:</p>
                              <p className="text-slate-700 mt-0.5">{it.benefit}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVE REPORT VIEWER - EDITABLE CLIENT REPORT MODE */}
            <div className="printable-report">
              {activeAuditReport && (
                <AuditEditor
                  report={activeAuditReport}
                  onUpdate={(updated) => {
                    setActiveAuditReport(updated);
                    saveAuditToHistory(updated);
                  }}
                />
              )}

              {activeCompReport && (
                <ComparisonEditor
                  report={activeCompReport}
                  onUpdate={(updated) => {
                    setActiveCompReport(updated);
                    saveComparisonToHistory(updated);
                  }}
                  oldImageSrc={oldImage || undefined}
                  newImageSrc={newImage || undefined}
                />
              )}
            </div>
          </div>
        )}

        {/* CREATE MODES (Audit setup and Image compare layout panels) */}
        {!activeAuditReport && !activeCompReport && (
          <div className="no-print space-y-8 animate-fade-in">
            
            {/* VIEW 1: WEBSITE AUDIT ENTRY */}
            {activeTab === 'audit' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left controls form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        Run Brand-New Website Audit
                      </h3>
                      <p className="text-xs text-slate-500">Provide your website URL. The system will inspect your page and highlight critical design, SEO, and CRO issues.</p>
                    </div>

                    <div className="space-y-4">
                      {/* URL input */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-700 mb-1.5">Website Domain / Link</label>
                        <div className="relative">
                          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                             type="text"
                             placeholder="e.g. www.myshopify-store.com"
                             value={auditUrl}
                             onChange={(e) => setAuditUrl(e.target.value)}
                             className="w-full bg-white border border-slate-200 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Select categories */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-700 mb-2">Audit Focus Domains (Choose at least one)</label>
                        <div className="flex flex-wrap gap-2">
                          {(['design', 'content', 'seo', 'cro', 'ui'] as AuditCategory[]).map((cat) => {
                            const isSelected = selectedCategories.includes(cat);
                            return (
                              <button
                                key={cat}
                                onClick={() => handleCategoryToggle(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all capitalize ${
                                  isSelected
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                {cat === 'ui' ? 'UI/UX Design' : cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content details / Notes */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-700 mb-1.5">Additional Website Context or Copy Snippet (Optional)</label>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <textarea
                            placeholder="If the website is hosted locally or protected behind a firewall, you can copy-paste your raw text, code, HTML content, or focus notes here..."
                            value={auditNotes}
                            onChange={(e) => setAuditNotes(e.target.value)}
                            rows={4}
                            className="w-full bg-white border border-slate-200 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-100 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={triggerAuditRun}
                      disabled={!auditUrl}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-white shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Start Audit Analysis
                    </button>
                  </div>
                </div>

                {/* Right side help card / statistics */}
                <div className="space-y-6">
                  {/* Performance Trend Card (If history is populated) */}
                  {savedAudits.length >= 2 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Trend Index</h4>
                      <HistoricalTrendChart history={getAuditHistoryTrend()} />
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-indigo-600" />
                      Audited Metric Dimensions
                    </h4>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <strong className="text-indigo-700">Design Issues:</strong>
                          <p className="text-slate-600 mt-0.5">Colors, alignment, font scaling, mobile rendering glitches, visual balance details.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <strong className="text-pink-700">Content Quality:</strong>
                          <p className="text-slate-600 mt-0.5">Readability indices, clarity of CTA statements, value prop, visual noise elimination.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <strong className="text-emerald-700">SEO Optimizations:</strong>
                          <p className="text-slate-600 mt-0.5">Title layouts, meta description validation, image alt presence, heading structures.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <strong className="text-amber-700">Conversion Rate (CRO):</strong>
                          <p className="text-slate-600 mt-0.5">Funnel barriers, visual priority weights, clickability of triggers, trust signals.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: VISUAL IMAGE COMPARISON */}
            {activeTab === 'compare' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                <div className="space-y-1 max-w-xl">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                    Compare Old vs New Design (Multimodal Vision)
                  </h3>
                  <p className="text-xs text-slate-500">Upload your legacy and redesigned screenshots. Gemini Vision will analyze them side-by-side to generate comparative metrics and business value reports.</p>
                </div>

                {/* Metadata details row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-700 mb-1.5">Target Web Domain (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. www.redesigned-website.com"
                      value={compUrl}
                      onChange={(e) => setCompUrl(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-700 mb-1.5">Brief Redesign Notes / Goals (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Added modern purple accent, shortened form inputs to decrease friction..."
                      value={compNotes}
                      onChange={(e) => setCompNotes(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Side-by-side drag drop panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* OLD DESIGN BOX */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-600 block uppercase tracking-wider">Step 1: Upload Old Website Screenshot</span>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0], 'old');
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-slate-100/50 rounded-2xl h-48 flex flex-col items-center justify-center p-4 text-center cursor-pointer relative group transition-all"
                    >
                      {oldImage ? (
                        <div className="absolute inset-0 p-3 flex flex-col items-center justify-center bg-slate-100 rounded-2xl">
                          <img src={oldImage} alt="Old layout" className="max-h-36 object-contain rounded border border-slate-200" referrerPolicy="no-referrer" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOldImage(null); setOldImageName(''); }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <UploadCloud className="w-8 h-8 text-rose-400 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800">Drag & Drop Old Screenshot here</span>
                          <span className="text-[10px] text-slate-400">or click to browse local files</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'old');
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* NEW DESIGN BOX */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-600 block uppercase tracking-wider">Step 2: Upload New Redesigned Screenshot</span>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0], 'new');
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-slate-100/50 rounded-2xl h-48 flex flex-col items-center justify-center p-4 text-center cursor-pointer relative group transition-all"
                    >
                      {newImage ? (
                        <div className="absolute inset-0 p-3 flex flex-col items-center justify-center bg-slate-100 rounded-2xl">
                          <img src={newImage} alt="New layout" className="max-h-36 object-contain rounded border border-slate-200" referrerPolicy="no-referrer" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setNewImage(null); setNewImageName(''); }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <UploadCloud className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800">Drag & Drop Redesigned Screenshot here</span>
                          <span className="text-[10px] text-slate-400">or click to browse local files</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'new');
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                </div>

                <button
                  onClick={triggerComparisonRun}
                  disabled={!oldImage || !newImage}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-white shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Start Layout Image Comparison
                </button>
              </div>
            )}

            {/* VIEW 3: SAVED REPORTS ARCHIVES/HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-indigo-600" />
                    Report Storage History (Client Files)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Access, load, and edit your previously generated website audit logs and comparison reports anytime.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Audits History stack */}
                  <div className="space-y-3.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Audit Runs ({savedAudits.length})</span>
                    <div className="space-y-3">
                      {savedAudits.length === 0 ? (
                        <div className="p-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          No audit reports stored in this system.
                        </div>
                      ) : (
                        savedAudits.map((aud) => (
                          <div
                            key={aud.id}
                            onClick={() => { setActiveAuditReport(aud); setActiveCompReport(null); }}
                            className="bg-white hover:bg-slate-50/50 p-4.5 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4 shadow-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold text-indigo-700 tracking-wider bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded uppercase">
                                Website Audit
                              </span>
                              <h5 className="text-sm font-bold text-slate-800 truncate mt-1.5">{aud.url}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">Date: {aud.date}</p>
                            </div>

                            <div className="flex items-center gap-4.5">
                              <div className="text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Health Score</span>
                                <span className="text-sm font-extrabold text-indigo-600 block">{aud.scores.overall}%</span>
                              </div>
                              <button
                                onClick={(e) => deleteAuditFromHistory(aud.id, e)}
                                className="p-1 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Comparisons History stack */}
                  <div className="space-y-3.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Design Comparisons ({savedComparisons.length})</span>
                    <div className="space-y-3">
                      {savedComparisons.length === 0 ? (
                        <div className="p-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          No layout comparisons stored in this system.
                        </div>
                      ) : (
                        savedComparisons.map((cmp) => (
                          <div
                            key={cmp.id}
                            onClick={() => { setActiveCompReport(cmp); setActiveAuditReport(null); }}
                            className="bg-white hover:bg-slate-50/50 p-4.5 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4 shadow-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold text-emerald-700 tracking-wider bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded uppercase">
                                Redesign Comparison
                              </span>
                              <h5 className="text-sm font-bold text-slate-800 truncate mt-1.5">{cmp.url}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">Date: {cmp.date}</p>
                            </div>

                            <div className="flex items-center gap-4.5">
                              <div className="text-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Redesign Score</span>
                                <span className="text-sm font-extrabold text-emerald-600 block">{cmp.improvementScore}%</span>
                              </div>
                              <button
                                onClick={(e) => deleteCompFromHistory(cmp.id, e)}
                                className="p-1 text-slate-400 hover:text-rose-655 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* SHARE MODAL OVERLAY */}
      {showShareModal && (
        <div className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl max-w-lg w-full shadow-2xl relative text-slate-850 space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-150">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Share Audit Report</h3>
                  <p className="text-xs text-slate-500">Generate a secure public link for clients or teams.</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Link generator row */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Public Shareable Link</label>
              <div className="relative">
                <input
                  id="share-url-input"
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-24 py-2.5 text-xs text-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Link
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">This secure link encapsulates the active report data. Anyone with this link can view it in high fidelity without needing an account.</p>
            </div>

            {/* Email Draft Button */}
            <div className="bg-slate-50/70 border border-slate-150 p-4.5 rounded-2xl space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Collaborate with Client</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Directly open your local mail client with a beautifully structured email draft containing this shareable report link.</p>
              </div>
              <button
                onClick={triggerEmailDraft}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-650/10 cursor-pointer transition-all active:scale-95"
              >
                <Mail className="w-4 h-4" /> Draft Email to Client
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-1.5">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF GENERATION MODAL OVERLAY */}
      {isExportingPdf && (
        <div className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl relative text-slate-850">
            <div className="mx-auto w-12 h-12 bg-indigo-50 border border-indigo-250 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-base font-bold text-slate-900">Generating Professional PDF</h4>
              <div className="text-xs text-indigo-700 font-semibold px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 inline-block">
                {pdfProgress}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed px-4">
              We are compiling and formatting your active grading guidelines, visual comparisons, and corrective checklists into a beautifully polished vector-aligned client-facing PDF.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
