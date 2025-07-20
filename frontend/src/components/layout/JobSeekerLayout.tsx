import React, { useContext, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "@/context/AppContext";

const JobSeekerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    appContext?.jobSeekerLogout?.();
    navigate("/jobseeker/login");
  };

  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/jobseeker/home" className="flex items-center gap-2 font-bold text-lg">
            <span className="rounded-md px-2 py-1 border bg-background">E</span>
            EduDiagnoAI
          </Link>
          <nav className="flex gap-6 text-sm ml-8">
            <Link to="/jobseeker/home" className="hover:underline">Home</Link>
            <Link to="/jobseeker/job-search" className="hover:underline">Job Search</Link>
            <Link to="/jobseeker/companies" className="hover:underline">Companies</Link>
            <Link to="/jobseeker/blogs" className="hover:underline">Blogs</Link>
          </nav>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setIsDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <img
              src={appContext?.jobSeeker?.profile_picture_url || "/placeholder.svg"}
              alt="Avatar"
              className="w-8 h-8 rounded-full border"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-background border rounded shadow-lg z-10">
              <Link
                to="/jobseeker/profile"
                className="block px-4 py-2 hover:bg-muted text-foreground"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/jobseeker/settings"
                className="block px-4 py-2 hover:bg-muted text-foreground"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                className="block w-full text-left px-4 py-2 hover:bg-muted text-foreground border-t"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-2 bg-background">
        {children}
      </main>
      <footer className="w-full bg-muted text-muted-foreground py-6 px-4 mt-8 border-t text-center text-xs">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} EduDiagnoAI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/how-it-works" className="hover:underline">How It Works</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobSeekerLayout;
