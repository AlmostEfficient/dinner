import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";
import { ThemeProvider } from "./contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// List of food emojis
const FOOD_EMOJIS = ["🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥓", "🥚", "🍳", "🧇", "🥞", "🧈", "🍞", "🥐", "🥨", "🥯", "🥖", "🧀", "🥗", "🥙", "🥪", "🌮", "🌯", "🫔", "🥫", "🍖", "🍗", "🥩", "🍠", "🥟", "🍤", "🍚", "🍜", "🍲", "🍥", "🍙", "🍘", "🍢", "🍣", "🍱", "🥡", "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "☕", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊", "🥢", "🍽️", "🍴", "🥄", "🏺"];

// Function to generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  // Set a default emoji (e.g., the first one)
  const defaultEmoji = FOOD_EMOJIS[0]; 
  const svg = `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${defaultEmoji}</text></svg>`;
  const dataUri = `data:image/svg+xml,${svg}`;

  return {
    title: "dinner time",
    description: "can i get uhhhh...",
    icons: {
      icon: dataUri, // Set the default emoji data URI as the initial icon
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <DynamicFavicon />
        </ThemeProvider>
      </body>
    </html>
  );
}
