"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, User, Phone, MapPin, Briefcase, FileText, ClipboardList, LogOut, Loader2, Search, ArrowRight, Clock, ShieldAlert, Lock, Download } from "lucide-react";
import { getSession, saveSession, clearSession, isAuthenticated, isAdminSession } from "@/lib/portalAuth";
import {
  getUserProfile,
  checkInToday,
  checkOutToday,
  getTodayCheckin,
  getUserCheckins,
  submitLead,
  getUserLeads,
  updateProfile,
  updateUserPassword,
  requestEditAccess,
  getEditRequest,
  getAllLeads,
  updateLeadResponse
} from "@/lib/portalDb";

// Role Overview details from PDF
const jobDetailsData = {
  "Sales Intern": {
    overview: "Support the BDE team, manage client follow-ups, and help automate lead pipeline tracking while gaining hands-on corporate sales exposure.",
    responsibilities: ["Cold calling", "WhatsApp outreach", "Follow-up messages", "CRM updates"],
    target: "Support BDE team and reduce manual follow-up work",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum (Variable Pay)"
  },
  "Business Development Executive (BDE)": {
    overview: "High-priority role focused on identifying potential clients, executing targeted outreach campaigns, and scheduling strategic meetings with prospective leads.",
    responsibilities: ["Find clients on LinkedIn / Upwork / Fiverr / Clutch", "Send outreach messages and emails", "Schedule meetings for engineering team", "Follow up with prospects"],
    target: "Generate qualified leads",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum (Variable Pay)"
  },
  "Business Development Associate (BDA)": {
    overview: "Close incoming business opportunities, discuss proposals with clients, and upsell premium services once leads are established.",
    responsibilities: ["Client meetings", "Proposal discussions", "Closing deals", "Upselling services"],
    target: "Convert opportunities into revenue",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum (Variable Pay)"
  },
  "Lead Generation Specialist": {
    overview: "Build databases of high-quality prospects and research target companies requiring website, app, cybersecurity, or digital marketing services.",
    responsibilities: ["Build prospect databases", "Collect emails, LinkedIn profiles, company details", "Maintain CRM sheets", "Research companies needing digital services"],
    target: "Keep the sales pipeline full",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum (Variable Pay)"
  },
  "Digital Marketer": {
    overview: "Execute digital marketing strategies and manage ProgVision's social media presence. Fresh graduates and creative minds welcome.",
    responsibilities: ["Execute digital marketing strategies", "Manage social media (LinkedIn, Twitter, Instagram)", "Draft content for posts and blogs", "Analyse campaign performance metrics"],
    target: "Build brand presence and generate inbound leads",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum (Variable Pay)"
  }
};

// 7-Day Training Calendar — Content sourced directly from official ProgVision PDF training materials
const trainingData = [
  {
    day: 1,
    title: "Business Model Deep-Dive",
    focus: "Understanding ProgVision & InstaDemoX",
    pdfFile: "/training-docs/Day1_Business_Model_Deep-Dive.pdf",
    keyStats: [
      { label: "Generation Time", value: "15 sec" },
      { label: "Templates", value: "7+" },
      { label: "Industries", value: "10+" },
      { label: "Setup Cost", value: "Zero" }
    ],
    sections: [
      {
        title: "About ProgVision Digital",
        content: "ProgVision Digital is an MSME-registered technology company founded with the mission of building secure, scalable digital products for businesses and startups globally. Headquartered in India with global operations spanning the USA, Europe, Asia, and Japan."
      },
      {
        title: "Service Portfolio",
        table: {
          headers: ["Service", "Description", "Target Clients"],
          rows: [
            ["Web Development", "Custom websites, landing pages, SaaS dashboards, e-commerce portals", "SMBs, startups, enterprise"],
            ["App Development", "iOS and Android native apps, React Native cross-platform, PWAs", "Retail, logistics, healthcare"],
            ["Cybersecurity Audit", "VAPT, penetration testing, SIEM setup, vulnerability reporting", "Fintech, e-commerce, BFSI"],
            ["Digital Marketing", "SEO, paid campaigns, social media, lead generation funnels", "Local businesses, D2C brands"],
            ["InstaDemoX SaaS", "AI website generator producing live business sites from Google Maps data in 15 seconds", "Local business owners across India"]
          ]
        }
      },
      {
        title: "InstaDemoX — The Flagship Product",
        content: "InstaDemoX generates fully personalized, production-ready business websites in under 15 seconds. By syncing Google Maps location data, real business reviews, ratings, and WhatsApp communication widgets, it creates a claimable live website for any local business — at zero setup cost to the client. Website: instademox.space"
      },
      {
        title: "How InstaDemoX Works — Step by Step",
        steps: [
          "User visits instademox.space and selects their city.",
          "User types their business name — system searches Google Maps in real time.",
          "InstaDemoX fetches business name, address, phone, Google rating, review count, and industry category.",
          "A fully designed, template-matched website is generated in 12-15 seconds.",
          "The generated site includes real reviews, Google Maps widget, WhatsApp contact, call button, and claim banner.",
          "The business owner clicks 'Get It Live' to claim their site with a custom subdomain or own domain.",
          "Payment completed and site goes live — no developer, no designer, no setup required."
        ]
      },
      {
        title: "Industry Templates",
        table: {
          headers: ["Industry", "Template Features", "Key CTA"],
          rows: [
            ["Restaurant & Food", "Menu highlights, delivery info, pure veg badge, cuisine tags", "WhatsApp Order / Call"],
            ["Salon & Spa", "Service menu, pricing tiers, appointment booking, treatment gallery", "Book Appointment"],
            ["Hotel & Hostel", "Room types, amenities (WiFi, AC, dining), location map", "Check Availability"],
            ["Clinic & Hospital", "Doctor profiles, specializations, OPD timings, emergency contact", "Book Consultation"],
            ["Real Estate", "Property listings, location highlights, builder credentials", "Request Site Visit"],
            ["Gym & Fitness", "Membership plans, trainer info, batch timings, equipment list", "Join Now"],
            ["School & Education", "Courses, admission info, faculty, fee structure highlights", "Enquire Now"]
          ]
        }
      },
      {
        title: "Pricing Tiers — Know Every Plan",
        table: {
          headers: ["Plan", "Price", "Key Features", "Best For"],
          rows: [
            ["Starter", "Rs. 499/month", "1 generated demo, WhatsApp button, Google Maps integration, custom domain link", "Street-side shops, food stalls, solo practitioners"],
            ["Business Live", "Rs. 999/month", "All Starter features + custom domain (.com/.in), unlimited call & route actions, free cloud hosting", "Restaurants, salons, clinics, gyms, retail stores"],
            ["Full Agency", "Rs. 2,499/month", "Manage up to 10 domains, priority SEO submission, dedicated support manager, weekly leads export", "Hotel chains, franchise businesses, real estate groups"]
          ]
        }
      }
    ],
    tip: "PRICING STRATEGY TIP: Always lead with the Business Live plan (Rs. 999/month) as your primary pitch — it offers the strongest value-to-price ratio. Offer Starter as a low-barrier entry point if they hesitate. Compare to a local web designer charging Rs. 15,000–50,000 as a one-time fee with no updates or WhatsApp integration.",
    tasks: [
      "Complete walkthrough of ProgVision services: web development, app development, cybersecurity audits, digital marketing",
      "Live demo of InstaDemoX (instademox.space) — generates personalized websites in 15 seconds using Google Maps data, real reviews, WhatsApp integration",
      "Study all 7 industry templates and understand which CTA suits each industry",
      "Memorize all 3 pricing tiers and learn when to recommend each plan",
      "Read InstaDemoX FAQ and study common objections"
    ],
    deliverable: "Complete product knowledge — able to explain InstaDemoX, pricing, and all 7 industry templates confidently"
  },
  {
    day: 2,
    title: "Lead Scraping Foundations",
    focus: "Google Maps & Directory Sources",
    pdfFile: "/training-docs/Day2_Lead_Scraping_Foundations.pdf",
    keyStats: [
      { label: "Day 2 Target", value: "30 Leads" },
      { label: "Primary Source", value: "Google Maps" },
      { label: "Industries", value: "5+ types" },
      { label: "CRM Accuracy", value: "100%" }
    ],
    sections: [
      {
        title: "What Is a Quality Lead?",
        table: {
          headers: ["Criteria", "Why It Matters"],
          rows: [
            ["No website or website link missing from Maps listing", "Highest priority — they have zero digital presence and need InstaDemoX most urgently"],
            ["Website present but clearly outdated (pre-2018)", "High priority — likely not mobile-friendly; InstaDemoX is a major upgrade"],
            ["Google rating 3.5 or above", "Business is legitimate, serving real customers, has growth potential"],
            ["Business has 20+ reviews on Google Maps", "Indicates steady customer volume — they can afford and benefit from a subscription"],
            ["Phone number visible on Maps listing", "You can make direct outreach — businesses without numbers are harder to reach"],
            ["Business is within your assigned city boundary", "Ensures coverage consistency; do not overlap other members' areas"]
          ]
        }
      },
      {
        title: "Google Maps Scraping — Step-by-Step",
        steps: [
          "Open Google Maps (maps.google.com) in your browser. Sign in with your Google account.",
          "In the search bar, type your industry keyword + city name. Example: 'restaurants in Vijayawada' or 'salons in Tirupati'.",
          "Click through listing results — use the list view on the left panel (faster than map view).",
          "Click on each business listing to open its detail panel on the right.",
          "Check the 'Website' field in the business panel. If there is no website link, this is a Priority 1 lead.",
          "Note the Google rating (stars and decimal) and the review count in brackets.",
          "Copy the business name, address, and phone number from the listing.",
          "Check if the business has a WhatsApp link — note it as 'WhatsApp Available: Yes'.",
          "Open a new tab — paste the website URL and check if it loads on mobile view (Chrome DevTools F12 > toggle device). If broken or desktop-only, mark it as 'Outdated Website'.",
          "Enter all collected data into the shared CRM Google Sheet in the correct columns."
        ]
      },
      {
        title: "CRM Data Fields — Complete Reference",
        table: {
          headers: ["Field", "Required?", "Example"],
          rows: [
            ["Business Name", "YES", "Sri Balaji Restaurant"],
            ["Industry / Category", "YES", "Restaurant"],
            ["Address", "YES", "Gandhi Road, Tirupati, AP"],
            ["City", "YES", "Tirupati"],
            ["Phone Number", "YES", "+91 9876543210"],
            ["WhatsApp Available", "YES", "Yes / No / Unknown"],
            ["Google Rating", "YES", "4.3"],
            ["Review Count", "YES", "147"],
            ["Website Status", "YES", "No Website / Outdated / Active"],
            ["Priority Level", "YES", "High / Medium / Low"],
            ["Notes", "Optional", "Owner mentioned WhatsApp only"]
          ]
        }
      },
      {
        title: "Priority Level Assignment Guide",
        table: {
          headers: ["Priority", "Criteria", "Expected Response Rate"],
          rows: [
            ["HIGH", "No website + rating 3.5+ + 20+ reviews + phone available", "25-40%"],
            ["MEDIUM", "Outdated website OR missing some contact details", "10-20%"],
            ["LOW", "Active modern website but phone available for future upsell", "3-8%"]
          ]
        }
      },
      {
        title: "Target Industries for Day 2",
        table: {
          headers: ["Industry", "Search Terms to Use", "Avg. Leads per Search"],
          rows: [
            ["Restaurants & Food", "'restaurants in [city]', 'tiffin centers [city]', 'fast food [city]', 'biryani [city]'", "15-30"],
            ["Salons & Beauty", "'salons in [city]', 'beauty parlours [city]', 'mens salon [city]', 'spa [city]'", "10-20"],
            ["Hotels & Lodges", "'hotels in [city]', 'guest house [city]', 'lodge [city]', 'stay [city]'", "8-15"],
            ["Medical Clinics", "'clinic in [city]', 'doctor [city]', 'dental clinic [city]', 'ENT [city]'", "10-25"],
            ["Gyms & Fitness", "'gym in [city]', 'fitness center [city]', 'crossfit [city]', 'yoga [city]'", "8-15"],
            ["Retail Shops", "'clothing store [city]', 'electronics shop [city]', 'furniture [city]'", "12-20"],
            ["Educational", "'coaching center [city]', 'tuition [city]', 'institute [city]'", "10-18"]
          ]
        }
      }
    ],
    tip: "EFFICIENCY TIP: Open multiple browser tabs — one for Maps search results and one for the CRM sheet. Use keyboard shortcuts (Ctrl+Tab to switch, Ctrl+C to copy) rather than right-clicking. A well-practiced lead researcher can process 10-15 leads per hour.",
    tasks: [
      "Sign in to Google Maps and understand how to read business listings — rating, review count, website presence, WhatsApp link",
      "Search at least 5 different industries in your assigned city using the approved search terms",
      "For each business: check website status, note rating, review count, phone number, WhatsApp availability",
      "Enter all collected data into CRM sheet in real-time (do NOT batch fill at end of day)",
      "Assign Priority Level (High / Medium / Low) to every entry based on the assignment guide above"
    ],
    deliverable: "Minimum 30 verified, unique leads in CRM by end of day with all required fields filled"
  },
  {
    day: 3,
    title: "Multi-Source Lead Collection",
    focus: "JustDial, IndiaMART, Yellow Pages & Social Media",
    pdfFile: "/training-docs/Day3_Multi-Source_Lead_Collection.pdf",
    keyStats: [
      { label: "Day 3 Target", value: "40 New Leads" },
      { label: "Total by Day 3", value: "70+ Leads" },
      { label: "New Platforms", value: "4 Sources" },
      { label: "De-dup Check", value: "Mandatory" }
    ],
    sections: [
      {
        title: "Why Multiple Sources Matter",
        table: {
          headers: ["Source", "Best For", "Unique Advantage"],
          rows: [
            ["JustDial", "Restaurants, salons, clinics, home services, retail", "Largest local business directory in India — phone numbers almost always verified"],
            ["IndiaMART", "Manufacturers, wholesalers, B2B suppliers, exporters", "High-value B2B leads who may need websites for international buyers"],
            ["Sulekha", "Home services, contractors, tutors, caterers", "Service-based businesses not well represented on Google Maps"],
            ["Yellow Pages India", "Established businesses, professional services, offices", "Older businesses with outdated or no digital presence"],
            ["Facebook Groups", "Restaurants, event services, local retail, home businesses", "Businesses actively promoting but with no formal website"]
          ]
        }
      },
      {
        title: "JustDial — Deep Dive Guide",
        steps: [
          "Go to justdial.com and set your city in the location field at the top.",
          "Search for your industry keyword — e.g. 'restaurants', 'beauty salons', 'dental clinics'.",
          "JustDial shows listings with star ratings, review counts, phone numbers (partially masked), and address.",
          "To see the full phone number, click 'Call' (which reveals the number on screen) or create a free JustDial account.",
          "Note whether the listing has a website link — most JustDial listings do NOT have a website link, making them ideal InstaDemoX prospects.",
          "Enter all relevant data into the CRM sheet, marking the Source column as 'JustDial'."
        ]
      },
      {
        title: "Facebook Local Business Groups",
        table: {
          headers: ["Business Type", "Signs They Need InstaDemoX", "Approach Angle"],
          rows: [
            ["Home baker / caterer posting photos", "No website, all orders on WhatsApp", "'Your food looks amazing — a website would bring you more orders'"],
            ["Tuition / coaching post", "Just a phone number in the post", "'Parents search Google for coaching — a site puts you there'"],
            ["Restaurant promo post", "Facebook page only, no website", "'Your Google Maps listing shows 4.6 stars — claim your free website demo'"],
            ["Event decorator advertising", "Images + WhatsApp number only", "'Couples search for decorators online — your portfolio deserves a website'"],
            ["Clothing / boutique seller", "Instagram + WhatsApp shop only", "'Grow beyond Instagram — claim your website and get found on Google'"]
          ]
        }
      },
      {
        title: "Data De-Duplication — Critical Process",
        steps: [
          "Use Google Sheets' built-in search (Ctrl+F) to search for the business name before adding it.",
          "Search by phone number — the same business may appear under slightly different names on different platforms.",
          "If you find a duplicate with a different source but the same phone number, update the existing entry's 'Additional Sources' field rather than creating a new row.",
          "At the end of Day 3, use the 'Remove Duplicates' feature in Google Sheets: Data menu > Data cleanup > Remove duplicates.",
          "Cross-check by phone number as a final pass — sort the sheet by phone number column to catch duplicates."
        ]
      }
    ],
    tip: "A CRM sheet with 70 unique, verified entries is significantly more valuable than a sheet with 100 entries containing 20 duplicates. Quality is always the primary metric.",
    tasks: [
      "Expand sourcing to JustDial — search at least 3 industries in your city and log all leads with 'JustDial' as Source",
      "Search IndiaMART for your city — find B2B manufacturers and wholesalers with no standalone website",
      "Join 2-3 Facebook local business groups for your city — log businesses actively posting without a website",
      "Cross-reference and de-duplicate all data across all sources before submitting",
      "Mark source column for every entry: Google Maps / JustDial / IndiaMART / Facebook / Sulekha"
    ],
    deliverable: "40 new leads added from multi-sources. Total pipeline 70+ unique, de-duplicated leads by end of Day 3"
  },
  {
    day: 4,
    title: "WhatsApp & Email Outreach",
    focus: "First Contact Messaging & Templates",
    pdfFile: "/training-docs/Day4_WhatsApp_and_Email_Outreach.pdf",
    keyStats: [
      { label: "Day 4 Target", value: "20 Messages" },
      { label: "Primary Channel", value: "WhatsApp" },
      { label: "Response Goal", value: "3-5 Replies" },
      { label: "Log Every", value: "Attempt" }
    ],
    sections: [
      {
        title: "Cold vs. Warm Outreach",
        table: {
          headers: ["Type", "Definition", "Tone", "Expected Response Rate"],
          rows: [
            ["Cold Outreach", "First contact with someone who has never heard of ProgVision or InstaDemoX", "Friendly, non-pushy, value-led", "3-8%"],
            ["Warm Outreach", "Follow-up to someone who has already responded or shown interest", "Conversational, specific, action-oriented", "20-40%"]
          ]
        }
      },
      {
        title: "Approved WhatsApp Outreach Templates",
        templates: [
          {
            label: "TEMPLATE 1 — RESTAURANT / FOOD BUSINESS",
            text: "Hi! I came across [BUSINESS NAME] on Google Maps — your [rating] rating and [X] reviews are impressive. I'm from ProgVision Digital and we've built a free website demo for your restaurant that's already live. It has your real Google reviews, a WhatsApp order button, and your address on a map. Takes 15 seconds to see. Can I send you the demo link? 🌟"
          },
          {
            label: "TEMPLATE 2 — SALON / SPA",
            text: "Hi [BUSINESS NAME]! Your salon came up on Google Maps with a [rating] ⭐ rating. We noticed you don't have a website yet — we've already built a free demo for you using your Google reviews and details. It takes 15 seconds to show. Interested in seeing it? 💇"
          },
          {
            label: "TEMPLATE 3 — CLINIC / MEDICAL",
            text: "Hi, I'm reaching out from ProgVision Digital. I found [BUSINESS NAME] on Google Maps and saw you have a great rating with [X] patient reviews. We've created a free website demo for your clinic using your real details — it includes appointment call button and your location map. Can I share the link? 🏥"
          },
          {
            label: "TEMPLATE 4 — HOTEL / HOSPITALITY",
            text: "Hello! I'm from ProgVision Digital — we found [BUSINESS NAME] on Google Maps. We've built a free website demo for your property using your actual reviews and address. It includes a direct booking enquiry form and your location. Would you like to see it? 🏨"
          },
          {
            label: "TEMPLATE 5 — GENERIC (any other industry)",
            text: "Hi [BUSINESS NAME]! I'm from ProgVision Digital. I found your business on Google Maps and noticed you don't have a website yet. We've built a free website demo using your real Google reviews and details — it's ready to view in 15 seconds at instademox.space. Can I send you the link? ✨"
          }
        ]
      },
      {
        title: "Outreach Timing Guide",
        table: {
          headers: ["Industry", "Best WhatsApp Time", "Avoid"],
          rows: [
            ["Restaurants", "10:00 AM – 11:30 AM (before lunch rush)", "12:00 PM – 2:00 PM (peak service)"],
            ["Salons & Spas", "9:30 AM – 11:00 AM", "Weekends (fully booked)"],
            ["Medical Clinics", "8:00 AM – 9:00 AM or 5:00 PM – 6:00 PM", "10 AM – 12 PM (OPD hours)"],
            ["Hotels", "10:00 AM – 12:00 PM", "Late evenings (check-in busy)"],
            ["Retail Shops", "9:00 AM – 10:30 AM", "Fridays (weekly payments day)"],
            ["Gyms", "7:00 AM – 8:30 AM or 7:00 PM – 8:30 PM", "Morning rush hours"],
            ["Schools / Coaching", "8:30 AM – 9:00 AM or 4:00 PM – 5:00 PM", "During class hours"]
          ]
        }
      },
      {
        title: "Message Volume Guidelines",
        steps: [
          "Maximum 25 new cold outreach messages per day from a single WhatsApp number.",
          "Space messages at least 3-5 minutes apart — do not send in rapid succession.",
          "Day 4 target is 20 messages — deliberately conservative to protect your account status.",
          "Do NOT use WhatsApp Business Bulk Sender tools or automation software — these violate WhatsApp's terms and will get the number banned.",
          "If you have a business WhatsApp account, use that for outreach instead of your personal number when possible."
        ]
      }
    ],
    tip: "IMPORTANT: Do NOT improvise on Day 4 — the scripts have been tested and refined for maximum response rates. Use templates exactly as written, substituting only [BUSINESS NAME] and [CITY] placeholders. Do not add extra sentences, change the tone, or include pricing in the first message.",
    tasks: [
      "Study all 5 approved WhatsApp outreach templates — understand which template maps to which industry",
      "Select 20 HIGH priority leads from your CRM and prepare personalized messages (fill [BUSINESS NAME] and [rating])",
      "Send messages at the correct time for each industry based on the timing guide above",
      "Log every message sent in the CRM: date, time sent, message template used, and response received",
      "Do NOT send more than 25 messages in a single day — space each message 3-5 minutes apart"
    ],
    deliverable: "Minimum 20 outreach messages sent and logged in CRM with timestamps and response status"
  },
  {
    day: 5,
    title: "Objection Handling & Follow-Up",
    focus: "Converting Responses into Demos",
    pdfFile: "/training-docs/Day5_Objection_Handling_and_Follow-Up.pdf",
    keyStats: [
      { label: "Day 5 Target", value: "3 Demos" },
      { label: "Alt Target", value: "1 Meeting" },
      { label: "Follow-ups", value: "All non-replies" },
      { label: "Hot Lead Reply", value: "Within 24h" }
    ],
    sections: [
      {
        title: "What Objections Really Mean",
        table: {
          headers: ["What They Say", "What They Really Mean"],
          rows: [
            ["'I'm not interested.'", "I don't understand the value yet — explain it better"],
            ["'I already have a website.'", "I don't know why I should switch or add another"],
            ["'I don't have time right now.'", "I'm not convinced enough to make time"],
            ["'How much does it cost?'", "I'm interested but worried about the price"],
            ["'Send me more information.'", "I'm mildly interested but not ready to commit — need nurturing"],
            ["'I'll think about it.'", "I'm interested but need a gentle push or more social proof"],
            ["No response at all", "Message not read, wrong time, or too generic — try a different approach"]
          ]
        }
      },
      {
        title: "Top 5 Objection Responses — Master These",
        templates: [
          {
            label: "Objection 1: 'I already have a website.'",
            text: "\"That's great! A lot of our clients had websites too — but they found that InstaDemoX actually works alongside their existing site or replaces a slow, outdated one. Can I ask — does your current website have your real Google reviews displayed on it? And does it have a WhatsApp button? Our demo shows you what that looks like in 15 seconds. Would you be open to a quick look before deciding?\""
          },
          {
            label: "Objection 2: 'I'm not interested right now.'",
            text: "\"Completely understand — no pressure at all! I just want to make sure you've seen what we've built. Your free demo is live right now at instademox.space with your real business name and reviews. Even if you don't need it today, it takes 15 seconds to see and might be useful for the future. Would that be okay?\""
          },
          {
            label: "Objection 3: 'How much does it cost?'",
            text: "\"Great question — before I get to pricing, I want to make sure you actually see what you're getting. Our basic plan is Rs. 499/month but the Business Live plan at Rs. 999/month is what most restaurant owners go for because it includes your own domain name. But first — let me send you your free demo so you can see the quality. You'll understand the pricing much better after that. Shall I send the link?\""
          },
          {
            label: "Objection 4: 'I'll think about it.'",
            text: "\"Absolutely, take your time! One thing that might help — your demo is live right now at instademox.space. If you view it today, you can see exactly what your customers would see if they searched for your business online. Would it help if I stayed available on WhatsApp in case you have any questions while you're looking at it?\""
          },
          {
            label: "Objection 5: 'Rs. 999 is too much every month.'",
            text: "\"I completely understand — budgets are tight for every business right now. A few things to consider: most of our clients find that even one extra customer per week from their website pays for the annual subscription. Also, compare this to a freelance web designer who would charge Rs. 20,000-50,000 upfront with no ongoing support, no WhatsApp button, and no Google Maps integration. At Rs. 999/month, you get all of that with full cloud hosting included. Would the Starter plan at Rs. 499/month be a more comfortable starting point?\""
          }
        ]
      },
      {
        title: "Lead Categorisation — Hot, Warm, Cold",
        table: {
          headers: ["Category", "Definition", "Day 5 Action"],
          rows: [
            ["HOT", "Replied positively, asked for demo link, asked about pricing, or said 'yes'", "Send demo link immediately, schedule call within 24 hours"],
            ["WARM", "Message was read (blue ticks) but no reply, or replied with 'I'll think about it'", "Send a follow-up message today using the warm follow-up template"],
            ["COLD", "Message delivered but not read, or business did not respond", "Send one more message at a different time of day"],
            ["NOT INTERESTED", "Explicitly said no or asked not to be contacted again", "Mark as closed in CRM — do not contact again"],
            ["WRONG NUMBER", "Number not active or message bounced", "Search for alternative contact in Maps / JustDial"]
          ]
        }
      },
      {
        title: "The 5-Step Demo Script (via WhatsApp or Call)",
        steps: [
          "SET CONTEXT: 'I'm going to share a link — instademox.space. When you open it, type your exact business name in the search bar. It will find your Google Maps listing and generate your website in about 15 seconds.'",
          "BUILD ANTICIPATION: 'While it's generating — this is using your real Google rating, your actual customer reviews, and your business address from Google Maps. Nothing is fake or made up.'",
          "REACTION MOMENT: 'What do you see? What does it look like?' — Let them react first. Their own reaction is more powerful than any sales line you can say.",
          "HIGHLIGHT KEY FEATURES: Point out the WhatsApp button, real reviews, Google Maps widget, and 'Call Now' button. 'If a customer finds this and taps WhatsApp, they're talking to you directly.'",
          "CLOSE GENTLY: 'To keep this live permanently and add your own domain, our Business plan is Rs. 999/month — that's about Rs. 33/day. Less than a cup of chai. Want me to walk you through the setup?'"
        ]
      }
    ],
    tip: "An objection is not a rejection. In sales, an objection is a question or concern that the prospect has not yet had answered. When a business owner says 'I'm not interested', they are usually communicating a specific concern — your job is to identify and address that concern.",
    tasks: [
      "Review all Day 4 responses in CRM — categorize every contact as HOT, WARM, COLD, NOT INTERESTED, or WRONG NUMBER",
      "Send warm follow-up template to all WARM leads (read but no reply)",
      "Send re-engagement template to all COLD leads at a different time of day",
      "For HOT leads: send demo link immediately and attempt to schedule a live demo call",
      "Practice all 5 objection responses out loud — be ready to respond naturally without reading from a script"
    ],
    deliverable: "At least 3 demo conversations initiated OR 1 meeting scheduled with a genuinely interested prospect"
  },
  {
    day: 6,
    title: "Deep Scrape & City Coverage Review",
    focus: "Expanding Coverage Across Assigned City",
    pdfFile: "/training-docs/Day6_Deep_Scrape_and_City_Coverage.pdf",
    keyStats: [
      { label: "Day 6 Target", value: "100+ Leads" },
      { label: "Fill Rate", value: "70% Full" },
      { label: "Priority Flags", value: "Top 20 Leads" },
      { label: "City Coverage", value: "80%+" }
    ],
    sections: [
      {
        title: "Coverage Audit — Step by Step",
        steps: [
          "Open your CRM and create a filter showing only the 'Address' and 'Industry' columns.",
          "Group entries by neighbourhood or street name to see which areas are well-covered.",
          "Identify blank areas — neighbourhoods, markets, or zones with fewer than 5 entries.",
          "Create a list of uncovered areas to research today.",
          "Count entries by industry category — any category with fewer than 5 entries is under-represented.",
          "Prioritize uncovered geographic areas first, then fill industry gaps."
        ]
      },
      {
        title: "High-Density Commercial Areas — Research Focus",
        table: {
          headers: ["Area Type", "What to Search", "Expected Yield"],
          rows: [
            ["Main Bazaar / Old City Market", "All categories — restaurants, jewellers, clothing, services", "40-60 leads per 2 hours"],
            ["Food Street / Restaurant Row", "Restaurants, chaat stalls, sweet shops, cafes, bakeries", "25-35 leads per hour"],
            ["Medical Hub / Hospital Area", "Clinics, pharmacies, labs, dental, physiotherapy, opticians", "20-30 leads per hour"],
            ["Industrial Estate / MSME Cluster", "Manufacturers, suppliers, B2B businesses on IndiaMART", "15-20 leads per hour"],
            ["Educational Zone / College Area", "Coaching centers, stationery, hostels, cheap food joints", "20-30 leads per hour"],
            ["Shopping Mall Perimeter", "Retail, beauty, food, services in mall vicinity", "25-35 leads per hour"],
            ["Residential Township", "Local shops, clinics, home services, petrol pumps", "10-15 leads per hour"]
          ]
        }
      },
      {
        title: "The 10-Point Data Quality Checklist",
        steps: [
          "Every entry has a Business Name — no blank rows, no 'Unknown' in this field.",
          "Every phone number is in the format +91XXXXXXXXXX (10 digits after country code).",
          "Every entry has a Google rating recorded (3.0 – 5.0 scale).",
          "Every entry has a review count (minimum '0' if no reviews).",
          "Website Status is marked for every entry: No Website / Outdated / Active.",
          "WhatsApp Available is marked: Yes / No / Unknown — never blank.",
          "Priority Level is assigned: High / Medium / Low.",
          "Source column is filled for every entry: Google Maps / JustDial / Facebook / etc.",
          "No duplicate phone numbers exist in the sheet (check by sorting by phone column).",
          "Outreach status is updated for all contacted businesses from Days 4-5."
        ]
      },
      {
        title: "Priority Flag Criteria — Top 20 Leads",
        table: {
          headers: ["Priority Flag Criteria", "Why It Matters"],
          rows: [
            ["Google rating 4.0+ with 50+ reviews", "Established business with proven customer base — can afford subscription"],
            ["No website AND WhatsApp available", "Highest pain point + easiest to contact — perfect InstaDemoX candidate"],
            ["Already responded positively to outreach", "Warm lead — close to conversion with one more touchpoint"],
            ["Business in rapidly growing category", "Gyms, coaching centers, boutique hotels — high growth = high need"],
            ["B2B manufacturer on IndiaMART with no site", "International buyers require a website — strong financial motivation"]
          ]
        }
      },
      {
        title: "Advanced Scraping Techniques",
        steps: [
          "Google Maps 'Nearby' Feature: When you click on a business in Google Maps, the panel shows a 'Nearby' or 'People also search for' section — perfect for finding dense clusters of similar businesses.",
          "Google Maps Photo Exploration: Many listings have user-uploaded photos that reveal business size, quality, and investment capacity — useful for prioritization.",
          "Search Operator Combinations: Try combining terms for specific results: 'authentic biryani Tirupati', '24 hours pharmacy Vijayawada', 'AC rooms below 1000 Hyderabad'.",
          "Satellite View Strategy: Switch Google Maps to Satellite view and zoom into your assigned city at street level — you can literally see clusters of commercial buildings that don't appear in keyword searches.",
          "JustDial Category Navigation: Instead of searching by keyword, navigate JustDial by category tree to find businesses your keyword search missed."
        ]
      }
    ],
    tip: "PRO TIP — SATELLITE VIEW STRATEGY: Switch Google Maps to Satellite view and zoom into your assigned city at street level. You can literally see clusters of commercial buildings, shop fronts, and market areas that do not appear in standard keyword searches. Use this to discover uncovered commercial zones.",
    tasks: [
      "Conduct a coverage audit of your CRM — identify which neighborhoods and industries are under-represented",
      "Focus research on high-density commercial areas: bazaars, hospital zones, college areas, mall perimeters",
      "Run the 10-point data quality checklist on ALL existing CRM entries and fix any gaps",
      "Flag your top 20 most promising leads with a 'PRIORITY FLAG' marker using the criteria above",
      "Use advanced scraping techniques: satellite view, 'Nearby' feature, search operator combinations"
    ],
    deliverable: "CRM contains 100+ leads total, at least 70% fully filled entries, top 20 leads clearly priority-flagged"
  },
  {
    day: 7,
    title: "Review, Submission & Evaluation",
    focus: "Progress Assessment & Onboarding Decision",
    pdfFile: "/training-docs/Day7_Review_Submission_and_Evaluation.pdf",
    keyStats: [
      { label: "Pass Threshold", value: "60%+ Score" },
      { label: "CRM Minimum", value: "100 Leads" },
      { label: "Outreach Min.", value: "20 Messages" },
      { label: "Evaluation", value: "1-on-1 Call" }
    ],
    sections: [
      {
        title: "Day 7 Evaluation Scorecard",
        table: {
          headers: ["Metric", "Maximum Points", "Minimum to Pass"],
          rows: [
            ["Total Leads in CRM (quantity)", "25 pts", "100+ leads = 25 pts, 70-99 = 15 pts, <70 = 5 pts"],
            ["CRM Data Quality (fill rate & accuracy)", "25 pts", "90%+ fill rate = 25 pts, 70-89% = 15 pts, <70% = 5 pts"],
            ["Outreach Volume (messages sent)", "20 pts", "20+ messages = 20 pts, 10-19 = 10 pts, <10 = 0 pts"],
            ["Response Rate (replies received)", "15 pts", "5+ replies = 15 pts, 2-4 = 8 pts, 0-1 = 0 pts"],
            ["Demo Conversions (demos completed)", "10 pts", "3+ demos = 10 pts, 1-2 = 5 pts, 0 = 0 pts"],
            ["Priority Flagging (top 20 leads marked)", "5 pts", "All 20 flagged with criteria = 5 pts, partial = 2 pts"]
          ]
        }
      },
      {
        title: "Final Training Report — Required Sections",
        steps: [
          "Total leads in CRM (breakdown by source: Google Maps / JustDial / Facebook / IndiaMART / Other)",
          "Total outreach messages sent (breakdown by template used and industry targeted)",
          "Total replies received (breakdown by category: HOT / WARM / COLD / NOT INTERESTED / WRONG NUMBER)",
          "Demos completed or meetings scheduled (business names, dates, outcomes)",
          "Top 5 most promising leads with reasons why they are priority candidates",
          "Key learnings from the week — what worked, what didn't, what you would do differently"
        ]
      },
      {
        title: "Evaluation Criteria — Full Details",
        table: {
          headers: ["Evaluation Area", "What the Supervisor Looks For"],
          rows: [
            ["CRM Completeness", "Are all required fields filled? Are there duplicates? Is the data accurate and consistently formatted?"],
            ["Outreach Quality", "Were approved templates used correctly? Was timing followed? Were messages spaced appropriately?"],
            ["Response Handling", "Were HOT leads followed up immediately? Were WARM leads nurtured? Were objections handled correctly?"],
            ["Product Knowledge", "Can you explain InstaDemoX clearly? Do you know all 3 pricing tiers and when to recommend each?"],
            ["Initiative & Attitude", "Did you go beyond the minimum targets? Did you ask questions? Did you engage with the team?"]
          ]
        }
      },
      {
        title: "Post-Training Outcomes",
        steps: [
          "Candidates achieving 60%+ overall score are confirmed for full onboarding into the ProgVision sales team.",
          "Training compensation is credited as part of Month 1 salary — typically processed within 7 business days after submission.",
          "Candidates who do not reach 60% but show strong effort may be offered an extended onboarding period at supervisor discretion.",
          "Your CRM data is handed over to the permanent outreach team — priority flagged leads will be followed up by senior BDEs.",
          "Top performers (80%+ score) may be considered for accelerated promotion to senior team roles."
        ]
      }
    ],
    tip: "EVALUATION TIP: The supervisor reviews your CRM data quality as carefully as the quantity. 100 perfectly filled entries with accurate data scores higher than 150 entries with missing fields and duplicates. Focus on accuracy over volume.",
    tasks: [
      "Final review of ALL CRM data — fix every missing field, remove duplicates, verify phone number format",
      "Complete final outreach report: total leads scraped, outreach attempts, responses, meetings scheduled, demos done",
      "Confirm top 20 priority leads are clearly flagged with notes explaining why each was selected",
      "Prepare for one-on-one review call with training supervisor — review the evaluation scorecard above",
      "Submit consolidated training report to supervisor by end of day"
    ],
    deliverable: "Final training report submitted to supervisor. Minimum 60% score achieved for full onboarding confirmation"
  }
];


export default function CandidateDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Check-In");
  const [toast, setToast] = useState(null);

  // States for Change Password
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  // States for Check-in tab
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkedOutToday, setCheckedOutToday] = useState(false);
  const [todayCheckinTime, setTodayCheckinTime] = useState("");
  const [todayCheckoutTime, setTodayCheckoutTime] = useState("");
  const [todayDuration, setTodayDuration] = useState(null); // in minutes
  const [liveSeconds, setLiveSeconds] = useState(0); // live elapsed seconds
  const [checkinsList, setCheckinsList] = useState([]);
  const [loadingCheckins, setLoadingCheckins] = useState(true);

  // States for Training tab
  const [selectedDay, setSelectedDay] = useState(null);

  // States for Lead Submission (Client CRM)
  const [leadsList, setLeadsList] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadFilter, setLeadFilter] = useState("All");
  const [leadForm, setLeadForm] = useState({
    clientName: "",
    contactPerson: "",
    phoneOrEmail: "",
    responseStatus: "Interested",
    comments: ""
  });
  const [submittingLead, setSubmittingLead] = useState(false);

  // Additional States for Collaborative CRM
  const [allLeadsList, setAllLeadsList] = useState([]);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [responseForm, setResponseForm] = useState({
    responseStatus: "Interested",
    comments: ""
  });
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // States for Profile Tab
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
    city: "",
    address: "",
    email: "",
    panNo: "",
    aadharNo: "",
    class10: "",
    class12: "",
    degree: "",
    experience: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [requestingEdit, setRequestingEdit] = useState(false);

  const calculateProfileCompletion = (prof) => {
    if (!prof) return 0;
    const requiredFields = [
      'name', 'phone', 'city', 'address', 'email', 
      'panNo', 'aadharNo', 'class10', 'class12', 'degree', 
      'experience', 'bankName', 'accountHolderName', 'accountNumber', 'ifscCode'
    ];
    let filled = 0;
    requiredFields.forEach(f => {
      if (prof[f] && typeof prof[f] === 'string' && prof[f].trim() !== "") filled++;
    });
    return Math.round((filled / requiredFields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(profile);
  const isProfileComplete = profileCompletion === 100;

  // Force active tab to Edit Profile if not complete
  useEffect(() => {
    if (profile && !isProfileComplete && activeTab !== "Edit Profile") {
      setActiveTab("Edit Profile");
      showToast("Please complete your profile to 100% to unlock the portal.", "error");
    }
  }, [profile, isProfileComplete, activeTab]);

  // Load user session on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (isAdminSession()) {
      router.push("/admin");
      return;
    }

    const currentSession = getSession();
    setSession(currentSession);
    fetchUserProfile(currentSession.userId);
  }, [router]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUserProfile = async (userId) => {
    try {
      const data = await getUserProfile(userId);
      if (data) {
        setProfile(data);
        setEditProfileForm({
          name: data.name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          city: data.city || "",
          bankName: data.bankName || "",
          accountHolderName: data.accountHolderName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
          address: data.address || "",
          email: data.email || "",
          panNo: data.panNo || "",
          aadharNo: data.aadharNo || "",
          class10: data.class10 || "",
          class12: data.class12 || "",
          degree: data.degree || "",
          experience: data.experience || ""
        });
        
        // Fetch checkins and leads
        loadCheckins(userId);
        loadLeads(userId, data.role);
        loadEditRequestStatus(userId);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch profile details", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await updateUserPassword(session.userId, passwordForm.newPassword);
      showToast("Password updated successfully!", "success");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      showToast("Failed to update password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const loadCheckins = async (userId) => {
    try {
      setLoadingCheckins(true);
      const list = await getUserCheckins(userId);
      setCheckinsList(list);

      // Check if already checked in / checked out today
      const today = await getTodayCheckin(userId);
      if (today) {
        setCheckedInToday(true);
        setTodayCheckinTime(new Date(today.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (today.checkoutTimestamp) {
          setCheckedOutToday(true);
          setTodayCheckoutTime(new Date(today.checkoutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setTodayDuration(today.durationMinutes);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCheckins(false);
    }
  };

  const loadLeads = async (userId, userRole) => {
    try {
      setLoadingLeads(true);
      const isLeadGen = userRole === "Lead Generation Specialist";
      if (isLeadGen) {
        const list = await getUserLeads(userId);
        setLeadsList(list);
      } else {
        const list = await getAllLeads();
        setAllLeadsList(list);
        
        const ownList = await getUserLeads(userId);
        setLeadsList(ownList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const loadEditRequestStatus = async (userId) => {
    try {
      const req = await getEditRequest(userId);
      setEditRequest(req);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  // Live duration ticker while checked in but not yet checked out
  useEffect(() => {
    if (!checkedInToday || checkedOutToday || !todayCheckinTime) return;
    const interval = setInterval(() => {
      const checkinDate = checkinsList.find(c => c.date === new Date().toISOString().split('T')[0]);
      if (checkinDate?.timestamp) {
        const elapsed = Math.floor((Date.now() - new Date(checkinDate.timestamp).getTime()) / 1000);
        setLiveSeconds(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [checkedInToday, checkedOutToday, todayCheckinTime, checkinsList]);

  const formatDuration = (totalMinutes) => {
    if (totalMinutes == null) return '—';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatLiveDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  // CHECK IN ACTION
  const handleCheckIn = async () => {
    if (checkedInToday) return;
    try {
      const res = await checkInToday(session.userId, session);
      setCheckedInToday(true);
      setTodayCheckinTime(new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      loadCheckins(session.userId);
      showToast("✅ Checked in successfully for today!");
    } catch (err) {
      console.error(err);
      showToast("Check-in failed. Please try again.", "error");
    }
  };

  // CHECK OUT ACTION
  const handleCheckOut = async () => {
    if (!checkedInToday || checkedOutToday) return;
    try {
      const res = await checkOutToday(session.userId);
      if (res) {
        setCheckedOutToday(true);
        setTodayCheckoutTime(new Date(res.checkoutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setTodayDuration(res.durationMinutes);
        loadCheckins(session.userId);
        showToast(`✅ Checked out! Duration: ${formatDuration(res.durationMinutes)}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Check-out failed. Please try again.", "error");
    }
  };

  // Helper: POST lead data to Google Form (fire-and-forget, CORS no-cors mode)
  const postToGoogleForm = (leadData, sessionData) => {
    const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLScF3dqnv0B-8KYLN1F-9o7K4kCT4DX_02uVzCG80rhzGRNHBQ/formResponse";
    const formBody = new URLSearchParams({
      "entry.299551197": leadData.clientName || "",
      "entry.580246169": leadData.contactPerson || "",
      "entry.1003037636": leadData.responseStatus || "Interested",
      "entry.36540988": "Other",
      "entry.1364959560": leadData.phoneOrEmail || "",
      "entry.128714681": sessionData?.email || "",
      "entry.1440277967": `${leadData.comments || ""} | Submitted by: ${sessionData?.name || ""} (${sessionData?.role || ""}, ${sessionData?.city || ""})`
    });
    // no-cors: response is opaque but form will receive the data
    fetch(FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString()
    }).catch(() => {}); // silently ignore CORS/network issues
  };

  // SUBMIT LEAD ACTION
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.clientName.trim() || !leadForm.phoneOrEmail.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSubmittingLead(true);
    try {
      // If Lead Gen Specialist (scraper), responseStatus defaults to "Maybe"
      const isLeadGen = profile.role === "Lead Generation Specialist";
      const finalLeadData = {
        ...leadForm,
        responseStatus: isLeadGen ? "Maybe" : leadForm.responseStatus
      };

      // Save to Firestore
      await submitLead(session.userId, session, finalLeadData);

      // Also post to Google Form (Client Interaction Log)
      postToGoogleForm(finalLeadData, session);

      showToast("Lead logged successfully!");
      setLeadForm({
        clientName: "",
        contactPerson: "",
        phoneOrEmail: "",
        responseStatus: "Interested",
        comments: ""
      });
      loadLeads(session.userId, profile.role);
    } catch (err) {
      console.error(err);
      showToast("Failed to submit lead", "error");
    } finally {
      setSubmittingLead(false);
    }
  };

  // UPDATE LEAD RESPONSE ACTION
  const handleUpdateResponseSubmit = async (e) => {
    e.preventDefault();
    if (!updatingLeadId) return;

    setActionInProgress(true);
    try {
      await updateLeadResponse(updatingLeadId, session.userId, session.name, responseForm);
      showToast("Client response updated successfully!");
      setIsResponseModalOpen(false);
      setUpdatingLeadId(null);
      setResponseForm({ responseStatus: "Interested", comments: "" });
      loadLeads(session.userId, profile.role);
    } catch (err) {
      console.error(err);
      showToast("Failed to update client response", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  // SAVE PROFILE ACTION
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!editProfileForm.name.trim() || !editProfileForm.city.trim() || !editProfileForm.phone.trim()) {
      showToast("Please fill in Name, Phone and City", "error");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateProfile(session.userId, editProfileForm);
      setProfile((prev) => ({ ...prev, ...updated }));
      
      // Update session storage details in local storage too
      saveSession({
        ...session,
        name: updated.name,
        city: updated.city,
        phone: updated.phone
      });
      setSession(getSession());
      showToast("Profile saved and locked successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // REQUEST EDIT ACTION
  const handleRequestEdit = async () => {
    setRequestingEdit(true);
    try {
      const res = await requestEditAccess(session.userId, session.name, session.role, session.city);
      setEditRequest(res);
      showToast("Edit request submitted to admin!");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit request", "error");
    } finally {
      setRequestingEdit(false);
    }
  };

  if (!session || !profile) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Filtered Leads
  const filteredLeads = leadsList.filter((lead) => {
    if (leadFilter === "All") return true;
    return lead.responseStatus === leadFilter;
  });

  // Training day unlock logic: each day unlocks 12 hours after the previous
  // Day 1 is available immediately, Day 2 after 12h, Day 3 after 24h, etc.
  const getMaxUnlockedDay = () => {
    if (!profile.createdAt) return 1; // fallback: only day 1
    const createdMs = new Date(profile.createdAt).getTime();
    const nowMs = Date.now();
    const elapsedHours = (nowMs - createdMs) / (1000 * 60 * 60);
    const unlockedDay = Math.floor(elapsedHours / 12) + 1;
    return Math.min(unlockedDay, 7);
  };

  const maxUnlockedDay = getMaxUnlockedDay();

  const getTimeUntilNextUnlock = () => {
    if (maxUnlockedDay >= 7) return null;
    if (!profile.createdAt) return null;
    const createdMs = new Date(profile.createdAt).getTime();
    const nextUnlockMs = createdMs + (maxUnlockedDay * 12 * 60 * 60 * 1000);
    const remainMs = nextUnlockMs - Date.now();
    if (remainMs <= 0) return null;
    const hours = Math.floor(remainMs / (1000 * 60 * 60));
    const mins = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const nextUnlockCountdown = getTimeUntilNextUnlock();

  return (
    <div className="min-h-screen bg-[#0B1220] text-white pt-24 pb-12 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[60] max-w-xs px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-2 transition-all duration-300 ${
          toast.type === "success" ? "bg-green-900/90 text-green-300 border-green-600/50 backdrop-blur-md" :
          toast.type === "error"   ? "bg-red-900/90 text-red-300 border-red-600/50 backdrop-blur-md" :
          "bg-blue-900/90 text-blue-300 border-blue-600/50 backdrop-blur-md"
        }`}>
          <span className="text-sm font-medium leading-snug">{toast.message}</span>
        </div>
      )}

      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#0B1220]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/images/logo.jpeg" alt="ProgVision Logo" className="h-8 w-auto rounded object-contain" />
          <span className="hidden md:inline-block w-[1px] h-6 bg-white/20" />
          <span className="hidden md:inline-block text-xs uppercase tracking-widest text-blue-400 font-bold">
            Candidate Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <h4 className="text-sm font-semibold text-white">{profile.name}</h4>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mt-0.5">
              {profile.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 md:px-6">
        {/* TABS SELECTOR */}
        <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar mb-8 scroll-smooth">
          {["Check-In", "My Role & Training", "Client CRM", "Edit Profile"].map((tab) => {
            const isLocked = !isProfileComplete && tab !== "Edit Profile";
            return (
              <button
                key={tab}
                onClick={() => {
                  if (isLocked) {
                    showToast("Please complete your profile to 100% to unlock this tab.", "error");
                    return;
                  }
                  setActiveTab(tab);
                  // If switching back to profile, re-fetch from db to get latest admin approvals
                  if (tab === "Edit Profile") {
                    fetchUserProfile(session.userId);
                  }
                }}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer relative pr-8 ${
                  activeTab === tab
                    ? "border-blue-500 text-white"
                    : isLocked
                    ? "border-transparent text-slate-600 opacity-60 cursor-not-allowed"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "Check-In" && <Clock className="w-4 h-4 inline-block mr-2 -mt-0.5" />}
                {tab === "My Role & Training" && <FileText className="w-4 h-4 inline-block mr-2 -mt-0.5" />}
                {tab === "Client CRM" && <ClipboardList className="w-4 h-4 inline-block mr-2 -mt-0.5" />}
                {tab === "Edit Profile" && <User className="w-4 h-4 inline-block mr-2 -mt-0.5" />}
                {tab}
                {isLocked && <Lock className="w-3 h-3 absolute top-4 right-2 text-slate-500 opacity-70" />}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div>
          {/* ==================== TAB 1: CHECK-IN HUB ==================== */}
          {activeTab === "Check-In" && (
            <div className="space-y-6">

              {/* ── Today's Attendance Card ── */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Daily Attendance</span>
                    <h2 className="text-lg font-bold mt-0.5">
                      {new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black font-mono text-white tabular-nums">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Current Time</p>
                  </div>
                </div>

                {/* Status row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Check-In Time */}
                  <div className={`rounded-xl p-4 border ${ checkedInToday ? 'bg-green-500/10 border-green-500/25' : 'bg-white/[0.03] border-white/10' }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Check-In</p>
                    <p className={`text-xl font-black font-mono ${ checkedInToday ? 'text-green-400' : 'text-slate-600' }`}>
                      {checkedInToday ? todayCheckinTime : '—:——'}
                    </p>
                    {checkedInToday && <p className="text-[10px] text-green-600 mt-0.5">✓ Logged</p>}
                  </div>

                  {/* Check-Out Time */}
                  <div className={`rounded-xl p-4 border ${ checkedOutToday ? 'bg-red-500/10 border-red-500/25' : 'bg-white/[0.03] border-white/10' }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Check-Out</p>
                    <p className={`text-xl font-black font-mono ${ checkedOutToday ? 'text-red-400' : 'text-slate-600' }`}>
                      {checkedOutToday ? todayCheckoutTime : '—:——'}
                    </p>
                    {checkedOutToday && <p className="text-[10px] text-red-500 mt-0.5">✓ Logged</p>}
                  </div>

                  {/* Duration */}
                  <div className={`rounded-xl p-4 border ${ (checkedInToday && !checkedOutToday) ? 'bg-blue-500/10 border-blue-500/25' : checkedOutToday ? 'bg-purple-500/10 border-purple-500/25' : 'bg-white/[0.03] border-white/10' }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Duration</p>
                    <p className={`text-xl font-black font-mono ${ checkedOutToday ? 'text-purple-400' : checkedInToday ? 'text-blue-400' : 'text-slate-600' }`}>
                      {checkedOutToday
                        ? formatDuration(todayDuration)
                        : checkedInToday
                        ? formatLiveDuration(liveSeconds)
                        : '—'}
                    </p>
                    {checkedInToday && !checkedOutToday && <p className="text-[10px] text-blue-500 mt-0.5 animate-pulse">● Live</p>}
                    {checkedOutToday && <p className="text-[10px] text-purple-500 mt-0.5">Total session</p>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {/* Check-In Button */}
                  <button
                    onClick={handleCheckIn}
                    disabled={checkedInToday}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      checkedInToday
                        ? 'bg-green-500/10 border border-green-500/25 text-green-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {checkedInToday ? `Checked In · ${todayCheckinTime}` : 'Check In'}
                  </button>

                  {/* Check-Out Button */}
                  <button
                    onClick={handleCheckOut}
                    disabled={!checkedInToday || checkedOutToday}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      checkedOutToday
                        ? 'bg-red-500/10 border border-red-500/25 text-red-400 cursor-not-allowed'
                        : checkedInToday
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 cursor-pointer active:scale-[0.98]'
                        : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {checkedOutToday ? `Checked Out · ${todayCheckoutTime}` : 'Check Out'}
                  </button>
                </div>

                {checkedInToday && !checkedOutToday && (
                  <p className="text-center text-xs text-slate-500 mt-3">Don't forget to check out at the end of your session.</p>
                )}
              </div>

              {/* ── Attendance History Table ── */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" /> Attendance History
                </h3>

                {loadingCheckins ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                ) : checkinsList.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No check-ins yet. Make your first check-in above!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <th className="pb-3 text-left">Date</th>
                          <th className="pb-3 text-left">Day</th>
                          <th className="pb-3 text-center">Check-In</th>
                          <th className="pb-3 text-center">Check-Out</th>
                          <th className="pb-3 text-center">Duration</th>
                          <th className="pb-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {checkinsList.map((item) => {
                          const isCheckedOut = !!item.checkoutTimestamp;
                          return (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 pr-4">
                                <p className="font-bold text-white text-xs">
                                  {new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </td>
                              <td className="py-3.5 pr-4">
                                <p className="text-slate-400 text-xs">
                                  {new Date(item.timestamp).toLocaleDateString([], { weekday: 'long' })}
                                </p>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {isCheckedOut ? (
                                  <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                    {new Date(item.checkoutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 text-xs">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {isCheckedOut ? (
                                  <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    {formatDuration(item.durationMinutes)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 text-xs">—</span>
                                )}
                              </td>
                              <td className="py-3.5 pl-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  isCheckedOut
                                    ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {isCheckedOut ? 'Complete' : 'In Progress'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: MY ROLE & TRAINING ==================== */}
          {activeTab === "My Role & Training" && (
            <div className="space-y-8">
              {/* Role Overview */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold block mb-2">My Assigned Role</span>
                <h2 className="text-2xl font-black text-white mb-4">{profile.role}</h2>
                
                {jobDetailsData[profile.role] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Role Overview</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{jobDetailsData[profile.role].overview}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Key Target</h4>
                        <p className="text-slate-300 text-sm font-semibold">{jobDetailsData[profile.role].target}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Compensation</h4>
                        <p className="text-orange-400 text-sm font-bold">{jobDetailsData[profile.role].compensation}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Responsibilities</h4>
                      <ul className="space-y-2">
                        {jobDetailsData[profile.role].responsibilities.map((resp, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Role details currently unavailable.</p>
                )}
              </div>

              {/* Documents Library */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Documents Library
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {trainingData.map((t) => (
                    <a
                      key={`doc-${t.day}`}
                      href={t.pdfFile}
                      download
                      className="p-3 bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 rounded-xl transition-all group flex flex-col items-center justify-center text-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-300">Day {t.day}</p>
                        <p className="text-[9px] text-slate-500 line-clamp-1">{t.title}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Training Schedule */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">7-Day Onboarding Training</span>
                  {nextUnlockCountdown && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Day {maxUnlockedDay + 1} unlocks in {nextUnlockCountdown}
                    </span>
                  )}
                  {maxUnlockedDay >= 7 && (
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> All days unlocked
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
                  {trainingData.map((t) => {
                    const isUnlocked = t.day <= maxUnlockedDay;
                    return (
                      <button
                        key={t.day}
                        onClick={() => {
                          if (isUnlocked) setSelectedDay(t.day);
                          else showToast(`Day ${t.day} is locked. Complete previous days first.`, "error");
                        }}
                        className={`p-4 rounded-xl border text-center transition-all relative ${
                          !isUnlocked
                            ? "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed opacity-60"
                            : selectedDay === t.day
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.03] cursor-pointer"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white cursor-pointer"
                        }`}
                      >
                        {!isUnlocked && (
                          <Lock className="w-3.5 h-3.5 absolute top-2 right-2 text-slate-600" />
                        )}
                        {isUnlocked && t.day <= maxUnlockedDay && selectedDay !== t.day && (
                          <CheckCircle2 className="w-3.5 h-3.5 absolute top-2 right-2 text-green-500/50" />
                        )}
                        <h4 className="text-sm font-bold font-mono">Day</h4>
                        <span className="text-2xl font-black">{t.day}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Day Expanded Details */}
                {selectedDay !== null && selectedDay <= maxUnlockedDay ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md animate-fadeIn">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10 mb-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                          Training Day {selectedDay}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-white">{trainingData[selectedDay - 1].title}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          Focus: <span className="text-slate-200 font-semibold">{trainingData[selectedDay - 1].focus}</span>
                        </p>
                      </div>
                      {trainingData[selectedDay - 1].pdfFile && (
                        <a
                          href={trainingData[selectedDay - 1].pdfFile}
                          download
                          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.97]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </a>
                      )}
                    </div>

                    {/* Key Stats Bar */}
                    {trainingData[selectedDay - 1].keyStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {trainingData[selectedDay - 1].keyStats.map((stat, i) => (
                          <div key={i} className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 text-center">
                            <p className="text-lg font-black text-blue-400 font-mono">{stat.value}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sections */}
                    <div className="space-y-5 mb-6">
                      {(trainingData[selectedDay - 1].sections || []).map((section, si) => (
                        <div key={si} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[8px] text-blue-400 font-mono shrink-0">{si + 1}</span>
                            {section.title}
                          </h4>

                          {/* Plain content */}
                          {section.content && (
                            <p className="text-slate-300 text-sm leading-relaxed">{section.content}</p>
                          )}

                          {/* Numbered steps */}
                          {section.steps && (
                            <ol className="space-y-2">
                              {section.steps.map((step, idx) => (
                                <li key={idx} className="text-slate-300 text-sm flex items-start gap-2.5 leading-relaxed">
                                  <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-mono mt-0.5 shrink-0 font-bold">{idx + 1}</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}

                          {/* Table */}
                          {section.table && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    {section.table.headers.map((h, hi) => (
                                      <th key={hi} className="pb-2 pr-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {section.table.rows.map((row, ri) => (
                                    <tr key={ri} className="hover:bg-white/[0.02]">
                                      {row.map((cell, ci) => (
                                        <td key={ci} className={`py-2.5 pr-3 text-xs leading-relaxed ${ci === 0 ? 'font-bold text-white' : 'text-slate-400'}`}>{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Message Templates */}
                          {section.templates && (
                            <div className="space-y-3">
                              {section.templates.map((tmpl, ti) => (
                                <div key={ti} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">{tmpl.label}</p>
                                  <p className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap">{tmpl.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip */}
                    {trainingData[selectedDay - 1].tip && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">💡 Pro Tip</h5>
                        <p className="text-amber-100/80 text-xs leading-relaxed">{trainingData[selectedDay - 1].tip}</p>
                      </div>
                    )}

                    {/* Daily Tasks */}
                    <div className="mb-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Tasks</h4>
                      <ul className="space-y-2.5">
                        {trainingData[selectedDay - 1].tasks.map((task, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-start gap-2.5 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[10px] text-green-400 font-mono mt-0.5 shrink-0 font-bold">{idx + 1}</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverable */}
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <h5 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">🎯 Expected Deliverable</h5>
                      <p className="text-slate-300 text-sm font-semibold">{trainingData[selectedDay - 1].deliverable}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-sm backdrop-blur-md">
                    Click a Day card above to view the training program schedule, materials, and tasks.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: CLIENT CRM (LEAD SUBMISSION) ==================== */}
          {activeTab === "Client CRM" && (
            <div className="space-y-8 animate-fadeIn">
              {/* GOOGLE FORM SUBMISSION BANNER */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 backdrop-blur-md">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                    Google Form CRM Link
                  </h4>
                  <p className="text-xs text-slate-400">
                    Submit your primary outreach leads to the official Google Form.
                  </p>
                </div>
                <a
                  href="https://forms.gle/66gQSVbov9rPV4d4A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/15 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  Open Google Form <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Form Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold mb-4">
                  {profile.role === "Lead Generation Specialist" ? "Scrape & Feed New Lead" : "Log a Custom Lead"}
                </h3>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Business Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Client / Business Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="e.g. Acme Restaurant"
                        value={leadForm.clientName}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, clientName: e.target.value }))}
                      />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Person</label>
                      <input
                        type="text"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="e.g. John Manager"
                        value={leadForm.contactPerson}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, contactPerson: e.target.value }))}
                      />
                    </div>

                    {/* Phone/Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone or Email *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="e.g. +91 98765 XXXXX or manager@acme.com"
                        value={leadForm.phoneOrEmail}
                        onChange={(e) => setLeadForm((prev) => ({ ...prev, phoneOrEmail: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Render Response Fields only if user is NOT a Lead Generation Specialist */}
                  {profile.role !== "Lead Generation Specialist" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Status Dropdown */}
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Status</label>
                        <div className="relative">
                          <select
                            className="w-full bg-[#182030] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm appearance-none cursor-pointer"
                            value={leadForm.responseStatus}
                            onChange={(e) => setLeadForm((prev) => ({ ...prev, responseStatus: e.target.value }))}
                          >
                            <option value="Interested" className="bg-[#0B1220] text-green-400">Interested</option>
                            <option value="Maybe" className="bg-[#0B1220] text-amber-400">Maybe</option>
                            <option value="Not Interested" className="bg-[#0B1220] text-red-400">Not Interested</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="space-y-1.5 md:col-span-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Comments / Conversation Summary</label>
                        <textarea
                          rows={3}
                          className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm resize-none"
                          placeholder="Enter conversation highlights, client needs, or scheduling info..."
                          value={leadForm.comments}
                          onChange={(e) => setLeadForm((prev) => ({ ...prev, comments: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75 disabled:hover:scale-100"
                    >
                      {submittingLead ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        profile.role === "Lead Generation Specialist" ? "Scrape & Save" : "Submit Lead"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Leads Table */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">
                      {profile.role === "Lead Generation Specialist" ? "Leads You Scraped" : "Shared Pipeline Leads"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {profile.role === "Lead Generation Specialist" ? `${leadsList.length} leads logged` : `${allLeadsList.length} total shared leads in queue`}
                    </p>
                  </div>

                  {/* Filter pills */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {["All", "Interested", "Maybe", "Not Interested"].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setLeadFilter(pill)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                          leadFilter === pill
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
                        }`}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingLeads ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : (profile.role === "Lead Generation Specialist" ? filteredLeads : allLeadsList.filter(l => leadFilter === "All" || l.responseStatus === leadFilter)).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                    <p className="text-slate-500 text-sm">No leads match this filter status.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3.5 pr-4">Business Name</th>
                          <th className="pb-3.5 px-4">Contact Details</th>
                          <th className="pb-3.5 px-4 text-center">Status</th>
                          <th className="pb-3.5 px-4">Comments</th>
                          {profile.role !== "Lead Generation Specialist" && <th className="pb-3.5 px-4">Scraped By</th>}
                          <th className="pb-3.5 pl-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(profile.role === "Lead Generation Specialist" ? filteredLeads : allLeadsList.filter(l => leadFilter === "All" || l.responseStatus === leadFilter)).map((lead) => {
                          const isScraperRole = profile.role === "Lead Generation Specialist";
                          return (
                            <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-4 pr-4 font-bold text-white max-w-[150px] truncate">{lead.clientName}</td>
                              <td className="py-4 px-4 text-slate-300 max-w-[180px] truncate">
                                <span className="block font-medium">{lead.contactPerson || "—"}</span>
                                <span className="block text-xs text-slate-500 font-mono mt-0.5">{lead.phoneOrEmail}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                                  lead.responseStatus === "Interested"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : lead.responseStatus === "Maybe"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                  {lead.responseStatus}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-400 max-w-[200px] truncate" title={lead.comments}>
                                {lead.comments || <span className="text-slate-600 font-mono">—</span>}
                                {lead.respondedByName && (
                                  <span className="block text-[10px] text-slate-500 mt-1 font-semibold">
                                    ✓ Followed up by: {lead.respondedByName}
                                  </span>
                                )}
                              </td>
                              {!isScraperRole && (
                                <td className="py-4 px-4 text-slate-400 text-xs font-mono max-w-[100px] truncate" title={lead.userName}>
                                  {lead.userName || "Admin"}
                                </td>
                              )}
                              <td className="py-4 pl-4 text-right">
                                {!isScraperRole ? (
                                  <button
                                    onClick={() => {
                                      setUpdatingLeadId(lead.id);
                                      setResponseForm({
                                        responseStatus: lead.responseStatus || "Interested",
                                        comments: lead.comments || ""
                                      });
                                      setIsResponseModalOpen(true);
                                    }}
                                    className="px-3.5 py-2 bg-blue-600/10 border border-blue-500/25 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold text-blue-400 transition-all cursor-pointer"
                                  >
                                    Update Response
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500 font-mono">
                                    {new Date(lead.submittedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: EDIT PROFILE ==================== */}
          {activeTab === "Edit Profile" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                
                {/* Progress Bar & Header */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {isProfileComplete ? "Candidate Profile" : "Complete Your Profile"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isProfileComplete 
                          ? "Your profile is 100% complete. You can update your details below." 
                          : "You must complete all required fields to unlock the dashboard and training."}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-400">{profileCompletion}%</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Complete</span>
                    </div>
                  </div>
                  
                  {/* Progress Track */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isProfileComplete ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                {/* EDITABLE FORM */}
                <form onSubmit={handleProfileSave} className="space-y-8">
                  
                  {/* SECTION 1: Personal Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-white/5 pb-2">1. Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.name} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email ID *</label>
                        <input required type="email" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.email} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, email: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number *</label>
                        <input required type="tel" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.phone} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned City *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.city} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, city: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Address *</label>
                        <textarea required rows={2} className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none" value={editProfileForm.address} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, address: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Identity Documents */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-white/5 pb-2">2. Identity Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">PAN Number *</label>
                        <input required type="text" placeholder="e.g. ABCDE1234F" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none uppercase" value={editProfileForm.panNo} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, panNo: e.target.value.toUpperCase() }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Aadhar Number *</label>
                        <input required type="text" placeholder="12-digit number" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.aadharNo} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, aadharNo: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Educational & Professional Background */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-white/5 pb-2">3. Education & Experience</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">10th Class (School/Percentage) *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.class10} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, class10: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">12th Class (College/Percentage) *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.class12} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, class12: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Degree (University/Course/Percentage) *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.degree} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, degree: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Previous Experience *</label>
                        <textarea required rows={2} placeholder="List companies, roles, or 'Fresher'" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none" value={editProfileForm.experience} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, experience: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Bank Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-white/5 pb-2">4. Bank Account Details (Payouts)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Holder Name *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.accountHolderName} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, accountHolderName: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Bank Name *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.bankName} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, bankName: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Number *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={editProfileForm.accountNumber} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, accountNumber: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">IFSC Code *</label>
                        <input required type="text" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none uppercase" value={editProfileForm.ifscCode} onChange={(e) => setEditProfileForm((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50 w-full md:w-auto justify-center"
                    >
                      {savingProfile ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Save & Update Profile"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Section */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mt-6">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white">Change Password</h3>
                  <p className="text-xs text-slate-400 mt-1">Update your login password from the temporary one provided.</p>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                      <input required type="password" minLength={6} className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                      <input required type="password" minLength={6} className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ==================== COLLABORATIVE RESPONSE DIALOG MODAL ==================== */}
      {isResponseModalOpen && updatingLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          {/* Overlay */}
          <div
            onClick={() => {
              setIsResponseModalOpen(false);
              setUpdatingLeadId(null);
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-[#111927] border border-white/10 rounded-2xl p-6 sm:p-8 z-10 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Log Client Response</h3>
              <p className="text-xs text-slate-400 mt-1">
                Update status and comments for: <span className="font-bold text-blue-400">
                  {allLeadsList.find(l => l.id === updatingLeadId)?.clientName || "this lead"}
                </span>
              </p>
            </div>
            
            <form onSubmit={handleUpdateResponseSubmit} className="space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Status</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#182030] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm appearance-none cursor-pointer"
                    value={responseForm.responseStatus}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, responseStatus: e.target.value }))}
                  >
                    <option value="Interested" className="bg-[#0B1220] text-green-400">Interested</option>
                    <option value="Maybe" className="bg-[#0B1220] text-amber-400">Maybe</option>
                    <option value="Not Interested" className="bg-[#0B1220] text-red-400">Not Interested</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Outreach Comments</label>
                <textarea
                  rows={4}
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="e.g. Spoke to owner, scheduled live demo for next Tuesday at 4 PM..."
                  value={responseForm.comments}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsResponseModalOpen(false);
                    setUpdatingLeadId(null);
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

