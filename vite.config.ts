// // import { defineConfig } from 'vite';
// // import react from '@vitejs/plugin-react';

// // // https://vitejs.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// //   optimizeDeps: {
// //     exclude: ['lucide-react'],
// //   },
// // });


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import sitemap from "vite-plugin-sitemap";
// import { createClient } from '@supabase/supabase-js';

// // ✅ Use environment variables safely
// const supabaseUrl = process.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error("Missing Supabase environment variables. Check .env file.");
// }

// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // ✅ Define Property Type
// interface Property {
//   id: string;
// }

// // ✅ Function to Fetch Property Routes from Supabase
// async function getDynamicRoutes(): Promise<string[]> {
//   try {
//     const { data: properties, error: propertyError } = await supabase.from('properties').select('id');
//     if (propertyError) throw propertyError;
    
//     const { data: developers, error: developerError } = await supabase.from('developers').select('id');
//     if (developerError) throw developerError;
    
//     const propertyRoutes = properties.map((property: Property) => `/property/${property.id}`);
//     const developerRoutes = developers.map((developer: Property) => `/developer/${developer.id}`);
    
//     return [...propertyRoutes, ...developerRoutes];
//   } catch (error) {
//     console.error("Error fetching dynamic routes from Supabase:", error);
//     return [];
//   }
// }

// export default defineConfig(async () => {
//   const dynamicRoutes = await getDynamicRoutes();

//   return {
//     plugins: [
//       react(),
//       sitemap({
//         hostname: "https://housegpt.in",
//         outDir: "dist",
//         dynamicRoutes: [
//           "/", "/about", "/properties", "/contact", "/chat", "/login", "/register", "/wishlist", "/compare", "/profile", "/developer/register", "/developer/dashboard", "/developer/add-property", "/developer/edit-property", "/news", "/feed", ...dynamicRoutes
//         ],
//       }),
//     ],
//     optimizeDeps: {
//       exclude: ['lucide-react'],
//     },
//   };
// });


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from "vite-plugin-sitemap";
import { createClient } from '@supabase/supabase-js';

// ✅ Load environment variables correctly
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables. Check .env file.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  async function getDynamicRoutes(): Promise<string[]> {
    try {
      const { data: properties, error: propertyError } = await supabase.from('properties').select('id');
      if (propertyError) throw propertyError;

      const { data: developers, error: developerError } = await supabase.from('developers').select('id');
      if (developerError) throw developerError;

      const propertyRoutes = properties.map((property) => `/property/${property.id}`);
      const developerRoutes = developers.map((developer) => `/developer/${developer.id}`);

      return [...propertyRoutes, ...developerRoutes];
    } catch (error) {
      console.error("Error fetching dynamic routes from Supabase:", error);
      return [];
    }
  }

  return getDynamicRoutes().then((dynamicRoutes) => ({
    plugins: [
      react(),
      sitemap({
        hostname: "https://housegpt.in",
        outDir: "dist",
        dynamicRoutes: [
          "/", "/about", "/properties", "/contact", "/chat", "/login", "/register",
          "/wishlist", "/compare", "/profile", "/developer/register", "/developer/dashboard",
          "/developer/add-property", "/developer/edit-property", "/news", "/feed", 
          ...dynamicRoutes
        ],
      }),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  }));
});
