import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

// Helper to hash password using SHA-256
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

// Auto-seed admin user if not exists
export async function seedAdminUser() {
  try {
    const adminEmail = "admin@progvision.online";
    const q = query(collection(db, "portal_users"), where("email", "==", adminEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const passwordHash = await hashPassword("admin@progvision");
      await addDoc(collection(db, "portal_users"), {
        name: "Admin",
        email: adminEmail,
        passwordHash: passwordHash,
        isAdmin: true,
        role: "Admin",
        city: "Global",
        phone: "+91 7814201332",
        bio: "Main system administrator for ProgVision Portal.",
        hasEditedProfile: true,
        createdAt: new Date().toISOString()
      });
      console.log("Admin user seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

// Register candidate user
export async function createUser({ name, email, password, role, city, phone }) {
  const q = query(collection(db, "portal_users"), where("email", "==", email));
  const querySnapshot = await withTimeout(getDocs(q), 5000);
  if (!querySnapshot.empty) {
    throw new Error("Email is already registered");
  }
  
  const passwordHash = await hashPassword(password);
  const newUser = {
    name,
    email,
    passwordHash,
    role,
    city,
    phone,
    bio: "",
    hasEditedProfile: false,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };
  
  const docRef = await addDoc(collection(db, "portal_users"), newUser);
  return { userId: docRef.id, ...newUser };
}

// Login user (candidate or admin)
export async function loginUser({ email, password }) {
  const q = query(collection(db, "portal_users"), where("email", "==", email));
  const querySnapshot = await withTimeout(getDocs(q), 5000);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();
  const passwordHash = await hashPassword(password);
  
  if (userData.passwordHash === passwordHash) {
    return {
      userId: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      city: userData.city,
      phone: userData.phone || "",
      bio: userData.bio || "",
      hasEditedProfile: userData.hasEditedProfile,
      isAdmin: userData.isAdmin
    };
  }
  return null;
}

// Get user profile details
export async function getUserProfile(userId) {
  const userDocRef = doc(db, "portal_users", userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return { userId: userDoc.id, ...userDoc.data() };
  }
  return null;
}

// Check in candidate for today
export async function checkInToday(userId, sessionData) {
  const todayStr = new Date().toISOString().split("T")[0];
  const checkinId = `${userId}_${todayStr}`;
  const checkinRef = doc(db, "portal_checkins", checkinId);
  const existing = await getDoc(checkinRef);
  
  if (existing.exists()) {
    return { id: existing.id, ...existing.data() };
  }
  
  const newCheckin = {
    userId,
    userName: sessionData.name,
    role: sessionData.role || "",
    city: sessionData.city || "",
    timestamp: new Date().toISOString(),
    date: todayStr,
    checkoutTimestamp: null,
    durationMinutes: null
  };
  
  await setDoc(checkinRef, newCheckin);
  return { id: checkinId, ...newCheckin };
}

// Check out candidate for today
export async function checkOutToday(userId) {
  const todayStr = new Date().toISOString().split("T")[0];
  const checkinId = `${userId}_${todayStr}`;
  const checkinRef = doc(db, "portal_checkins", checkinId);
  const existing = await getDoc(checkinRef);
  
  if (!existing.exists()) return null;
  
  const data = existing.data();
  if (data.checkoutTimestamp) {
    return { id: existing.id, ...data }; // already checked out
  }
  
  const checkoutTime = new Date().toISOString();
  const checkinTime = new Date(data.timestamp);
  const durationMinutes = Math.round((new Date(checkoutTime) - checkinTime) / 60000);
  
  await updateDoc(checkinRef, {
    checkoutTimestamp: checkoutTime,
    durationMinutes
  });
  
  return { id: checkinId, ...data, checkoutTimestamp: checkoutTime, durationMinutes };
}

// Get today's check-in for a candidate
export async function getTodayCheckin(userId) {
  const todayStr = new Date().toISOString().split("T")[0];
  const checkinId = `${userId}_${todayStr}`;
  const checkinRef = doc(db, "portal_checkins", checkinId);
  const checkinDoc = await getDoc(checkinRef);
  if (checkinDoc.exists()) {
    return { id: checkinDoc.id, ...checkinDoc.data() };
  }
  return null;
}

// Get check-in list for a candidate
export async function getUserCheckins(userId) {
  const q = query(
    collection(db, "portal_checkins"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort client-side by timestamp descending
  list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
  return list;
}


// Log a client lead
export async function submitLead(userId, sessionData, formData) {
  const newLead = {
    userId,
    userName: sessionData.name,
    role: sessionData.role,
    city: sessionData.city,
    clientName: formData.clientName,
    contactPerson: formData.contactPerson || "",
    phoneOrEmail: formData.phoneOrEmail,
    responseStatus: formData.responseStatus,
    comments: formData.comments || "",
    submittedAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, "portal_leads"), newLead);
  return { id: docRef.id, ...newLead };
}

// Get submitted leads for a candidate
export async function getUserLeads(userId) {
  const q = query(
    collection(db, "portal_leads"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort client-side by submittedAt descending
  list.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return list;
}

// Update candidate profile details
export async function updateProfile(userId, profileData) {
  const userDocRef = doc(db, "portal_users", userId);
  
  // Destructure with fallbacks to avoid undefined values in Firestore
  const {
    name, phone, bio, city, 
    bankName, accountHolderName, accountNumber, ifscCode,
    address, email, panNo, aadharNo,
    class10, class12, degree, experience
  } = profileData;

  const updates = {
    name: name || "",
    phone: phone || "",
    bio: bio || "",
    city: city || "",
    bankName: bankName || "",
    accountHolderName: accountHolderName || "",
    accountNumber: accountNumber || "",
    ifscCode: ifscCode || "",
    address: address || "",
    email: email || "",
    panNo: panNo || "",
    aadharNo: aadharNo || "",
    class10: class10 || "",
    class12: class12 || "",
    degree: degree || "",
    experience: experience || ""
  };
  
  await updateDoc(userDocRef, updates);
  return updates;
}

// Send profile edit request to admin
export async function requestEditAccess(userId, userName, role, city) {
  // Check if there's already a pending request for this user
  const q = query(
    collection(db, "portal_edit_requests"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  const pendingDoc = querySnapshot.docs.find(d => d.data().status === "pending");
  if (pendingDoc) {
    return { id: pendingDoc.id, ...pendingDoc.data() };
  }
  
  const newRequest = {
    userId,
    userName,
    role,
    city,
    status: "pending",
    requestedAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, "portal_edit_requests"), newRequest);
  return { id: docRef.id, ...newRequest };
}

// Get the latest edit request status
export async function getEditRequest(userId) {
  const q = query(
    collection(db, "portal_edit_requests"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  // Sort client-side by requestedAt desc and return the latest
  const docs = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => (b.requestedAt || "").localeCompare(a.requestedAt || ""));
  return docs[0] || null;
}

// Admin: Get all non-admin users (candidates)
export async function getAllUsers() {
  const q = query(collection(db, "portal_users"), where("isAdmin", "==", false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() }));
}

// Admin: Get all check-ins
export async function getAllCheckins() {
  const querySnapshot = await getDocs(collection(db, "portal_checkins"));
  const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  list.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
  return list;
}

// Admin: Get all client leads
export async function getAllLeads() {
  const querySnapshot = await getDocs(collection(db, "portal_leads"));
  const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  list.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return list;
}

// Admin: Get count of today's check-ins
export async function getTodayCheckinsCount() {
  const todayStr = new Date().toISOString().split("T")[0];
  const q = query(collection(db, "portal_checkins"), where("date", "==", todayStr));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}

// Admin: Get all pending edit requests
export async function getPendingEditRequests() {
  const q = query(collection(db, "portal_edit_requests"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Admin: Get all resolved/approved edit requests
export async function getResolvedEditRequests() {
  const q = query(collection(db, "portal_edit_requests"), where("status", "==", "approved"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Admin: Approve candidate profile edit request
export async function approveEditRequest(requestId, userId) {
  const requestDocRef = doc(db, "portal_edit_requests", requestId);
  await updateDoc(requestDocRef, {
    status: "approved",
    resolvedAt: new Date().toISOString()
  });
  
  const userDocRef = doc(db, "portal_users", userId);
  await updateDoc(userDocRef, {
    hasEditedProfile: false
  });
}

// Admin: Get summary of candidate lead stats
export async function getUserLeadStats(userId) {
  const q = query(collection(db, "portal_leads"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  let interested = 0;
  let notInterested = 0;
  let maybe = 0;
  
  querySnapshot.forEach(doc => {
    const status = doc.data().responseStatus;
    if (status === "Interested") interested++;
    else if (status === "Not Interested") notInterested++;
    else if (status === "Maybe") maybe++;
  });
  
  return {
    total: querySnapshot.size,
    interested,
    notInterested,
    maybe
  };
}

// Admin: Delete a candidate account
export async function deleteUser(userId) {
  const userDocRef = doc(db, "portal_users", userId);
  await deleteDoc(userDocRef);
}

// Admin: Directly override profile lock (unlock profile editing)
export async function unlockProfile(userId) {
  const userDocRef = doc(db, "portal_users", userId);
  await updateDoc(userDocRef, {
    hasEditedProfile: false
  });
}

// CRM: Update response status and comments for a shared lead
export async function updateLeadResponse(leadId, responderId, responderName, responseData) {
  const leadDocRef = doc(db, "portal_leads", leadId);
  await updateDoc(leadDocRef, {
    responseStatus: responseData.responseStatus,
    comments: responseData.comments,
    respondedBy: responderId,
    respondedByName: responderName,
    respondedAt: new Date().toISOString()
  });
}

// Admin: Delete a lead from Firestore
export async function deleteLead(leadId) {
  const leadDocRef = doc(db, "portal_leads", leadId);
  await deleteDoc(leadDocRef);
}

// Wrapper for timeouts
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase connection timed out. Please check if the Firestore Database was actually created in your Firebase Console.')), ms))
  ]);
};
