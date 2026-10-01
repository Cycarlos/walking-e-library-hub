import { supabase } from "./supabase.js";

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) { console.error("Error getting user:", error); return null; }
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, lrn, grade_level, section, created_at")
    .eq("id", user.id)
    .single();
  if (error) { console.error("Error getting profile:", error); return null; }
  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) { window.location.replace("login.html"); return null; }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  const profile = await getCurrentProfile();
  if (!profile) { alert("Your profile could not be found."); await supabase.auth.signOut(); window.location.replace("login.html"); return null; }
  if (profile.role !== "admin") { alert("You are not an administrator."); window.location.replace("dashboard.html"); return null; }
  return { user, profile };
}

export async function signOut() {
  const sessionId = localStorage.getItem("walking_e_library_session_id");
  if (sessionId) {
    await supabase.from("user_login_sessions").update({
      logout_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    }).eq("id", sessionId);
    localStorage.removeItem("walking_e_library_session_id");
  }
  await supabase.auth.signOut();
  window.location.replace("login.html");
}
