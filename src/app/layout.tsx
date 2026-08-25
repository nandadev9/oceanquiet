import { Outfit } from 'next/font/google';
import type { Metadata } from "next";
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TasksProvider } from '@/context/TasksContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OceanQuiet",
    template: "%s | OceanQuiet",
  },
  description:
    "OceanQuiet: um espaço gentil para organizar a rotina, cultivar foco e acompanhar o bem-estar.",
  applicationName: "OceanQuiet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <SidebarProvider>
                <TasksProvider>{children}</TasksProvider>
              </SidebarProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
