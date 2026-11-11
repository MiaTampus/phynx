const SUPABASE_URL = "https://ftvecbweonsgxxtdzjmz.supabase.co";

const SUPABASE_KEY = "sb_publishable_c4ckS2DLwXt2vvC7kO75Dw_SbK40aa1";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.supabaseClient = supabaseClient;

console.log("Supabase connected!");