const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "ERROR: SUPABASE_URL or SUPABASE_KEY is missing in environment variables!",
  );
  // Create a proxy to prevent crash on boot, but throw error when used
  supabase = new Proxy(
    {},
    {
      get: function (target, prop) {
        throw new Error(
          "Supabase client is not initialized. Please set SUPABASE_URL and SUPABASE_KEY in environment variables.",
        );
      },
    },
  );
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;
