import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, Briefcase, Video, FileQuestion, ClipboardList, GraduationCap } from "lucide-react";

const navigation = [
  { key: "users", label: "Users (Job Seekers)", icon: Users, path: "/admin-dashboard#users" },
  { key: "companies", label: "Companies", icon: LayoutDashboard, path: "/admin-dashboard#companies" },
  { key: "jobs", label: "Jobs", icon: Briefcase, path: "/admin-dashboard#jobs" },
  { key: "ai-jobs", label: "AI Interviewed Jobs", icon: Video, path: "/admin-dashboard#ai-jobs" },
  { key: "interviews", label: "Interviews", icon: Video, path: "/admin-dashboard#interviews" },
  { key: "questions", label: "Questions", icon: FileQuestion, path: "/admin-dashboard#questions" },
  { key: "applications", label: "Applications", icon: ClipboardList, path: "/admin-dashboard#applications" },
];

export default function AdminLayout({ activeSection, children, headerContent }: {
  activeSection: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="fixed md:sticky top-0 h-screen w-64 bg-card border-r border-border/50">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border/50">
            <Link to="/admin-dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="font-bold text-lg">EduDiagno Admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-brand text-brand-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-border/50 px-4 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20">
          {headerContent || <h1 className="text-2xl font-bold">Admin</h1>}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 