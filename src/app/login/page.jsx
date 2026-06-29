"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, Calendar, Award, CheckCircle2, ChevronLeft } from "lucide-react";
import { loginUser, seedAdminUser } from "@/lib/portalDb";
import { saveSession, isAuthenticated, isAdminSession } from "@/lib/portalAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Run seeding of admin user
    seedAdminUser();

    // Guard route: if logged in, redirect appropriately
    if (isAuthenticated()) {
      if (isAdminSession()) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser({ email, password });
      if (user) {
        saveSession(user);
        if (user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* LEFT PANEL: Branding & Onboarding Info (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-black/20 border-r border-white/5 p-12 flex-col justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo.jpeg"
            alt="ProgVision Logo"
            className="h-10 w-auto rounded-lg group-hover:scale-105 transition-all shadow-md shadow-blue-500/10"
          />
          <span className="text-xl font-bold tracking-tighter italic">
            Prog<span className="text-blue-500">Vision.</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-md ml-2">
            Careers
          </span>
        </Link>

        {/* Informative Showcase */}
        <div className="space-y-8 max-w-lg my-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Onboarding & Performance <br />
              <span className="text-blue-500 italic">Management Portal.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Log in to access your customized dashboard. Log check-ins, study the 7-day training schedule, submit daily client leads, and request profile updates.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">7-Day Induction</h5>
                <p className="text-xs text-slate-500 mt-0.5">Step-by-step daily deliverables and scraped localities guides.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Lead Submission Tracking</h5>
                <p className="text-xs text-slate-500 mt-0.5">Submit client feedbacks directly to the admin queue.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Dynamic Profile Controls</h5>
                <p className="text-xs text-slate-500 mt-0.5">Locked profile fields unlock immediately upon supervisor approval.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
          <ShieldCheck size={14} className="text-green-500" />
          <span>MSME Registered (UDYAM-AP-23-0076992) | Ministry of MSME, Govt of India</span>
        </div>
      </div>

      {/* RIGHT PANEL: Professional Sign-In Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        {/* Back Link for Mobile */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Home
          </Link>
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/15">
          {/* Logo only visible on mobile in header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/images/logo.jpeg" alt="ProgVision Logo" className="h-12 w-auto rounded object-contain" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1 mb-1">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to access the portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="name@progvision.online"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400 border-t border-white/5 pt-6">
            New candidate?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 group">
              Register here <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
