import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarProvider,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  FileText,
  Plus,
  Library,
  Settings,
  LogOut,
  LifeBuoy,
  Github,
  Database,
  BookText,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Insightive',
  description:
    'Leveraging Agentic AI and LLMs for Intelligent Academic Discovery and Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-1">
                  <Image src="/logo.png" alt="Insightive Logo" width={32} height={32} className="rounded-md" />
                  <span className="text-xl font-bold font-headline">
                    Insightive
                  </span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Plus />
                        New Chat
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/">
                        <SidebarMenuButton>
                          <Home />
                          Home
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/dataset-finder">
                        <SidebarMenuButton>
                          <Database />
                          Dataset Finder
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/repository-finder">
                        <SidebarMenuButton>
                          <Github />
                          Repository Finder
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/literature-review">
                        <SidebarMenuButton>
                          <BookText />
                          Literature Review
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>


                    <SidebarMenuItem>
                      <Link href="/related-papers">
                        <SidebarMenuButton>
                          <FileText />
                          Related Papers
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Library />
                      My Library
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LifeBuoy />
                      Help & Support
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings />
                      Settings
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarSeparator />
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LogOut />
                      Logout
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                <ThemeToggle />
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
