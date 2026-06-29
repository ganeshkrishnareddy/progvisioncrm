"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, MapPin, Briefcase, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, Calendar, Award, CheckCircle2, ChevronLeft } from "lucide-react";
import { createUser, seedAdminUser } from "@/lib/portalDb";
import { saveSession, isAuthenticated, isAdminSession } from "@/lib/portalAuth";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    role: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!formData.city.trim()) errors.city = "Assigned City is required";
    if (!formData.role) errors.role = "Job Role is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const user = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        city: formData.city,
        phone: formData.phone
      });

      // Submit a notification to Formspree as an email backup
      try {
        await fetch("https://formspree.io/f/xeezwbnz", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            role: formData.role,
            source: "onboarding_portal_signup"
          }),
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
      } catch (formspreeErr) {
        console.error("Formspree backup failed:", formspreeErr);
      }

      saveSession({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        phone: user.phone,
        isAdmin: user.isAdmin
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
              Join Our Global <br />
              <span className="text-blue-500 italic">Sales & Marketing Cohort.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fill in the registration form to create your candidate profile. Begin the 7-day remote onboarding program and submit your first client interactions.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">7-Day Paid Induction</h5>
                <p className="text-xs text-slate-500 mt-0.5">Flexible remote hours with assigned scrape localities.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Rs. 3.0L – 6.0L / Annum</h5>
                <p className="text-xs text-slate-500 mt-0.5">Variable performance-linked package credited monthly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">100% Remote Operations</h5>
                <p className="text-xs text-slate-500 mt-0.5">No physical office attendance required. Work from anywhere.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
          <ShieldCheck size={14} className="text-green-500" />
          <span>MSME Registered | Ministry of MSME, Govt of India</span>
        </div>
      </div>

      {/* RIGHT PANEL: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        {/* Back Link for Mobile */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Home
          </Link>
        </div>

        <div className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 my-8 shadow-2xl transition-all hover:border-white/15">
          <div className="text-center mb-6">
            <div className="flex justify-center lg:hidden mb-3">
              <img src="/images/logo.jpeg" alt="Logo" className="h-10 w-auto rounded-lg" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 lg:hidden">
              ProgVision.
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2 mb-1">Create Account</h2>
            <p className="text-slate-400 text-sm">Join the team and start your onboarding journey</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  required
                  className={`w-full bg-white/10 border ${validationErrors.name ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.name && (
                <span className="text-xs text-red-400 block pl-1">{validationErrors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  className={`w-full bg-white/10 border ${validationErrors.email ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.email && (
                <span className="text-xs text-red-400 block pl-1">{validationErrors.email}</span>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  required
                  className={`w-full bg-white/10 border ${validationErrors.phone ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.phone && (
                <span className="text-xs text-red-400 block pl-1">{validationErrors.phone}</span>
              )}
            </div>

            {/* Assigned City */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Assigned City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="city"
                  required
                  className={`w-full bg-white/10 border ${validationErrors.city ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                  placeholder="e.g. Hyderabad"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.city && (
                <span className="text-xs text-red-400 block pl-1">{validationErrors.city}</span>
              )}
            </div>

            {/* Role Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Job Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <select
                  name="role"
                  required
                  className={`w-full bg-[#182030] border ${validationErrors.role ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors appearance-none text-sm`}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="" disabled className="text-slate-400 bg-[#0B1220]">Select your job role</option>
                  <option value="Sales Intern" className="text-white bg-[#0B1220]">Sales Intern</option>
                  <option value="Business Development Executive (BDE)" className="text-white bg-[#0B1220]">Business Development Executive (BDE)</option>
                  <option value="Business Development Associate (BDA)" className="text-white bg-[#0B1220]">Business Development Associate (BDA)</option>
                  <option value="Lead Generation Specialist" className="text-white bg-[#0B1220]">Lead Generation Specialist</option>
                  <option value="Digital Marketer" className="text-white bg-[#0B1220]">Digital Marketer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {validationErrors.role && (
                <span className="text-xs text-red-400 block pl-1">{validationErrors.role}</span>
              )}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className={`w-full bg-white/10 border ${validationErrors.password ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white placeholder-slate-400 rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <span className="text-xs text-red-400 block pl-1">{validationErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    className={`w-full bg-white/10 border ${validationErrors.confirmPassword ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500"} text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <span className="text-xs text-red-400 block pl-1">{validationErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already registered?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 group">
              Sign In <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
