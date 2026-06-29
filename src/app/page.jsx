"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Calendar, Award, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Terminal } from "lucide-react";
import { isAuthenticated, isAdminSession } from "@/lib/portalAuth";

const rolesData = [
  {
    title: "Sales Intern",
    type: "Internship",
    location: "Remote",
    overview: "Support the BDE team, manage client follow-ups, and help automate lead pipeline tracking while gaining hands-on corporate sales exposure.",
    target: "Support BDE team and reduce manual follow-ups",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum"
  },
  {
    title: "Business Development Executive (BDE)",
    type: "Full-time",
    location: "Hybrid / Remote",
    overview: "Identify potential clients, execute targeted outreach campaigns, and schedule strategic meetings with prospective leads.",
    target: "Generate qualified leads",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum"
  },
  {
    title: "Business Development Associate (BDA)",
    type: "Full-time",
    location: "Remote / Hybrid",
    overview: "Close incoming business opportunities, discuss proposals with clients, and upsell premium services once leads are established.",
    target: "Convert opportunities into revenue",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum"
  },
  {
    title: "Lead Generation Specialist",
    type: "Full-time",
    location: "Remote",
    overview: "Build databases of high-quality prospects and research target companies requiring website, app, cybersecurity, or marketing solutions.",
    target: "Keep the sales pipeline full",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum"
  },
  {
    title: "Digital Marketer",
    type: "Full-time",
    location: "Remote",
    overview: "Execute digital marketing strategies and help manage social media profiles. Bring fresh, creative campaign ideas.",
    target: "Build brand presence and generate inbound leads",
    compensation: "Rs. 3,00,000 – Rs. 6,00,000 per annum"
  }
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      setIsAdmin(isAdminSession());
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* HEADER NAVBAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo.jpeg"
            alt="ProgVision Logo"
            className="h-10 w-auto rounded-lg group-hover:scale-105 transition-all duration-300 shadow-md shadow-blue-500/10"
          />
          <span className="text-xl font-bold tracking-tighter italic">
            Prog<span className="text-blue-500">Vision.</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-md ml-2">
            Careers
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href={isAdmin ? "/admin" : "/dashboard"}>
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs uppercase tracking-widest font-bold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer">
                  Apply Now
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            <Terminal size={12} /> Recruitment & Onboarding Portal
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] text-balance">
            Start Your Sales Career at <span className="text-blue-500 italic">ProgVision.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
            We are hiring 20–30 candidates for Sales, Business Development, and Marketing roles. All selected recruits undergo our structured 7-Day Paid Onboarding Training to master lead generation, client outreach, and product positioning.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {isLoggedIn ? (
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs cursor-pointer flex items-center gap-2">
                  Go to Dashboard <ArrowRight size={14} />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs cursor-pointer flex items-center gap-2">
                    Create Account & Apply <ArrowRight size={14} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-8 py-4 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-xs cursor-pointer">
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* HERO METRICS CARD */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
          <h3 className="text-lg font-bold border-b border-white/5 pb-3">Training Cohort Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <h5 className="text-sm font-bold">7-Day Paid Induction</h5>
                <p className="text-xs text-slate-400 mt-0.5">Flexible remote hours with assigned scrape localities.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <Award size={18} />
              </div>
              <div>
                <h5 className="text-sm font-bold">Rs. 3.0L – 6.0L / Annum</h5>
                <p className="text-xs text-slate-400 mt-0.5">Variable performance-linked package credited monthly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h5 className="text-sm font-bold">100% Remote Operations</h5>
                <p className="text-xs text-slate-400 mt-0.5">No office attendance required. Laptop + internet mandatory.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOBS ROLES LISTING */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Active Openings</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2">Roles in this drive</h2>
          <p className="text-slate-400 text-sm mt-3">We are recruiting fresh graduates and final-year students for the following openings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolesData.map((role, idx) => (
            <div key={idx} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.03] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-white/5 rounded-xl text-blue-400 border border-white/5">
                    <Briefcase size={20} />
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/15">
                    {role.type}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{role.title}</h4>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono flex items-center gap-1">
                    <MapPin size={10} /> {role.location}
                  </p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{role.overview}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-500">Target</span>
                <p className="text-xs font-semibold text-slate-300">{role.target}</p>
                <p className="text-xs font-bold text-orange-400 pt-1">{role.compensation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRAINING CALENDAR HIGHLIGHTS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Onboarding Program</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2">7-Day Onboarding Framework</h2>
          <p className="text-slate-400 text-sm mt-3">Selected candidates undergo structured remote training to prepare for live accounts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
            <span className="text-2xl font-black font-mono text-blue-500">Day 1</span>
            <h5 className="font-bold text-sm text-white">Business Model Deep-Dive</h5>
            <p className="text-slate-400 text-xs leading-relaxed">Walkthrough of ProgVision services and demo setup of InstaDemoX AI website generator.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
            <span className="text-2xl font-black font-mono text-blue-500">Day 2-3</span>
            <h5 className="font-bold text-sm text-white">Lead Sourcing Foundations</h5>
            <p className="text-slate-400 text-xs leading-relaxed">Scraping restaurants, hotels, salons, and directories for businesses lacking modern websites.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
            <span className="text-2xl font-black font-mono text-blue-500">Day 4-5</span>
            <h5 className="font-bold text-sm text-white">WhatsApp & Pitch Outreach</h5>
            <p className="text-slate-400 text-xs leading-relaxed">Study outreach templates and objection handling guidelines to convert leads into scheduled demos.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
            <span className="text-2xl font-black font-mono text-blue-500">Day 6-7</span>
            <h5 className="font-bold text-sm text-white">Audit & Supervisor Review</h5>
            <p className="text-slate-400 text-xs leading-relaxed">Perform coverage reviews, submit training reports, and complete evaluation reviews for live onboarding.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 mt-auto border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <img src="/images/logo.jpeg" alt="Logo" className="h-5 w-auto rounded" />
          <span>© {new Date().getFullYear()} ProgVision Digital. All Rights Reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> MSME Registered Enterprise (UDYAM-AP-23-0076992)</span>
          <span className="hidden sm:inline">|</span>
          <span>support@progvision.online</span>
        </div>
      </footer>
    </div>
  );
}
