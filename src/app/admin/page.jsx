"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  ClipboardList,
  RefreshCw,
  LogOut,
  Loader2,
  Search,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  User,
  MapPin,
  Briefcase,
  Phone,
  Filter,
  Mail
} from "lucide-react";
import { getSession, clearSession, isAuthenticated, isAdminSession } from "@/lib/portalAuth";
import {
  getAllUsers,
  getAllCheckins,
  getAllLeads,
  getPendingEditRequests,
  getResolvedEditRequests,
  approveEditRequest,
  createUser,
  deleteUser,
  unlockProfile,
  checkInToday,
  deleteLead
} from "@/lib/portalDb";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [toast, setToast] = useState(null);

  // Core data states
  const [usersList, setUsersList] = useState([]);
  const [checkinsList, setCheckinsList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [resolvedRequests, setResolvedRequests] = useState([]);

  // UI interaction states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [expandedSubTab, setExpandedSubTab] = useState("checkins"); // "checkins" | "leads"
  const [requestTab, setRequestTab] = useState("pending"); // "pending" | "resolved"
  const [approvingRequestId, setApprovingRequestId] = useState(null);

  // Create Candidate Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "ProgVision@2022",
    phone: "",
    city: "",
    role: "Sales Intern"
  });
  const [creatingCandidate, setCreatingCandidate] = useState(false);
  const [createError, setCreateError] = useState("");

  // Manual check-in and unlock states
  const [actionInProgress, setActionInProgress] = useState(false);

  // Leads management states
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [deletingLeadId, setDeletingLeadId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!isAdminSession()) {
      router.push("/dashboard");
      return;
    }

    setSession(getSession());
    loadAllData();
  }, [router]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [users, checkins, leads, pending, resolved] = await Promise.all([
        getAllUsers(),
        getAllCheckins(),
        getAllLeads(),
        getPendingEditRequests(),
        getResolvedEditRequests()
      ]);

      setUsersList(users);
      setCheckinsList(checkins);
      setLeadsList(leads);
      setPendingRequests(pending);
      setResolvedRequests(resolved);
      
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const handleApproveRequest = async (requestId, userId) => {
    setApprovingRequestId(requestId);
    try {
      await approveEditRequest(requestId, userId);
      showToast("Profile edit permission approved!");
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Approval failed. Please try again.", "error");
    } finally {
      setApprovingRequestId(null);
    }
  };

  // CREATE CANDIDATE ACCOUNT
  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    setCreateError("");
    
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim() || !createForm.phone.trim()) {
      setCreateError("All fields are required");
      return;
    }

    setCreatingCandidate(true);
    try {
      await createUser(createForm);
      showToast(`Account for ${createForm.name} created successfully!`);
      
      // Send Onboarding Email via Resend
      try {
        await fetch("/api/send-onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: createForm.name,
            email: createForm.email,
            phone: createForm.phone,
            city: createForm.city,
            role: createForm.role,
            password: createForm.password
          })
        });
        showToast(`Onboarding email sent to ${createForm.email}!`);
      } catch (emailErr) {
        console.error("Failed to send onboarding email:", emailErr);
        showToast("Candidate created, but failed to send email.", "error");
      }

      setCreateForm({
        name: "",
        email: "",
        password: "ProgVision@2022",
        phone: "",
        city: "",
        role: "Sales Intern"
      });
      setIsCreateModalOpen(false);
      await loadAllData();
    } catch (err) {
      setCreateError(err.message || "Failed to create candidate account");
    } finally {
      setCreatingCandidate(false);
    }
  };

  // DELETE CANDIDATE
  const handleDeleteCandidate = async (userId, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}'s account?\nThis action cannot be undone.`)) {
      return;
    }

    setActionInProgress(true);
    try {
      await deleteUser(userId);
      showToast(`${name}'s account has been deleted.`);
      if (expandedUserId === userId) setExpandedUserId(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Deletion failed. Please try again.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  // MANUAL UNLOCK PROFILE
  const handleManualUnlock = async (userId, name) => {
    setActionInProgress(true);
    try {
      await unlockProfile(userId);
      showToast(`${name}'s profile has been unlocked for editing.`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Unlock failed. Please try again.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  // DELETE LEAD
  const handleDeleteLead = async (leadId, clientName) => {
    if (!confirm(`Delete lead "${clientName}"? This removes it from the portal database. Google Form responses cannot be deleted via API.`)) return;
    setDeletingLeadId(leadId);
    try {
      await deleteLead(leadId);
      setLeadsList(prev => prev.filter(l => l.id !== leadId));
      showToast(`Lead "${clientName}" deleted from portal database.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete lead. Please try again.", "error");
    } finally {
      setDeletingLeadId(null);
    }
  };

  // MANUAL CHECK-IN
  const handleManualCheckIn = async (userId, candidateData) => {
    setActionInProgress(true);
    try {
      await checkInToday(userId, {
        name: candidateData.name,
        role: candidateData.role,
        city: candidateData.city
      });
      showToast(`Checked in ${candidateData.name} for today!`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Manual check-in failed.", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  const toggleExpandCandidate = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      setExpandedSubTab("checkins");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const totalCandidatesCount = usersList.length;
  const todayCheckinsCount = checkinsList.filter((c) => c.date === todayStr).length;
  const totalLeadsCount = leadsList.length;

  // Filter candidates list based on search and role dropdown
  const filteredCandidates = usersList.filter((user) => {
    const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = user.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || cityMatch || roleMatch;
    
    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#0B1220] text-white pt-24 pb-12 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

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
          <span className="w-[1px] h-6 bg-white/20" />
          <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/15"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Candidate</span>
          </button>

          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm">Fetching system records...</p>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Candidates */}
            <div className="bg-white/5 border-l-4 border-l-blue-500 border-y border-r border-white/10 rounded-r-2xl rounded-l-md p-5 flex items-center justify-between backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Total Candidates</span>
                <h2 className="text-4xl font-extrabold">{totalCandidatesCount}</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Today's Checkins */}
            <div className="bg-white/5 border-l-4 border-l-green-500 border-y border-r border-white/10 rounded-r-2xl rounded-l-md p-5 flex items-center justify-between backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Today's Check-ins</span>
                <h2 className="text-4xl font-extrabold">{todayCheckinsCount}</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Total Lead Submissions */}
            <div className="bg-white/5 border-l-4 border-l-orange-500 border-y border-r border-white/10 rounded-r-2xl rounded-l-md p-5 flex items-center justify-between backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Total CRM Leads</span>
                <h2 className="text-4xl font-extrabold">{totalLeadsCount}</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 px-1 -mt-4">
            <span>Last updated: {lastUpdated ? `${lastUpdated}` : "Loading..."}</span>
            <span>All stats derived from Firestore collections</span>
          </div>

          {/* CANDIDATE PERFORMANCE SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Candidate Activity</span>
                <h3 className="text-lg font-bold mt-0.5">Performance Tracking</h3>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl justify-end">
                {/* Role Dropdown Filter */}
                <div className="relative shrink-0 w-full sm:w-[220px]">
                  <Briefcase className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                  <select
                    className="w-full bg-[#182030] border border-white/20 text-white rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="All" className="bg-[#0B1220]">All Job Roles</option>
                    <option value="Sales Intern" className="bg-[#0B1220]">Sales Intern</option>
                    <option value="Business Development Executive (BDE)" className="bg-[#0B1220]">Business Development Executive (BDE)</option>
                    <option value="Business Development Associate (BDA)" className="bg-[#0B1220]">Business Development Associate (BDA)</option>
                    <option value="Lead Generation Specialist" className="bg-[#0B1220]">Lead Generation Specialist</option>
                    <option value="Digital Marketer" className="bg-[#0B1220]">Digital Marketer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                    <Filter className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Filter by name, city..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                <p className="text-slate-500 text-sm">No candidates match these criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3.5 pr-4">Candidate Details</th>
                      <th className="pb-3.5 px-4">Role</th>
                      <th className="pb-3.5 px-4">City</th>
                      <th className="pb-3.5 px-4 text-center">Total Leads</th>
                      <th className="pb-3.5 px-4 text-center">Check-ins</th>
                      <th className="pb-3.5 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCandidates.map((user) => {
                      const userLeads = leadsList.filter((l) => l.userId === user.userId);
                      const userCheckins = checkinsList.filter((c) => c.userId === user.userId);
                      const isExpanded = expandedUserId === user.userId;
                      const hasCheckedInToday = checkinsList.some(
                        (c) => c.userId === user.userId && c.date === todayStr
                      );

                      return (
                        <React.Fragment key={user.userId}>
                          <tr className="hover:bg-white/[0.005] border-b border-white/5 transition-colors">
                            <td className="py-4 pr-4 font-bold text-white max-w-[150px] sm:max-w-xs truncate">
                              <span className="block">{user.name}</span>
                              <span className="block text-xs text-slate-500 font-mono font-normal mt-0.5 truncate">{user.email}</span>
                            </td>
                            <td className="py-4 px-4 text-slate-300 max-w-[180px] truncate">{user.role}</td>
                            <td className="py-4 px-4 text-slate-300 truncate">{user.city}</td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-orange-400">{userLeads.length}</td>
                            <td className="py-4 px-4 text-center font-mono text-blue-400">{userCheckins.length}</td>
                            <td className="py-4 pl-4 text-right">
                              <button
                                onClick={() => toggleExpandCandidate(user.userId)}
                                className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                              >
                                Details
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          </tr>

                          {/* EXPANDABLE ACCORDION DETAIL PANEL */}
                          {isExpanded && (
                            <tr className="bg-white/[0.01]">
                              <td colSpan={6} className="p-0">
                                <div className="bg-white/[0.02] border-x border-b border-white/10 rounded-xl p-5 mb-4 mx-2 text-white animate-fadeIn space-y-5">
                                {/* Details Meta Summary & Direct Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-xl text-xs">
                                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                    <div>
                                      <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Phone</span>
                                      <span className="font-semibold">{user.phone || "—"}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Profile Edits</span>
                                      <span className={user.hasEditedProfile ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                                        {user.hasEditedProfile ? "Locked (Edited Once)" : "Unlocked"}
                                      </span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-slate-500 block uppercase font-mono text-[9px] tracking-wider">Bio</span>
                                      <span className="text-slate-300 italic">{user.bio || "No biography details logged."}</span>
                                    </div>
                                    
                                    {/* Bank Details section */}
                                    <div className="col-span-2 border-t border-white/5 pt-2.5 mt-1 space-y-1">
                                      <span className="text-blue-400 block uppercase font-mono text-[9px] tracking-wider font-bold">Bank Account Details (Payouts)</span>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/5 border border-white/5 rounded-lg p-2 font-mono text-[10px]">
                                        <div>
                                          <span className="text-slate-500 block text-[8px] uppercase">Holder</span>
                                          <span className="text-slate-300 font-semibold">{user.accountHolderName || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[8px] uppercase">Bank</span>
                                          <span className="text-slate-300 font-semibold">{user.bankName || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[8px] uppercase">Account #</span>
                                          <span className="text-slate-300 font-semibold">{user.accountNumber || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[8px] uppercase">IFSC</span>
                                          <span className="text-slate-300 font-semibold">{user.ifscCode || "—"}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Direct overrides panel */}
                                  <div className="flex flex-wrap gap-2.5 justify-end items-center border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                    {/* Manual attendance checkin */}
                                    {!hasCheckedInToday ? (
                                      <button
                                        onClick={() => handleManualCheckIn(user.userId, user)}
                                        disabled={actionInProgress}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                                      >
                                        <Clock className="w-3 h-3" /> Check In Today
                                      </button>
                                    ) : (
                                      <span className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25 rounded-lg text-[10px] uppercase font-bold tracking-wider">
                                        Checked In Today ✓
                                      </span>
                                    )}

                                    {/* Manual profile unlock override */}
                                    {user.hasEditedProfile && (
                                      <button
                                        onClick={() => handleManualUnlock(user.userId, user.name)}
                                        disabled={actionInProgress}
                                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                                      >
                                        <Unlock className="w-3 h-3" /> Unlock Profile
                                      </button>
                                    )}

                                    {/* Remove candidate button */}
                                    <button
                                      onClick={() => handleDeleteCandidate(user.userId, user.name)}
                                      disabled={actionInProgress}
                                      className="px-3 py-1.5 border border-red-500/35 hover:bg-red-500/10 text-red-400 font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" /> Delete Candidate
                                    </button>
                                  </div>
                                </div>

                                {/* Accordion Sub-Tabs */}
                                <div className="border-t border-white/5 pt-4">
                                  <div className="flex border-b border-white/5 mb-4 pb-1">
                                    <button
                                      onClick={() => setExpandedSubTab("checkins")}
                                      className={`pb-2 px-4 text-xs uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                                        expandedSubTab === "checkins"
                                          ? "border-blue-500 text-white"
                                          : "border-transparent text-slate-500 hover:text-slate-300"
                                      }`}
                                    >
                                      Check-In History ({userCheckins.length})
                                    </button>
                                    <button
                                      onClick={() => setExpandedSubTab("leads")}
                                      className={`pb-2 px-4 text-xs uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                                        expandedSubTab === "leads"
                                          ? "border-blue-500 text-white"
                                          : "border-transparent text-slate-500 hover:text-slate-300"
                                      }`}
                                    >
                                      Client Lead Records ({userLeads.length})
                                    </button>
                                  </div>

                                  {/* Sub-Tab 1: Checkins List */}
                                  {expandedSubTab === "checkins" && (
                                    <div>
                                      {userCheckins.length === 0 ? (
                                        <p className="text-slate-500 text-xs py-4 text-center">No attendance logs logged yet for this candidate.</p>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2">
                                          {userCheckins.map((ch) => (
                                            <div key={ch.id} className="bg-white/5 border border-white/5 rounded-lg p-2.5 text-xs">
                                              <p className="font-bold text-white">
                                                {new Date(ch.timestamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                                              </p>
                                              <p className="text-slate-400 mt-1 font-mono">
                                                Check-In: {new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </p>
                                              <p className="text-slate-500 text-[10px] mt-0.5">
                                                {new Date(ch.timestamp).toLocaleDateString([], { weekday: 'long' })}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Sub-Tab 2: Leads Table */}
                                  {expandedSubTab === "leads" && (
                                    <div className="space-y-4">
                                      {/* Lead Summary count */}
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase font-bold text-slate-500">Summary:</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">
                                          {userLeads.filter(l => l.responseStatus === "Not Contacted").length} Not Contacted
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                                          {userLeads.filter(l => l.responseStatus === "Interested").length} Interested
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                                          {userLeads.filter(l => l.responseStatus === "Maybe").length} Maybe
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                                          {userLeads.filter(l => l.responseStatus === "Not Interested").length} Not Interested
                                        </span>
                                      </div>

                                      {userLeads.length === 0 ? (
                                        <p className="text-slate-500 text-xs py-4 text-center">No CRM lead entries submitted yet.</p>
                                      ) : (
                                        <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-2">
                                          <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                              <tr className="border-b border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                                                <th className="pb-2">Client Business</th>
                                                <th className="pb-2 px-2">Contact Details</th>
                                                <th className="pb-2 px-2 text-center">Status</th>
                                                <th className="pb-2 px-2">Comments</th>
                                                <th className="pb-2 pl-2 text-right">Submitted At</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                              {userLeads.map((ld) => (
                                                <tr key={ld.id}>
                                                  <td className="py-2.5 pr-2 font-bold text-white">{ld.clientName}</td>
                                                  <td className="py-2.5 px-2 text-slate-300 font-mono">
                                                    {ld.contactPerson && <span className="block font-sans font-medium text-[11px] text-white">{ld.contactPerson}</span>}
                                                    <span className="block text-[10px] text-slate-500">{ld.phoneOrEmail}</span>
                                                  </td>
                                                  <td className="py-2.5 px-2 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                      ld.responseStatus === "Interested"
                                                        ? "bg-green-500/10 text-green-400 border-green-500/25"
                                                        : ld.responseStatus === "Maybe"
                                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                                        : ld.responseStatus === "Not Contacted"
                                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                                                        : "bg-red-500/10 text-red-400 border-red-500/25"
                                                    }`}>
                                                      {ld.responseStatus}
                                                    </span>
                                                  </td>
                                                  <td className="py-2.5 px-2 text-slate-400 max-w-[200px] truncate" title={ld.comments}>
                                                    {ld.comments || "—"}
                                                  </td>
                                                  <td className="py-2.5 pl-2 text-right font-mono text-[10px] text-slate-500">
                                                    {new Date(ld.submittedAt).toLocaleDateString()} {new Date(ld.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ALL CRM LEADS SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-orange-400 font-bold">Lead Management</span>
                <h3 className="text-lg font-bold mt-0.5">All CRM Leads <span className="text-slate-500 font-normal text-base">({leadsList.length})</span></h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status filter */}
                <select
                  className="bg-[#182030] border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                >
                  <option value="All" className="bg-[#0B1220]">All Statuses</option>
                  <option value="Not Contacted" className="bg-[#0B1220]">Not Contacted</option>
                  <option value="Interested" className="bg-[#0B1220]">Interested</option>
                  <option value="Maybe" className="bg-[#0B1220]">Maybe</option>
                  <option value="Not Interested" className="bg-[#0B1220]">Not Interested</option>
                </select>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search business, contact..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    value={leadSearchTerm}
                    onChange={(e) => setLeadSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Info note about Google Form */}
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                Deleting a lead removes it from the portal database only. Google Form responses must be deleted manually from the <a href="https://forms.gle/66gQSVbov9rPV4d4A" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google Forms dashboard</a>.
              </p>
            </div>

            {(() => {
              const filteredLeads = leadsList
                .filter(l => leadStatusFilter === "All" || l.responseStatus === leadStatusFilter)
                .filter(l => {
                  const term = leadSearchTerm.toLowerCase();
                  return !term ||
                    (l.clientName || "").toLowerCase().includes(term) ||
                    (l.contactPerson || "").toLowerCase().includes(term) ||
                    (l.phoneOrEmail || "").toLowerCase().includes(term) ||
                    (l.userName || "").toLowerCase().includes(term) ||
                    (l.city || "").toLowerCase().includes(term);
                });

              if (filteredLeads.length === 0) {
                return (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                    <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No leads found.</p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3.5 pr-3">Business Name</th>
                        <th className="pb-3.5 px-3">Contact</th>
                        <th className="pb-3.5 px-3">Phone / Email</th>
                        <th className="pb-3.5 px-3 text-center">Status</th>
                        <th className="pb-3.5 px-3">Submitted By</th>
                        <th className="pb-3.5 px-3">Comments</th>
                        <th className="pb-3.5 px-3">Date</th>
                        <th className="pb-3.5 pl-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 pr-3 font-bold text-white text-sm">{lead.clientName || "—"}</td>
                          <td className="py-3.5 px-3 text-slate-300 text-xs">{lead.contactPerson || "—"}</td>
                          <td className="py-3.5 px-3 text-slate-300 text-xs font-mono">{lead.phoneOrEmail || "—"}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              lead.responseStatus === "Interested"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : lead.responseStatus === "Maybe"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : lead.responseStatus === "Not Contacted"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}>{lead.responseStatus || "Not Contacted"}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-xs text-white font-medium">{lead.userName || "—"}</div>
                            <div className="text-[10px] text-slate-500">{lead.city || ""}</div>
                          </td>
                          <td className="py-3.5 px-3 text-xs text-slate-400 max-w-[160px]">
                            <span className="line-clamp-2">{lead.comments || "—"}</span>
                          </td>
                          <td className="py-3.5 px-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                            {lead.submittedAt ? new Date(lead.submittedAt).toLocaleDateString([], { day: '2-digit', month: 'short' }) : "—"}
                          </td>
                          <td className="py-3.5 pl-3 text-right">
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                              disabled={deletingLeadId === lead.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {deletingLeadId === lead.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* EDIT ACCESS REQUESTS SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex border-b border-white/10 mb-6">
              <button
                onClick={() => setRequestTab("pending")}
                className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                  requestTab === "pending"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Pending Requests ({pendingRequests.length})
              </button>
              <button
                onClick={() => setRequestTab("resolved")}
                className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                  requestTab === "resolved"
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-blue-500 text-white"
                }`}
              >
                Resolved Requests ({resolvedRequests.length})
              </button>
            </div>

            {/* PENDING TAB LIST */}
            {requestTab === "pending" && (
              <div>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No pending profile edit access requests.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Candidate Name</th>
                          <th className="pb-3 px-4">Role</th>
                          <th className="pb-3 px-4">City</th>
                          <th className="pb-3 px-4">Requested At</th>
                          <th className="pb-3 pl-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {pendingRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-white/[0.005]">
                            <td className="py-3.5 pr-4 font-bold text-white">{req.userName}</td>
                            <td className="py-3.5 px-4 text-slate-300">{req.role}</td>
                            <td className="py-3.5 px-4 text-slate-300">{req.city}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                              {new Date(req.requestedAt).toLocaleDateString()} {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 pl-4 text-right">
                              <button
                                onClick={() => handleApproveRequest(req.id, req.userId)}
                                disabled={approvingRequestId === req.id}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-green-500/10 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                              >
                                {approvingRequestId === req.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* RESOLVED TAB LIST */}
            {requestTab === "resolved" && (
              <div>
                {resolvedRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No resolved request logs recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Candidate Name</th>
                          <th className="pb-3 px-4">Role</th>
                          <th className="pb-3 px-4">City</th>
                          <th className="pb-3 pl-4 text-right">Approved At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {resolvedRequests.map((req) => (
                          <tr key={req.id} className="text-slate-400">
                            <td className="py-3 pr-4 font-bold text-slate-300">{req.userName}</td>
                            <td className="py-3 px-4 text-sm">{req.role}</td>
                            <td className="py-3 px-4 text-sm">{req.city}</td>
                            <td className="py-3 pl-4 text-right font-mono text-xs text-slate-500">
                              {new Date(req.resolvedAt).toLocaleDateString()} {new Date(req.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* CREATE CANDIDATE MODAL DIALOG */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay backdrop */}
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Form Card */}
          <div className="relative w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 z-10">
            <div className="text-center mb-6">
              <img src="/images/logo.jpeg" alt="ProgVision Logo" className="h-10 w-auto rounded object-contain mx-auto" />
              <h3 className="text-xl font-bold mt-2 text-white">Create Candidate Account</h3>
              <p className="text-slate-400 text-xs mt-1">Directly generate a candidate profile and login ID.</p>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCandidate} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Candidate full name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="candidate@progvision.online"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password (Auto-Generated)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    disabled
                    className="w-full bg-white/5 border border-white/10 text-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed"
                    value={createForm.password}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    required
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>



              {/* Job Role Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Job Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                  <select
                    className="w-full bg-[#182030] border border-white/20 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    value={createForm.role}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="Sales Intern" className="bg-[#0B1220]">Sales Intern</option>
                    <option value="Business Development Executive (BDE)" className="bg-[#0B1220]">Business Development Executive (BDE)</option>
                    <option value="Business Development Associate (BDA)" className="bg-[#0B1220]">Business Development Associate (BDA)</option>
                    <option value="Lead Generation Specialist" className="bg-[#0B1220]">Lead Generation Specialist</option>
                    <option value="Digital Marketer" className="bg-[#0B1220]">Digital Marketer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCandidate}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creatingCandidate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
