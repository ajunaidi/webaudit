import { GoogleGenAI, Type } from "@google/genai";

async function fetchWebsiteSnippet(url: string): Promise<string> {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    
    console.log(`Fetching website snippet for: ${cleanUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout
    
    const res = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      return `HTTP error ${res.status} (${res.statusText})`;
    }
    
    const text = await res.text();
    
    // Extract title
    const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "No Title Found";
    
    // Extract meta tags
    const metaTags: string[] = [];
    const metaRegex = /<meta\s+[^>]*name=["'](description|keywords|viewport|robots)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
    let match;
    while ((match = metaRegex.exec(text)) !== null) {
      metaTags.push(`${match[1]}: ${match[2]}`);
    }
    
    // Also check property (OpenGraph) meta tags
    const ogRegex = /<meta\s+[^>]*property=["']og:(title|description|image)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
    while ((match = ogRegex.exec(text)) !== null) {
      metaTags.push(`og:${match[1]}: ${match[2]}`);
    }
    
    // Get headings (up to 12)
    const headings: string[] = [];
    const headingRegex = /<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
    let hMatch;
    let count = 0;
    while ((hMatch = headingRegex.exec(text)) !== null && count < 12) {
      const tag = hMatch[1].toLowerCase();
      const content = hMatch[2].replace(/<[^>]*>/g, "").trim();
      if (content) {
        headings.push(`${tag.toUpperCase()}: ${content}`);
        count++;
      }
    }
    
    // Get structural clues
    const linksCount = (text.match(/<a\s+/g) || []).length;
    const imagesCount = (text.match(/<img\s+/g) || []).length;
    const formsCount = (text.match(/<form\s+/g) || []).length;
    const inputsCount = (text.match(/<input\s+/g) || []).length;
    const buttonsCount = (text.match(/<button\s+/g) || []).length;
    const hasGoogleAnalytics = text.includes("google-analytics") || text.includes("gtag");
    
    // Get text content snippet (first 3500 chars)
    const cleanText = text
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3500);

    return `
=== WEBSITE METADATA & SCRAPED CONTENT ===
URL: ${cleanUrl}
Title: ${title}
Meta Tags:
${metaTags.length > 0 ? metaTags.join("\n") : "None found"}

Headings:
${headings.length > 0 ? headings.join("\n") : "None found"}

Statistics:
- Links count: ${linksCount}
- Images count: ${imagesCount}
- Forms count: ${formsCount}
- Inputs count: ${inputsCount}
- Buttons count: ${buttonsCount}
- Google Analytics found: ${hasGoogleAnalytics ? "Yes" : "No"}

Body Content Snippet:
${cleanText || "No readable content found"}
==========================================
    `.trim();
  } catch (err: any) {
    console.error("Error scraping website:", err);
    return `Scraping Attempt Failed for ${url}. Error: ${err?.message || err}. (Generating high-quality expert audit based on domain-level intelligence and user-supplied details instead)`;
  }
}

export default async function handler(req: any, res: any) {
  // Handle CORS options preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed. Only POST requests are supported." });
  }

  const { url, content, categories = ["design", "content", "seo", "cro", "ui"], keywords } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: "Website URL is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: "GEMINI_API_KEY environment variable is not defined on Vercel.", 
      details: "Please configure GEMINI_API_KEY in your Vercel Dashboard -> Project Settings -> Environment Variables." 
    });
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  try {
    // 1. Scrape the website for real data
    const scrapedSnippet = await fetchWebsiteSnippet(url);
    
    // 2. Build detailed prompt for Gemini
    const systemPrompt = `
You are WebAudit Pro, a world-class elite web auditor, SEO expert, conversion rate optimizer (CRO), visual designer, and UX architect.
Your job is to analyze the provided website information and generate a comprehensive, highly professional, and actionable audit report.

The audit categories requested are: ${categories.join(", ")}.

IMPORTANT INSTRUCTIONS:
- You must write the entire report strictly in professional, clear, and high-impact English. Avoid Roman Urdu, Hindi, or any bilingual translation/transliteration.
- Keep standard technical terms correct and natural (e.g., SEO, Meta tags, Visual Hierarchy, CRO, Call to Action, CSS, Responsive Layout, Contrast Ratio, Page Load, H1 headings).
- For each issue, provide:
  1. A clear, concise, and professional 'title' in English.
  2. A 'description' explaining the issue in detailed English. Explain what the issue is, why it is hurting the site, and where it occurs.
  3. A robust 'solution' explaining step-by-step how to fix it in English, detailing the expected business and user benefits.
- Provide realistic and fair 'scores' (0 to 100) for all aspects: design, content, seo, cro, ui, and an overall average score.
- Create a client-facing 'clientSummary' (Executive Summary) summarizing the top wins and core action plan in elegant, persuasive English.
${keywords ? `- VERY IMPORTANT: The user has provided specific focus keywords: "${keywords}". Analyze the website metadata, headings, and body content for these focus keywords. In your "seo" and "content" sections, evaluate keyword usage/placement, suggest structural or content optimization to increase keyword alignment/density, and recommend targeted strategies to improve ranking specifically for these keywords.` : ''}
    `;

    const userPrompt = `
Website URL: ${url}

Here is the real scraped snippet and structural statistics of the website:
---
${scrapedSnippet}
---

${keywords ? `SPECIFIC FOCUS KEYWORDS TO IMPROVE RANKINGS FOR:\n${keywords}\n---` : ''}

Additional User Notes / Context:
---
${content || "No additional notes provided by user."}
---

Please generate an audit covering these categories: ${categories.join(", ")}.
Return the response as a JSON object matching the requested schema. Ensure all fields are filled with high-quality, professional, and detailed content.
    `;

    console.log("Sending audit request to Gemini...");
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                design: { type: Type.INTEGER, description: "Score out of 100 for visual design, layout, alignment, and spacing." },
                content: { type: Type.INTEGER, description: "Score out of 100 for copywriting, value prop, readability, and CTAs." },
                seo: { type: Type.INTEGER, description: "Score out of 100 for meta tags, heading hierarchy, titles, alt texts, etc." },
                cro: { type: Type.INTEGER, description: "Score out of 100 for funnel optimization, friction reduction, trust cues, button sizing." },
                ui: { type: Type.INTEGER, description: "Score out of 100 for responsive mobile design, accessibility, visual hierarchy, navigation." },
                overall: { type: Type.INTEGER, description: "Overall combined score (0-100)" }
              },
              required: ["design", "content", "seo", "cro", "ui", "overall"]
            },
            clientSummary: {
              type: Type.STRING,
              description: "Executive Summary explaining the website's performance, main bottlenecks, and strategic opportunities. Write in high-quality professional English."
            },
            issues: {
              type: Type.ARRAY,
              description: "A comprehensive list of specific issues found on the website.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique short alphanumeric string identifier, e.g., 'iss-1', 'seo-2'" },
                  category: { type: Type.STRING, description: "Must be exactly one of: design, content, seo, cro, ui" },
                  severity: { type: Type.STRING, description: "Must be exactly one of: high, medium, low" },
                  title: { type: Type.STRING, description: "A concise, impactful title of the issue." },
                  description: { type: Type.STRING, description: "Detailed description in English of what the issue is, why it is hurting the site, and where it occurs." },
                  solution: { type: Type.STRING, description: "Step-by-step, actionable solution in English on how to resolve it and what benefits will be gained." }
                },
                required: ["id", "category", "severity", "title", "description", "solution"]
              }
            }
          },
          required: ["scores", "clientSummary", "issues"]
        }
      }
    });

    const reportText = geminiResponse.text;
    if (!reportText) {
      throw new Error("No response received from Gemini.");
    }

    const reportData = JSON.parse(reportText);
    if (keywords) {
      reportData.keywords = keywords;
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(reportData);
  } catch (error: any) {
    console.error("Audit Generation Failed:", error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: "Failed to generate website audit. Please try again.", details: error?.message });
  }
}
