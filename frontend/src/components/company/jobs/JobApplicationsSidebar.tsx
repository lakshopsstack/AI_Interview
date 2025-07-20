import React, { useEffect, useState } from "react";
import { companyApi } from "@/services/companyApi";
import { User, Mail, Phone, MapPin, Award, FileText, Globe, Briefcase } from "lucide-react";

function renderBadges(value: string | undefined, color: string = "bg-blue-100 text-blue-800") {
  if (!value) return <span className="text-muted-foreground">Not specified</span>;
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {value.split(",").map((item, idx) => (
        <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{item.trim()}</span>
      ))}
    </div>
  );
}

function CandidateDetailsModal({ candidate, onClose }: { candidate: any, onClose: () => void }) {
  if (!candidate) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-4xl min-h-[60vh] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <img
              src={candidate.profile_picture_url || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
            />
            <div className="mt-4 text-center md:text-left">
              <div className="text-2xl font-bold break-words whitespace-pre-wrap max-w-xs">{candidate.firstname} {candidate.lastname}</div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1"><Mail size={16} />{candidate.email}</div>
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Phone size={16} />{candidate.phone}</div>
            </div>
            {candidate.resume_url && (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
              >
                <FileText className="inline-block mr-2" size={16} />View Resume
              </a>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="font-semibold flex items-center gap-2 mb-1"><User size={18} />Personal Info</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span className="font-medium">Gender:</span> {candidate.gender || '-'}</div>
                <div><span className="font-medium">DOB:</span> {candidate.date_of_birth || '-'}</div>
                <div><span className="font-medium">Location:</span> {candidate.current_location || '-'}</div>
                <div><span className="font-medium">Home Town:</span> {candidate.home_town || '-'}</div>
                <div><span className="font-medium">Country:</span> {candidate.country || '-'}</div>
                <div><span className="font-medium">Work Exp (yrs):</span> {candidate.work_experience_yrs ?? '-'}</div>
              </div>
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2 mb-1"><Briefcase size={18} />Key Skills</div>
              {renderBadges(candidate.key_skills, "bg-blue-100 text-blue-800")}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2 mb-1"><Globe size={18} />Languages</div>
              {renderBadges(candidate.languages, "bg-green-100 text-green-800")}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2 mb-1"><Award size={18} />Awards & Accomplishments</div>
              <div className="text-sm">{candidate.awards_and_accomplishments || '-'}</div>
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2 mb-1"><FileText size={18} />Profile Summary</div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm">{candidate.profile_summary || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobApplicationsSidebar({ jobId }: { jobId: string }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    companyApi.getJobApplications(jobId).then(setApplications).finally(() => setLoading(false));
  }, [jobId]);

  const viewCandidate = async (applicationId: number) => {
    const res = await companyApi.getCandidateDetailsForApplication(applicationId);
    setCandidate(res);
    setModalOpen(true);
  };

  if (loading) return <div>Loading applications...</div>;
  if (!applications.length) return <div>No applications yet.</div>;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-bold mb-4">Applications</h2>
      <ul className="space-y-4">
        {applications.map(app => (
          <li key={app.id} className="flex items-center gap-3 border-b pb-2">
            <img
              src={app.job_seeker.profile_picture_url || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold">{app.job_seeker.firstname} {app.job_seeker.lastname}</div>
              <div className="text-xs text-gray-500">{app.job_seeker.email}</div>
              <div className="text-xs text-gray-500">{app.job_seeker.phone}</div>
              <div className="text-xs text-blue-600">{app.status}</div>
              {app.resume_url && (
                <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">Resume</a>
              )}
            </div>
            <button
              className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
              onClick={() => viewCandidate(app.id)}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>
      {modalOpen && candidate && (
        <CandidateDetailsModal candidate={candidate} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}