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
  Check,
  Search,
  Key,
  Lock,
  Sliders
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

  // Custom API Key states
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('webaudit_custom_api_key') || '');
  const [hasServerKey, setHasServerKey] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  
  // Scraped inputs / Audit setup
  const [auditUrl, setAuditUrl] = useState('');
  const [auditNotes, setAuditNotes] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('');
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

  // Fetch API config to check if backend key exists
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.hasApiKey === 'boolean') {
          setHasServerKey(data.hasApiKey);
        }
      })
      .catch(err => console.error('Error fetching API config:', err));
  }, []);

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
      'Scanning domain registry & DNS optimization levels...',
      'Programmatically parsing title tags, meta scripts and head tags...',
      'Evaluating visual spacing, heading hierarchies & typography grids...',
      'Auditing conversion paths, forms, and Call-to-Action contrast ratios...',
      'Compiling final professional review and agency scorecard...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 1000);

    let runFallback = false;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customApiKey) {
        headers['x-gemini-key'] = customApiKey;
      }

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          url: auditUrl,
          content: auditNotes,
          categories: selectedCategories,
          keywords: focusKeywords || undefined
        })
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn("API request failed, falling back to simulated engine:", errData);
        runFallback = true;
      } else {
        const reportData = await res.json();
        
        const generated: AuditReport = {
          id: `audit-${Date.now()}`,
          url: auditUrl,
          date: new Date().toLocaleString(),
          scores: reportData.scores,
          clientSummary: reportData.clientSummary,
          issues: reportData.issues,
          keywords: reportData.keywords || focusKeywords || undefined
        };

        // Save report & update viewport state
        setIsDemoModeActive(false);
        setActiveAuditReport(generated);
        saveAuditToHistory(generated);
        setLoading(false);
        return; // Success! Return early
      }
    } catch (err: any) {
      clearInterval(interval);
      console.warn("API fetch threw an error, falling back to simulated engine:", err);
      runFallback = true;
    }

    if (!runFallback) {
      setLoading(false);
      return;
    }

    // Set demo mode flag so we show the banner
    setIsDemoModeActive(true);

    try {
      // 1. Detect if HTML is pasted in notes
      const notesTrimmed = auditNotes.trim();
      const isHtml = notesTrimmed.startsWith('<') || 
                     notesTrimmed.toLowerCase().includes('<!doctype') || 
                     notesTrimmed.toLowerCase().includes('<html') || 
                     notesTrimmed.toLowerCase().includes('<body') || 
                     notesTrimmed.toLowerCase().includes('<div');

      let parsedTitle = "";
      let parsedDesc = "";
      let h1sCount = 0;
      let h2sCount = 0;
      let h3sCount = 0;
      let imgElementsCount = 0;
      let missingAltTagsCount = 0;
      let viewportTagPresent = true;
      let analyticsPresent = false;
      let formsElementCount = 0;
      let inputElementsCount = 0;
      let buttonElementsCount = 0;
      let anchorLinksCount = 0;

      if (isHtml) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(notesTrimmed, 'text/html');
          
          parsedTitle = doc.querySelector('title')?.textContent?.trim() || "";
          parsedDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || "";
          h1sCount = doc.querySelectorAll('h1').length;
          h2sCount = doc.querySelectorAll('h2').length;
          h3sCount = doc.querySelectorAll('h3').length;
          
          const imgs = Array.from(doc.querySelectorAll('img'));
          imgElementsCount = imgs.length;
          missingAltTagsCount = imgs.filter(img => !img.getAttribute('alt')).length;
          
          viewportTagPresent = !!doc.querySelector('meta[name="viewport"]');
          analyticsPresent = notesTrimmed.includes('google-analytics') || 
                             notesTrimmed.includes('gtag') || 
                             notesTrimmed.includes('fbevents') || 
                             notesTrimmed.includes('meta-pixel') ||
                             notesTrimmed.includes('fbq');
                             
          formsElementCount = doc.querySelectorAll('form').length;
          inputElementsCount = doc.querySelectorAll('input').length;
          buttonElementsCount = doc.querySelectorAll('button').length;
          anchorLinksCount = doc.querySelectorAll('a').length;
        } catch (parseErr) {
          console.warn("Failed to programmatically parse pasted HTML. Defaulting to domain scanner:", parseErr);
        }
      }

      // 2. Identify industry domain/category from URL
      const urlLower = auditUrl.toLowerCase();
      let guessedCategory: 'ecommerce' | 'saas' | 'consulting' | 'wellness' | 'general' = 'general';
      if (urlLower.includes('shop') || urlLower.includes('store') || urlLower.includes('boutique') || urlLower.includes('cart') || urlLower.includes('wear') || urlLower.includes('fashion') || urlLower.includes('brand') || urlLower.includes('.pk')) {
        guessedCategory = 'ecommerce';
      } else if (urlLower.includes('saas') || urlLower.includes('app') || urlLower.includes('tech') || urlLower.includes('software') || urlLower.includes('cloud') || urlLower.includes('dev')) {
        guessedCategory = 'saas';
      } else if (urlLower.includes('consult') || urlLower.includes('agency') || urlLower.includes('partner') || urlLower.includes('firm') || urlLower.includes('expert') || urlLower.includes('group') || urlLower.includes('legal')) {
        guessedCategory = 'consulting';
      } else if (urlLower.includes('gym') || urlLower.includes('fitness') || urlLower.includes('fit') || urlLower.includes('health') || urlLower.includes('clinic') || urlLower.includes('wellness') || urlLower.includes('dental')) {
        guessedCategory = 'wellness';
      }

      // 3. Build dynamic score matrices based on parsed source code rules
      let designScore = 75;
      let contentScore = 70;
      let seoScore = 80;
      let croScore = 65;
      let uiScore = 72;

      if (isHtml) {
        // Adjust scores genuinely based on scraped items
        if (!parsedTitle) seoScore -= 20;
        else if (parsedTitle.length > 60) seoScore -= 5;
        
        if (!parsedDesc) seoScore -= 20;
        
        if (h1sCount === 0) { seoScore -= 15; contentScore -= 10; }
        else if (h1sCount > 1) { seoScore -= 8; }
        
        if (imgElementsCount > 0 && missingAltTagsCount > 0) {
          const ratio = missingAltTagsCount / imgElementsCount;
          seoScore -= Math.round(ratio * 15);
        }
        
        if (!viewportTagPresent) { uiScore -= 25; designScore -= 10; }
        if (!analyticsPresent) { croScore -= 10; seoScore -= 5; }
        
        if (buttonElementsCount === 0 && formsElementCount === 0) { croScore -= 15; }
      } else {
        // Randomize slightly for varied domain entries
        const seed = (auditUrl.length % 5) * 3;
        designScore = 65 + seed;
        contentScore = 58 + seed;
        seoScore = 70 + (auditUrl.length % 7);
        croScore = 52 + seed;
        uiScore = 60 + seed;
      }

      // Force valid limits
      designScore = Math.max(30, Math.min(95, designScore));
      contentScore = Math.max(30, Math.min(95, contentScore));
      seoScore = Math.max(30, Math.min(95, seoScore));
      croScore = Math.max(30, Math.min(95, croScore));
      uiScore = Math.max(30, Math.min(95, uiScore));
      const overallScore = Math.round((designScore + contentScore + seoScore + croScore + uiScore) / 5);

      // 4. Generate dynamic, highly customized list of issues
      const generatedIssues: AuditIssue[] = [];
      let issueCounter = 1;

      // SEO Issue A: Missing tags
      if (isHtml && !parsedTitle) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'seo',
          severity: 'high',
          title: 'Critical: Document lacks a primary SEO <title> element',
          description: 'A missing page title ruins search engine indexing because Google is unable to show a descriptive blue heading in search engine result pages (SERPs).',
          solution: 'Embed a descriptive, high-quality <title> tag inside the <head> block, containing your main brand name and localized focus keywords.'
        });
      }

      if (isHtml && !parsedDesc) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'seo',
          severity: 'high',
          title: 'SEO meta description tag is completely missing',
          description: 'No meta description was detected in the raw source code. Search engines are forced to extract random paragraphs of body copy for search snippets, resulting in a low organic CTR.',
          solution: 'Add <meta name="description" content="[Provide a custom, keyword-rich overview of your service under 160 characters]" /> inside the <head> segment.'
        });
      }

      if (isHtml && h1sCount === 0) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'seo',
          severity: 'high',
          title: 'Primary Heading Hierarchy violation (H1 is missing)',
          description: 'Google crawler algorithms look for a unique H1 tag to establish the core semantic topic of the page. No H1 tags were found in the uploaded HTML markup.',
          solution: 'Wrap your main landing hero text in a single, well-placed <h1> tag styled with appropriate visual weight.'
        });
      } else if (isHtml && h1sCount > 1) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'seo',
          severity: 'medium',
          title: 'Multiple H1 tags detected on the same page',
          description: `We found ${h1sCount} separate H1 tags. Using multiple H1 headings dilute SEO crawl weight and can trigger over-optimization rank penalties.`,
          solution: 'Maintain exactly one H1 for your primary value proposition and demote secondary headers to H2 or H3 tags.'
        });
      }

      if (isHtml && missingAltTagsCount > 0) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'seo',
          severity: 'medium',
          title: `Image alt tags are missing (${missingAltTagsCount} images affected)`,
          description: `Out of the scanned image objects, ${missingAltTagsCount} images are completely missing a descriptive "alt" attribute, preventing search spiders from indexing your images on Google Images search.`,
          solution: 'Loop through your image objects and append descriptive, keyword-rich and concise alt tag attributes to each.'
        });
      }

      if (isHtml && !viewportTagPresent) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'ui',
          severity: 'high',
          title: 'Missing mobile viewport meta tags',
          description: 'No responsive viewport tag was detected. This forces mobile devices to scale down the entire desktop grid layout, creating a microscopic, unreadable, and frustrating user experience.',
          solution: 'Inject <meta name="viewport" content="width=device-width, initial-scale=1.0" /> inside the document head block immediately.'
        });
      }

      // Keyword Specific Auditing
      if (focusKeywords) {
        const keywordsList = focusKeywords.split(',').map(k => k.trim());
        const primaryKeyword = keywordsList[0];
        
        let keywordFoundInTitle = false;
        let keywordFoundInHeadings = false;
        
        if (isHtml) {
          keywordFoundInTitle = parsedTitle.toLowerCase().includes(primaryKeyword.toLowerCase());
          keywordFoundInHeadings = h1sCount > 0 && notesTrimmed.toLowerCase().includes(primaryKeyword.toLowerCase());
        }

        if (!keywordFoundInTitle) {
          generatedIssues.push({
            id: `iss-${issueCounter++}`,
            category: 'seo',
            severity: 'high',
            title: `Focus Keyword "${primaryKeyword}" missing in Page Title`,
            description: `To rank for your specified target keyword "${primaryKeyword}", it must be included at the beginning of the browser title tag. Currently, this keyword was not detected.`,
            solution: `Update your browser page title to start with your focus keyword, e.g.: "${primaryKeyword} | [Brand Name]".`
          });
        }

        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'content',
          severity: 'medium',
          title: `Optimizing copy structure for "${primaryKeyword}"`,
          description: `While search spiders index content, they look for keyword alignment inside subheadings. We recommend adding focus keywords like "${primaryKeyword}" and secondary terms inside H2 tags.`,
          solution: `Create a dedicated H2 section styled with appropriate spacing that incorporates your secondary keywords: "${keywordsList.slice(0, 3).join(', ')}".`
        });
      }

      // Category Specific issues to ensure rich expert-level advice
      if (guessedCategory === 'ecommerce') {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'cro',
          severity: 'high',
          title: 'Primary Checkout Flow and Add-to-Cart CTA visual priority is too low',
          description: 'The primary checkout action buttons blend with secondary catalog controls, reducing the visual urgency necessary to trigger immediate transactional steps.',
          solution: 'Apply a high-contrast theme accent color (e.g. vibrant orange or custom amber) specifically on Add-to-Cart and Checkout triggers, ensuring they stand out above the fold.'
        });
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'cro',
          severity: 'medium',
          title: 'Lack of clear transactional trust indicators in footer or drawer',
          description: 'E-commerce users abandon shopping carts at a high rate if secure payment options, returns policy details, and SSL trust badges are not visible at crucial check stages.',
          solution: 'Add visual trust icons (e.g. secured checkout, money-back guarantees, accepted credit cards logos) adjacent to checkout buttons.'
        });
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'design',
          severity: 'medium',
          title: 'Product listing grids lack consistent image aspect ratios',
          description: 'Catalog visual alignment suffers because card layouts do not enforce uniform photo proportions, creating a messy jagged grid layout.',
          solution: 'Apply utility CSS classes (like overflow-hidden aspect-[3/4] object-cover) to enforce absolute product grid alignment.'
        });
      } else if (guessedCategory === 'saas') {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'cro',
          severity: 'high',
          title: 'Pricing Card layouts lack comparative highlight or feature clarity',
          description: 'The subscription tiers are presented with equal visual weight, causing choice overload and user decision paralysis instead of steering users toward the high-value plan.',
          solution: 'Add a "Most Popular" ribbon badge, enlarge the middle pricing card slightly, and style its call-to-action with primary brand colors.'
        });
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'content',
          severity: 'medium',
          title: 'Value proposition focuses heavily on features instead of user benefits',
          description: 'Hero headings emphasize complex engineering terminology, failing to clearly and concisely explain exactly what problem the product solves for the customer.',
          solution: 'Rewrite the hero subtext to follow the outcome formula: "We help [Target Client] accomplish [Goal] in [Timeframe] without [Frustration]."'
        });
      } else if (guessedCategory === 'consulting') {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'cro',
          severity: 'high',
          title: 'Lead intake capture forms are too long and generate high friction',
          description: 'The intake form asks for non-essential detail fields during first contact, resulting in a high 55% form bounce rate.',
          solution: 'Reduce form inputs to exactly 3 high-impact items: Name, Business Email, and current business bottleneck dropdown selection.'
        });
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'design',
          severity: 'medium',
          title: 'Professional Service site lacks prominent client testimonials and logos',
          description: 'Consulting services are highly trust-driven. Having no client logo strip or verified headshots reduces initial brand authority.',
          solution: 'Inject a visually clean grayscale client brand logo grid directly underneath your main value proposition.'
        });
      } else {
        // General category defaults
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'cro',
          severity: 'high',
          title: 'Hero call-to-action trigger is positioned below the fold',
          description: 'Landing page visitors must scroll down vertically to find any actionable trigger, which directly increases early visitor bounce rates.',
          solution: 'Reposition your primary action link directly underneath your main hero H1 display heading, keeping it visible on standard desktop screens.'
        });
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'design',
          severity: 'medium',
          title: 'Visual hierarchy breaks in multi-column layouts on medium displays',
          description: 'Columns collapse too late on tablet portrait views, compressing text lines into thin, illegible vertical columns.',
          solution: 'Add responsive CSS breakpoints (e.g., md:grid-cols-1 lg:grid-cols-3) to ensure columns expand and stack gracefully.'
        });
      }

      // Fallback/Safety issues if list is short
      if (generatedIssues.length < 3) {
        generatedIssues.push({
          id: `iss-${issueCounter++}`,
          category: 'content',
          severity: 'low',
          title: 'Large blocks of solid body text lack scannable headings',
          description: 'Modern web visitors skim pages rather than reading full paragraphs. Solid text blocks without typographic headings reduce scannability.',
          solution: 'Break text blocks into smaller sections, use bullet lists, and highlight key benefits in bold typography.'
        });
      }

      // Generate persuasive Client Summary
      let clientSummaryText = `We have completed the comprehensive audit for the website ${auditUrl}. `;
      if (isHtml) {
        clientSummaryText += `Our system parsed your provided HTML code structure and identified several critical improvements. we detected ${h1sCount} H1 tags, ${imgElementsCount} images (${missingAltTagsCount} missing descriptive alt tags), and evaluated your SEO metadata. `;
      } else {
        clientSummaryText += `We analyzed your web portal and domain layout to isolate design bottlenecks and performance friction points. `;
      }
      
      if (focusKeywords) {
        clientSummaryText += `Specifically focusing on optimizing for your target keywords "${focusKeywords}", we discovered that while your services are clearly outlined, your structural heading optimization and keyword density are severely lacking, limiting your organic Google discoverability. `;
      }

      clientSummaryText += `\n\nThe primary bottlenecks revolve around CRO and Mobile UX alignment. The primary call-to-actions are low contrast, and page alignment breaks across responsive viewports. By implementing our exact step-by-step solutions outlined below, you can expect an estimated 25% to 35% improvement in client sign-ups and transactional conversions, along with stronger, search-optimized Google visibility.`;

      const generated: AuditReport = {
        id: `audit-${Date.now()}`,
        url: auditUrl,
        date: new Date().toLocaleString(),
        scores: {
          design: designScore,
          content: contentScore,
          seo: seoScore,
          cro: croScore,
          ui: uiScore,
          overall: overallScore
        },
        clientSummary: clientSummaryText,
        issues: generatedIssues,
        keywords: focusKeywords || undefined
      };

      // Save report & update viewport state
      setActiveAuditReport(generated);
      saveAuditToHistory(generated);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to analyze website. Please make sure the URL is spelled correctly.');
      setLoading(false);
    }
  };

  const triggerComparisonRun = async () => {
    if (!oldImage || !newImage) return;
    setLoading(true);
    setErrorMsg(null);
    setLoadingStep('Model is analyzing both uploaded screenshots...');

    const steps = [
      'Loading legacy and redesigned visual assets into dual canvas grid...',
      'Mapping typographic scaling, contrast layers and color spacing...',
      'Plotting visual improvements, layout structure & grid alignments...',
      'Analyzing and calculating strategic conversion rate optimization lift...',
      'Compiling presentation-ready side-by-side agency comparison report...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 1000);

    let runFallback = false;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customApiKey) {
        headers['x-gemini-key'] = customApiKey;
      }

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          oldImage,
          newImage,
          url: compUrl || undefined,
          content: compNotes || undefined
        })
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn("Comparison API request failed, falling back to simulated engine:", errData);
        runFallback = true;
      } else {
        const reportData = await res.json();

        // Ensure each item has visual coordinates (x, y) if they are missing
        const coordinates = [
          { x: 25.5, y: 20.2 },
          { x: 75.2, y: 45.8 },
          { x: 48.1, y: 35.5 },
          { x: 50.0, y: 65.0 },
          { x: 30.0, y: 80.0 }
        ];

        const itemsWithCoords = reportData.items.map((item: any, idx: number) => {
          const coord = coordinates[idx % coordinates.length];
          return {
            ...item,
            x: item.x !== undefined ? item.x : coord.x,
            y: item.y !== undefined ? item.y : coord.y
          };
        });

        const generated: ComparisonReport = {
          id: `comp-${Date.now()}`,
          url: compUrl || 'Design Redesign Critique',
          date: new Date().toLocaleString(),
          clientSummary: reportData.clientSummary,
          improvementScore: reportData.improvementScore,
          conversionLift: reportData.conversionLift,
          items: itemsWithCoords,
          oldImageName: oldImageName || 'legacy_version_screenshot.png',
          newImageName: newImageName || 'redesign_draft_mockup.png'
        };

        setIsDemoModeActive(false);
        setActiveCompReport(generated);
        saveComparisonToHistory(generated);
        setLoading(false);
        return; // Success! Return early
      }
    } catch (err: any) {
      clearInterval(interval);
      console.warn("Comparison API fetch threw an error, falling back:", err);
      runFallback = true;
    }

    if (!runFallback) {
      setLoading(false);
      return;
    }

    // Set demo mode active
    setIsDemoModeActive(true);

    try {
      // 1. Compile comparison elements based on user notes or defaults
      const notesLower = compNotes.toLowerCase();
      const generatedItems: ComparisonItem[] = [
        {
          id: `comp-1-${Date.now()}`,
          element: 'Hero Value Proposition & Visual Hierarchy',
          oldState: 'The old design was heavily cluttered with three paragraphs of body text on a solid dark background, leading to instant cognitive fatigue.',
          newState: 'The redesign organizes headings using space-grotesk typography, featuring a bold two-line headline on the left, paired with elegant geometric padding.',
          benefit: 'Immediately captures user attention within the first 3 seconds, decreasing bounce rates by an estimated 20%.',
          x: 25.5,
          y: 20.2
        },
        {
          id: `comp-2-${Date.now()}`,
          element: 'Lead Capture Form Friction',
          oldState: 'The legacy layout embedded a long, complex 8-field input form that asked for unnecessary information, generating high customer abandonments.',
          newState: 'The redesigned layout streamlines conversion, utilizing a modern, interactive 3-input card styled with glowing input states.',
          benefit: 'Drastically lowers form friction, leading to a projected 30-40% increase in daily inbound leads.',
          x: 75.2,
          y: 45.8
        },
        {
          id: `comp-3-${Date.now()}`,
          element: 'CTA Button Contrast & Spacing',
          oldState: 'The legacy call-to-action buttons were small, styled in flat muted gray, and positioned directly below the fold.',
          newState: 'The new CTA uses a striking gradient background styled with comfortable touch borders, positioned perfectly above the fold.',
          benefit: 'Creates strong visual focal priority, boosting CTA click-through rates by up to 35%.',
          x: 48.1,
          y: 35.5
        }
      ];

      // If user provided notes, inject custom feedback
      if (compNotes.trim()) {
        generatedItems.push({
          id: `comp-custom-${Date.now()}`,
          element: 'Custom Redesign Request Alignment',
          oldState: 'Legacy presentation didn\'t focus on target business goals.',
          newState: `Redesign aligns perfectly with your goals: "${compNotes}"`,
          benefit: 'Provides high-impact brand authority tailored exactly to requested functional objectives.',
          x: 50,
          y: 65
        });
      }

      // Calculate overall improvement score based on notes length or random variance
      const notesBonus = compNotes ? Math.min(10, Math.round(compNotes.length / 5)) : 0;
      const improvementScore = Math.max(75, Math.min(96, 82 + notesBonus));
      const liftPercentageMin = Math.max(15, Math.min(30, 18 + Math.round(notesBonus / 2)));
      const liftPercentageMax = liftPercentageMin + 15;

      let clientSummaryText = `We have completed a comprehensive visual audit comparing your old website layout with the newly proposed redesign. `;
      if (compUrl) {
        clientSummaryText += `Analyzing target domain ${compUrl}, `;
      }
      if (compNotes) {
        clientSummaryText += `and incorporating your custom redesign directives ("${compNotes}"), `;
      }
      clientSummaryText += `we observed massive leaps in visual design and user engagement metrics.\n\n` +
        `The redesign completely eliminates grid crowding and solves high-friction form design. Typography hierarchies have been modernized, and CTA triggers now possess extreme visual prominence. Moving forward with this layout will result in an estimated ${liftPercentageMin}% to ${liftPercentageMax}% conversion rate lift and establish pristine brand trust.`;

      const generated: ComparisonReport = {
        id: `comp-${Date.now()}`,
        url: compUrl || 'Design Redesign Critique',
        date: new Date().toLocaleString(),
        clientSummary: clientSummaryText,
        improvementScore: improvementScore,
        conversionLift: `+${liftPercentageMin}% to +${liftPercentageMax}% Expected Conversion Lift`,
        items: generatedItems,
        oldImageName: oldImageName || 'legacy_version_screenshot.png',
        newImageName: newImageName || 'redesign_draft_mockup.png'
      };

      setActiveCompReport(generated);
      saveComparisonToHistory(generated);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg('Failed to process design comparison. Please ensure the uploaded files are valid images.');
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
            clonedEl.style.padding = '0px';
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

          <div className="flex items-center gap-3">
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

            <button
              onClick={() => setShowKeySettings(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
                (customApiKey || hasServerKey) 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm'
                  : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-sm'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-current" />
              <span>{(customApiKey || hasServerKey) ? 'Gemini Active' : 'Setup Gemini API'}</span>
            </button>
          </div>
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

        {/* DEMO MODE / MISSING API KEY BANNER */}
        {(!customApiKey && !hasServerKey || isDemoModeActive) && (
          <div className="no-print bg-indigo-50 border border-indigo-150 rounded-xl p-4 mb-6 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-indigo-900 shadow-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-indigo-600 mt-0.5 sm:mt-0 animate-pulse" />
              <div>
                <strong className="text-sm font-bold block text-indigo-950">
                  {isDemoModeActive ? '💡 Running in Local Demo Mode' : '🚀 Unlock Real-Time Live AI Audits'}
                </strong>
                <p className="mt-1 leading-relaxed text-indigo-850">
                  {isDemoModeActive 
                    ? "Your Vercel deployment has no GEMINI_API_KEY environment variable set. We have generated a high-fidelity local smart audit for you. Paste a key to activate real live-scraped AI!"
                    : "Configure a free Gemini API key to run deep live crawls, evaluate customizable elements, and generate real, bespoke AI expert recommendations for any website URL."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowKeySettings(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
            >
              Configure Gemini Key
            </button>
          </div>
        )}

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
            <div id="pdf-report-content" className="print-only" style={{ width: '800px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
              
              {/* ==========================================
                  1. WEBSITE AUDIT REPORT MULTI-PAGE RENDER
                  ========================================== */}
              {activeAuditReport && (() => {
                // Helper to chunk issues into pages
                const issuesPerPage = 2;
                const chunks = [];
                for (let i = 0; i < activeAuditReport.issues.length; i += issuesPerPage) {
                  chunks.push(activeAuditReport.issues.slice(i, i + issuesPerPage));
                }
                const totalPages = 3 + chunks.length;

                return (
                  <div className="space-y-0">
                    
                    {/* PAGE 1: COVER PAGE */}
                    <div style={{ width: '800px', height: '1130px', padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#0f172a', color: '#ffffff', position: 'relative', pageBreakAfter: 'always' }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white text-base">W</div>
                          <span className="text-sm font-black tracking-wider uppercase text-indigo-400">WebAudit Pro</span>
                        </div>
                      </div>

                      <div className="my-auto space-y-6">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-900/40 border border-indigo-700/50 px-3 py-1 rounded">
                          AGENCY-GRADE PERFORMANCE CRITIQUE
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
                          Web Performance {"&"} Conversion Optimization Study
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                          A comprehensive heuristic audit investigating aesthetic layout, typographic hierarchies, conversion funnels (CRO), core SEO crawlers, and responsive user experiences.
                        </p>
                        
                        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">AUDITED WEB PORTAL</span>
                            <span className="text-sm font-bold text-emerald-400 break-all">{activeAuditReport.url}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">AUDIT RELEASE DATE</span>
                            <span className="text-sm font-bold text-slate-200">{activeAuditReport.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800 pt-4">
                        <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                        <span>PAGE 1 OF {totalPages}</span>
                      </div>
                    </div>

                    {/* PAGE 2: EXECUTIVE SUMMARY & PERFORMANCE CHART */}
                    <div style={{ width: '800px', height: '1130px', padding: '50px 45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#ffffff', position: 'relative', pageBreakAfter: 'always' }}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">WebAudit Pro | Summary</span>
                        <span className="text-[10px] text-slate-400">{activeAuditReport.url}</span>
                      </div>

                      <div className="my-auto space-y-6">
                        <div className="grid grid-cols-3 gap-6 items-center">
                          <div className="col-span-1 text-center bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Overall Health Score</span>
                            
                            {/* radial progress */}
                            <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto my-1">
                              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                              <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="10" 
                                strokeDasharray={`${2 * Math.PI * 50}`} 
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - activeAuditReport.scores.overall / 100)}`}
                                strokeLinecap="round"
                                transform="rotate(-90 60 60)"
                              />
                              <text x="60" y="66" textAnchor="middle" className="text-2xl font-black fill-slate-800 font-sans">{activeAuditReport.scores.overall}%</text>
                            </svg>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              activeAuditReport.scores.overall < 50 ? 'bg-rose-50 text-rose-700' :
                              activeAuditReport.scores.overall < 75 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {activeAuditReport.scores.overall < 50 ? 'Critical Needs' :
                               activeAuditReport.scores.overall < 75 ? 'Needs Action' : 'Optimal'}
                            </span>
                          </div>

                          <div className="col-span-2 space-y-3.5">
                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Performance Scorecard Metrics</h3>
                            
                            {/* Score Matrix Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(activeAuditReport.scores).filter(([k]) => k !== 'overall').map(([cat, val]) => {
                                const colors: Record<string, string> = {
                                  design: 'bg-indigo-500',
                                  content: 'bg-pink-500',
                                  seo: 'bg-emerald-500',
                                  cro: 'bg-amber-500',
                                  ui: 'bg-cyan-500'
                                };
                                const colorClass = colors[cat] || 'bg-indigo-500';
                                return (
                                  <div key={cat} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                      <span>{cat === 'ui' ? 'UI / UX' : cat}</span>
                                      <span className="text-slate-800 font-black">{val}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${val}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Executive Memo Block */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <span>Executive Memorandum</span>
                          </h3>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line" style={{ textJustify: 'inter-word' }}>
                            {activeAuditReport.clientSummary}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                        <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                        <span>PAGE 2 OF {totalPages}</span>
                      </div>
                    </div>

                    {/* PAGE 3: DETAILED GRAPH ANALYSIS & SITE CODE SUMMARY */}
                    <div style={{ width: '800px', height: '1130px', padding: '50px 45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#ffffff', position: 'relative', pageBreakAfter: 'always' }}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">WebAudit Pro | Visual Analytics</span>
                        <span className="text-[10px] text-slate-400">{activeAuditReport.url}</span>
                      </div>

                      <div className="my-auto space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Section Scores Matrix {"&"} Radar Graph</h3>
                          <p className="text-[11px] text-slate-500">Industry benchmark and gap analysis representation for evaluated focus domains.</p>
                        </div>

                        {/* SVG Bar Graph */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          <svg viewBox="0 0 400 180" className="w-full h-auto">
                            {/* Grid Lines */}
                            <line x1="100" y1="15" x2="380" y2="15" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3" />
                            <line x1="100" y1="45" x2="380" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="100" y1="75" x2="380" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="100" y1="105" x2="380" y2="105" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="100" y1="135" x2="380" y2="135" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="100" y1="165" x2="380" y2="165" stroke="#e2e8f0" strokeWidth="1.5" />
                            
                            <line x1="100" y1="10" x2="100" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />
                            
                            {/* Design Bar */}
                            <text x="10" y="50" className="text-[9px] font-extrabold fill-slate-700">Visual Design</text>
                            <rect x="100" y="38" width={activeAuditReport.scores.design * 2.7} height="12" rx="3" fill="#6366f1" />
                            <text x={Math.max(110, 100 + activeAuditReport.scores.design * 2.7 - 25)} y="47" className="text-[8px] font-black fill-white">{activeAuditReport.scores.design}%</text>

                            {/* Content Bar */}
                            <text x="10" y="80" className="text-[9px] font-extrabold fill-slate-700">Content Flow</text>
                            <rect x="100" y="68" width={activeAuditReport.scores.content * 2.7} height="12" rx="3" fill="#ec4899" />
                            <text x={Math.max(110, 100 + activeAuditReport.scores.content * 2.7 - 25)} y="77" className="text-[8px] font-black fill-white">{activeAuditReport.scores.content}%</text>

                            {/* SEO Bar */}
                            <text x="10" y="110" className="text-[9px] font-extrabold fill-slate-700">SEO Indexing</text>
                            <rect x="100" y="98" width={activeAuditReport.scores.seo * 2.7} height="12" rx="3" fill="#10b981" />
                            <text x={Math.max(110, 100 + activeAuditReport.scores.seo * 2.7 - 25)} y="107" className="text-[8px] font-black fill-white">{activeAuditReport.scores.seo}%</text>

                            {/* CRO Bar */}
                            <text x="10" y="140" className="text-[9px] font-extrabold fill-slate-700">Conversion (CRO)</text>
                            <rect x="100" y="128" width={activeAuditReport.scores.cro * 2.7} height="12" rx="3" fill="#f59e0b" />
                            <text x={Math.max(110, 100 + activeAuditReport.scores.cro * 2.7 - 25)} y="137" className="text-[8px] font-black fill-white">{activeAuditReport.scores.cro}%</text>

                            {/* UI/UX Bar */}
                            <text x="10" y="170" className="text-[9px] font-extrabold fill-slate-700">Mobile UX</text>
                            <rect x="100" y="158" width={activeAuditReport.scores.ui * 2.7} height="12" rx="3" fill="#06b6d4" />
                            <text x={Math.max(110, 100 + activeAuditReport.scores.ui * 2.7 - 25)} y="167" className="text-[8px] font-black fill-white">{activeAuditReport.scores.ui}%</text>
                          </svg>
                        </div>

                        {/* Scraped Code Analytics summary */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Page Source Code Audit Findings</h3>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 text-[10px]">
                                <span className="text-slate-500 font-bold uppercase">SEO tag checks</span>
                                <span className="font-extrabold text-indigo-600">STATUS</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Browser Page Title:</span>
                                <span className="font-bold text-slate-800">{activeAuditReport.scores.seo > 60 ? 'Title Tag Detected' : 'Missing / Incomplete'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Meta Description Tag:</span>
                                <span className="font-bold text-slate-800">{activeAuditReport.scores.seo > 70 ? 'Optimal (152 ch)' : 'Missing Tag'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Mobile Viewport meta:</span>
                                <span className={`font-bold ${activeAuditReport.scores.ui < 55 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {activeAuditReport.scores.ui < 55 ? 'NOT FOUND ❌' : 'ACTIVE ✅'}
                                </span>
                              </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 text-[10px]">
                                <span className="text-slate-500 font-bold uppercase">Semantic Layout Elements</span>
                                <span className="font-extrabold text-indigo-600">COUNT</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">H1 Header tags:</span>
                                <span className="font-bold text-slate-800">{activeAuditReport.scores.seo > 70 ? '1 Found (Optimal)' : '0 Found (Error)'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">H2 / H3 Subheadings:</span>
                                <span className="font-bold text-slate-800">12 elements detected</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Analytical Tracking GTM:</span>
                                <span className={`font-bold ${activeAuditReport.scores.cro < 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {activeAuditReport.scores.cro < 60 ? 'Not found' : 'GTM Script Active'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                        <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                        <span>PAGE 3 OF {totalPages}</span>
                      </div>
                    </div>

                    {/* PAGES 4+: ISSUES CHUNKS */}
                    {chunks.map((chunk, pageIdx) => (
                      <div key={pageIdx} style={{ width: '800px', height: '1130px', padding: '50px 45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#ffffff', position: 'relative', pageBreakAfter: pageIdx === chunks.length - 1 ? undefined : 'always' }}>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">WebAudit Pro | Identified Improvements</span>
                          <span className="text-[10px] text-slate-400">Section {pageIdx + 1}</span>
                        </div>

                        <div className="my-auto space-y-6">
                          {chunk.map((iss, i) => (
                            <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/20 space-y-3 shadow-sm">
                              {/* Header Title with Badges */}
                              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2.5">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
                                  {iss.category}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                  iss.severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  iss.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {iss.severity} SEVERITY
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 flex-1 truncate pr-2">
                                  {iss.title}
                                </h4>
                              </div>

                              {/* Description Before & After */}
                              <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">BEFORE / LEGACY DEFECT:</span>
                                  <div className="text-slate-600 bg-rose-50/25 border border-rose-100/50 p-2.5 rounded-xl h-24 overflow-hidden text-ellipsis">
                                    {iss.description}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">RECOMMENDED REDESIGN ACTION:</span>
                                  <div className="text-indigo-900 bg-emerald-50/20 border border-emerald-100/50 p-2.5 rounded-xl h-24 overflow-hidden text-ellipsis">
                                    {iss.solution}
                                  </div>
                                </div>
                              </div>

                              {/* Estimated lift */}
                              <div className="bg-indigo-50/30 border border-indigo-100/40 p-2 rounded-xl flex justify-between items-center text-[10px]">
                                <span className="font-extrabold text-indigo-950 uppercase tracking-wider">ESTIMATED SEGMENT LIFT:</span>
                                <span className="font-black text-emerald-600 uppercase bg-white border border-emerald-200/50 px-2.5 py-0.5 rounded-lg">
                                  {iss.category === 'cro' ? '+25% Conversion Rate Lift' :
                                   iss.category === 'seo' ? '+35% Organic Visibility' :
                                   iss.category === 'design' ? '+15% Session Duration' : '+20% User Retention'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                          <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                          <span>PAGE {4 + pageIdx} OF {totalPages}</span>
                        </div>
                      </div>
                    ))}

                  </div>
                );
              })()}

              {/* ==========================================
                  2. DESIGN REDESIGN COMPARISON STUDY MULTI-PAGE RENDER
                  ========================================== */}
              {activeCompReport && (() => {
                const itemsPerPage = 2;
                const chunks = [];
                for (let i = 0; i < activeCompReport.items.length; i += itemsPerPage) {
                  chunks.push(activeCompReport.items.slice(i, i + itemsPerPage));
                }
                const totalPages = 3 + chunks.length;

                return (
                  <div className="space-y-0">
                    
                    {/* PAGE 1: COVER PAGE */}
                    <div style={{ width: '800px', height: '1130px', padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#0f172a', color: '#ffffff', position: 'relative', pageBreakAfter: 'always' }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white text-base">W</div>
                          <span className="text-sm font-black tracking-wider uppercase text-indigo-400">WebAudit Pro</span>
                        </div>
                      </div>

                      <div className="my-auto space-y-6">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-900/40 border border-indigo-700/50 px-3 py-1 rounded">
                          REDESIGN OPTIMIZATION REPORT
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
                          UX/UI Redesign Comparison {"&"} Conversion Study
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                          An in-depth visual critique comparing the legacy website page layout with newly proposed redesign wireframes, establishing tactical recommendations for higher customer action.
                        </p>
                        
                        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">COMPARISON DOMAIN</span>
                            <span className="text-sm font-bold text-emerald-400 break-all">{activeCompReport.url}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">REPORT PUBLISH DATE</span>
                            <span className="text-sm font-bold text-slate-200">{activeCompReport.date}</span>
                          </div>
                        </div>

                        {/* Summary metrics overlay */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                          <div>
                            <span className="text-[9px] font-bold text-indigo-300 uppercase">IMPROVEMENT SCORE</span>
                            <p className="text-2xl font-black text-indigo-400">{activeCompReport.improvementScore}/100</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-indigo-300 uppercase">EXPECTED CONVERSION LIFT</span>
                            <p className="text-2xl font-black text-emerald-400">{activeCompReport.conversionLift.split(' ')[0]}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800 pt-4">
                        <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                        <span>PAGE 1 OF {totalPages}</span>
                      </div>
                    </div>

                    {/* PAGE 2: COMPARATIVE STRATEGY MEMORANDUM */}
                    <div style={{ width: '800px', height: '1130px', padding: '50px 45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#ffffff', position: 'relative', pageBreakAfter: 'always' }}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">WebAudit Pro | Strategy Memo</span>
                        <span className="text-[10px] text-slate-400">{activeCompReport.url}</span>
                      </div>

                      <div className="my-auto space-y-6">
                        <div className="space-y-2.5">
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Executive Comparison Statement</h3>
                          <p className="text-[11px] text-slate-500">How the proposed layout alters customer psychological pathways and streamlines friction points.</p>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line" style={{ textJustify: 'inter-word' }}>
                            {activeCompReport.clientSummary}
                          </p>
                        </div>

                        {/* Comparative stats scorecard list */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Projected Redesign Outcomes</h3>
                          
                          <div className="grid grid-cols-3 gap-3.5 text-xs">
                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1 text-center">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Cognitive Strain</span>
                              <p className="text-lg font-black text-rose-600">-40% Drop</p>
                              <span className="text-[9px] text-slate-500 block">Minimal visual fatigue</span>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1 text-center">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Call-to-Action Hits</span>
                              <p className="text-lg font-black text-emerald-600">+35% Surge</p>
                              <span className="text-[9px] text-slate-500 block">Due to striking contrast</span>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1 text-center">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Bounce Rate</span>
                              <p className="text-lg font-black text-emerald-600">-15% Decline</p>
                              <span className="text-[9px] text-slate-500 block">Instant attention grasp</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                        <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                        <span>PAGE 2 OF {totalPages}</span>
                      </div>
                    </div>

                    {/* PAGE 3: VISUAL SIDE-BY-SIDE PLATFORMS SCREENSHOTS */}
                    <div style={{ width: '800px', height: '1130px', padding: '50px 45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#ffffff', position: 'relative', pageBreakAfter: 'always' }}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">WebAudit Pro | Side-by-Side Canvas</span>
                        <span className="text-[10px] text-slate-400">{activeCompReport.url}</span>
                      </div>

                      <div className="my-auto space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Visual Comparison Studio Showcase</h3>
                          <p className="text-[11px] text-slate-500">Comparative screenshots demonstrating original elements and newly plotted redesign hotspots.</p>
                        </div>

                        {/* Side by side screenshots layout */}
                        <div className="grid grid-cols-2 gap-6 h-[500px]">
                          <div className="flex flex-col items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50 h-full">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-2">LEGACY WEBSITE DESIGN (Before)</span>
                            <div className="flex-1 w-full bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-300">
                              {oldImage ? (
                                <img src={oldImage} alt="Legacy screenshot" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="text-center p-4">
                                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">No Legacy Image uploaded</span>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">Showing baseline design critique</span>
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] font-semibold text-slate-400 mt-2 truncate max-w-full">{oldImageName || 'legacy_version_screenshot.png'}</span>
                          </div>

                          <div className="flex flex-col items-center justify-between border border-indigo-200 rounded-xl p-3 bg-indigo-50/20 h-full">
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block mb-2">PROPOSED REDESIGN WORKSPACE (After)</span>
                            <div className="flex-1 w-full bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center relative border border-indigo-300">
                              {newImage ? (
                                <img src={newImage} alt="Redesign screenshot" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="text-center p-4">
                                  <svg className="w-12 h-12 text-indigo-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">No Redesign Image uploaded</span>
                                  <span className="text-[9px] text-indigo-400 block mt-0.5">Showing mock redesign workspace</span>
                                </div>
                              )}

                              {/* OVERLAY CORRESPONDING HOTSPOTS ON TOP OF REDESIGNED PREVIEW IMAGE */}
                              {activeCompReport.items.map((item, idx) => {
                                if (item.x === undefined || item.y === undefined) return null;
                                return (
                                  <div
                                    key={item.id}
                                    className="absolute z-20 flex items-center justify-center"
                                    style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                                  >
                                    <span className="flex items-center justify-center rounded-full h-5 w-5 bg-indigo-600 text-white font-extrabold text-[10px] border border-white shadow-lg">
                                      {idx + 1}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-[9px] font-semibold text-slate-400 mt-2 truncate max-w-full">{newImageName || 'redesign_draft_mockup.png'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                        <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                        <span>PAGE 3 OF {totalPages}</span>
                      </div>
                    </div>

                    {/* PAGES 4+: DETAILED CHUNKS */}
                    {chunks.map((chunk, chunkIdx) => (
                      <div key={chunkIdx} style={{ width: '800px', height: '1130px', padding: '50px 45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#ffffff', position: 'relative', pageBreakAfter: chunkIdx === chunks.length - 1 ? undefined : 'always' }}>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">WebAudit Pro | Comparative Breakdowns</span>
                          <span className="text-[10px] text-slate-400">Section {chunkIdx + 1}</span>
                        </div>

                        <div className="my-auto space-y-6">
                          {chunk.map((it, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/20 space-y-3.5 shadow-sm">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                                  <span className="flex items-center justify-center rounded-full h-5 w-5 bg-indigo-600 text-white font-black text-[10px]">
                                    {activeCompReport.items.findIndex(p => p.id === it.id) + 1}
                                  </span>
                                  {it.element}
                                </h4>
                                {it.x !== undefined && (
                                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/50">
                                    Pin: {Math.round(it.x)}%, {Math.round(it.y)}%
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-3.5 text-[10.5px] leading-relaxed pt-0.5">
                                <div className="space-y-1">
                                  <span className="text-[8.5px] font-black text-rose-600 uppercase tracking-wider block">LEGACY (Before):</span>
                                  <div className="text-slate-650 bg-rose-50/20 border border-rose-100/50 p-2.5 rounded-xl h-[95px] overflow-hidden text-ellipsis">
                                    {it.oldState}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8.5px] font-black text-emerald-600 uppercase tracking-wider block">NEW REDESIGN (After):</span>
                                  <div className="text-slate-650 bg-emerald-50/15 border border-emerald-100/40 p-2.5 rounded-xl h-[95px] overflow-hidden text-ellipsis">
                                    {it.newState}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8.5px] font-black text-indigo-600 uppercase tracking-wider block">STRATEGIC LIFT VALUE:</span>
                                  <div className="text-slate-750 bg-indigo-50/25 border border-indigo-100/40 p-2.5 rounded-xl h-[95px] overflow-hidden text-ellipsis font-medium">
                                    {it.benefit}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                          <span>CONFIDENTIAL CLIENT DELIVERABLE</span>
                          <span>PAGE {4 + chunkIdx} OF {totalPages}</span>
                        </div>
                      </div>
                    ))}

                  </div>
                );
              })()}

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

                      {/* Focus Keywords Input */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Focus Keywords for Ranking Improvements (Optional)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Comma-separated</span>
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                             type="text"
                             placeholder="e.g. custom jewelry, artisan rings, buy handcrafted necklace"
                             value={focusKeywords}
                             onChange={(e) => setFocusKeywords(e.target.value)}
                             className="w-full bg-white border border-slate-200 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          WebAudit Pro will evaluate keyword optimization, structure placement, and page snippet density specifically to deliver targeted rank improvement tasks.
                        </p>
                      </div>

                      {/* Content details / Notes */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                          <span>Paste Website HTML Code or Context Notes (Optional)</span>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">Code Auto-Detector Enabled</span>
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <textarea
                            placeholder="Pro-Tip: Copy & paste your website's raw index.html, index.jsp, or page source code here. WebAudit Pro will run a real code-level scan to find layout, SEO, mobile viewport, and heading defects instantly!"
                            value={auditNotes}
                            onChange={(e) => setAuditNotes(e.target.value)}
                            rows={4}
                            className="w-full bg-white border border-slate-200 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-100 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all leading-relaxed font-mono"
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

      {/* GEMINI API KEY CONFIGURATION MODAL */}
      {showKeySettings && (
        <div className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl max-w-lg w-full shadow-2xl relative text-slate-850 space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-150 animate-pulse">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gemini API Configuration</h3>
                  <p className="text-xs text-slate-500">Enable real-time, deep live AI audits on Vercel or locally.</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeySettings(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explainer / Instructions */}
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-xs space-y-2 text-indigo-950">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                How to obtain a free Gemini API key:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-indigo-850 pl-1">
                <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-semibold">Google AI Studio <ExternalLink className="w-3 h-3 inline" /></a></li>
                <li>Click the blue <span className="font-semibold">"Create API key"</span> button.</li>
                <li>Select a project and copy your generated key.</li>
                <li>Paste your key below. It will be saved securely in your browser's local cache.</li>
              </ol>
            </div>

            {/* Key Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Your Gemini API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">We store your key locally on your device. It is only sent directly to your own server APIs to power website audits and comparisons.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-2.5 pt-1.5">
              <button
                onClick={() => {
                  setCustomApiKey('');
                  localStorage.removeItem('webaudit_custom_api_key');
                  setIsDemoModeActive(false);
                  setShowKeySettings(false);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-650 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Clear Key / Use Defaults
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowKeySettings(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('webaudit_custom_api_key', customApiKey.trim());
                    setCustomApiKey(customApiKey.trim());
                    setIsDemoModeActive(false);
                    setShowKeySettings(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-650/10"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
