
const SUPABASE_URL = "https://drukrdxxhxxcjxquxzib.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VrjcnQKPasSzevG-UiUU8Q_WMIXt5gr";

// Supabase clientni yaratish
window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
