export function saveSession(userData) {
  if (typeof window !== "undefined") {
    localStorage.setItem("portal_session", JSON.stringify(userData));
  }
}

export function getSession() {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("portal_session");
    return session ? JSON.parse(session) : null;
  }
  return null;
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("portal_session");
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function isAdminSession() {
  const session = getSession();
  return session ? !!session.isAdmin : false;
}
