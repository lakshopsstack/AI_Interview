import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import JobSeekerLayout from "@/components/layout/JobSeekerLayout";
import { AppContext } from "@/context/AppContext";
import EditEducationModal from "@/components/jobseeker/EditEducationModal";
import EditExperienceModal from "@/components/jobseeker/EditExperienceModal";
import EditProjectModal from "@/components/jobseeker/EditProjectModal";
import EditCertificationModal from "@/components/jobseeker/EditCertificationModal";
import EditHSCEducationModal from "@/components/jobseeker/EditHSCEducationModal";
import EditSSCEducationModal from "@/components/jobseeker/EditSSCEducationModal";
import EditProfileModal from "@/components/jobseeker/EditProfileModal";
import EditInternshipModal from "@/components/jobseeker/EditInternshipModal";
import EditSkillsModal from "@/components/jobseeker/EditSkillsModal";
import EditCareerPreferenceModal from "@/components/jobseeker/EditCareerPreferenceModal";
import EditCompetitiveExamModal from "@/components/jobseeker/EditCompetitiveExamModal";
import EditClubCommitteeModal from "@/components/jobseeker/EditClubCommitteeModal";
import EditResumeModal from "@/components/jobseeker/EditResumeModal";

const fallbackAvatar =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const JobSeekerProfile: React.FC = () => {
  const appContext = useContext(AppContext);
  const jobSeeker = appContext?.jobSeeker;
  const updateJobSeeker = appContext?.updateJobSeeker;
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = React.useState(jobSeeker?.profile_picture_url || fallbackAvatar);

  // Dedicated modal states
  const [eduModal, setEduModal] = useState<{ open: boolean; initial?: any; idx?: number }>({ open: false });
  const [expModal, setExpModal] = useState<{ open: boolean; initial?: any; idx?: number; type?: 'employment' | 'internship' }>({ open: false });
  const [projectModal, setProjectModal] = useState<{ open: boolean; initial?: any; idx?: number }>({ open: false });
  const [certModal, setCertModal] = useState<{ open: boolean; initial?: any; idx?: number }>({ open: false });
  const [hscModal, setHscModal] = useState<{ open: boolean }>({ open: false });
  const [sscModal, setSscModal] = useState<{ open: boolean }>({ open: false });
  const [profileModal, setProfileModal] = useState<{ open: boolean }>({ open: false });
  const [skillsModal, setSkillsModal] = useState<{ open: boolean }>({ open: false });
  const [careerModal, setCareerModal] = useState<{ open: boolean }>({ open: false });
  const [examModal, setExamModal] = useState<{ open: boolean; initial?: any; idx?: number }>({ open: false });
  const [clubModal, setClubModal] = useState<{ open: boolean; initial?: any; idx?: number }>({ open: false });
  const [resumeModal, setResumeModal] = useState<{ open: boolean }>({ open: false });

  // Section list for navbar (remove edit-user-details)
  const sections: { id: string; label: string }[] = [
    { id: "profile-header", label: "Profile" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Skills & Preferences" },
    { id: "achievements", label: "Achievements" },
    { id: "projects", label: "Projects" },
    { id: "resume", label: "Resume" },
  ];

  if (!jobSeeker) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <JobSeekerLayout>
      <EditEducationModal
        open={eduModal.open}
        initialData={eduModal.initial}
        onClose={() => setEduModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.higher_educations) ? [...jobSeeker.higher_educations] : [];
          if (typeof eduModal.idx === 'number') newList[eduModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ higher_educations: newList, id: jobSeeker.id });
        }}
      />
      <EditExperienceModal
        open={expModal.open && expModal.type !== 'internship'}
        initialData={expModal.initial}
        onClose={() => setExpModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.employment_details) ? [...jobSeeker.employment_details] : [];
          if (typeof expModal.idx === 'number') newList[expModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ employment_details: newList, id: jobSeeker.id });
          setExpModal({ open: false });
        }}
      />
      <EditInternshipModal
        open={expModal.open && expModal.type === 'internship'}
        initialData={expModal.initial}
        onClose={() => setExpModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.internships) ? [...jobSeeker.internships] : [];
          if (typeof expModal.idx === 'number') newList[expModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ internships: newList, id: jobSeeker.id });
          setExpModal({ open: false });
        }}
      />
      <EditProjectModal
        open={projectModal.open}
        initialData={projectModal.initial}
        onClose={() => setProjectModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.projects) ? [...jobSeeker.projects] : [];
          if (typeof projectModal.idx === 'number') newList[projectModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ projects: newList, id: jobSeeker.id });
        }}
      />
      <EditCertificationModal
        open={certModal.open}
        initialData={certModal.initial}
        onClose={() => setCertModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.certifications) ? [...jobSeeker.certifications] : [];
          if (typeof certModal.idx === 'number') newList[certModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ certifications: newList, id: jobSeeker.id });
        }}
      />
      <EditHSCEducationModal
        open={hscModal.open}
        initialData={jobSeeker.hsc_education || {}}
        onClose={() => setHscModal({ open: false })}
        onSave={async (data) => {
          if (updateJobSeeker) await updateJobSeeker({ hsc_education: data, id: jobSeeker.id });
        }}
      />
      <EditSSCEducationModal
        open={sscModal.open}
        initialData={jobSeeker.ssc_education || {}}
        onClose={() => setSscModal({ open: false })}
        onSave={async (data) => {
          if (updateJobSeeker) await updateJobSeeker({ ssc_education: data, id: jobSeeker.id });
        }}
      />
      <EditProfileModal
        open={profileModal.open}
        onClose={() => setProfileModal({ open: false })}
        initialData={jobSeeker}
        onSave={async (data) => {
          if (updateJobSeeker) await updateJobSeeker({ ...data, id: jobSeeker.id });
        }}
      />
      <EditSkillsModal
        open={skillsModal.open}
        initialData={{ key_skills: jobSeeker.key_skills || "", languages: jobSeeker.languages || "" }}
        onClose={() => setSkillsModal({ open: false })}
        onSave={async (data) => {
          if (updateJobSeeker) await updateJobSeeker({ ...data, id: jobSeeker.id });
        }}
      />
      <EditCareerPreferenceModal
        open={careerModal.open}
        initialData={{
          preferred_work_location: jobSeeker.preferred_work_location || "",
          career_preference_jobs: !!jobSeeker.career_preference_jobs,
          career_preference_internships: !!jobSeeker.career_preference_internships,
          min_duration_months: typeof jobSeeker.min_duration_months === "number" ? jobSeeker.min_duration_months : undefined,
        }}
        onClose={() => setCareerModal({ open: false })}
        onSave={async (data) => {
          const fixed = { ...data, min_duration_months: data.min_duration_months ?? undefined };
          if (updateJobSeeker) await updateJobSeeker({ ...fixed, id: jobSeeker.id });
        }}
      />
      <EditCompetitiveExamModal
        open={examModal.open}
        initialData={examModal.initial}
        onClose={() => setExamModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.competitive_exams) ? [...jobSeeker.competitive_exams] : [];
          if (typeof examModal.idx === 'number') newList[examModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ competitive_exams: newList, id: jobSeeker.id });
          setExamModal({ open: false });
        }}
      />
      <EditClubCommitteeModal
        open={clubModal.open}
        initialData={clubModal.initial}
        onClose={() => setClubModal({ open: false })}
        onSave={async (data) => {
          let newList = Array.isArray(jobSeeker.clubs_and_committees) ? [...jobSeeker.clubs_and_committees] : [];
          if (typeof clubModal.idx === 'number') newList[clubModal.idx] = data;
          else newList.push(data);
          if (updateJobSeeker) await updateJobSeeker({ clubs_and_committees: newList, id: jobSeeker.id });
          setClubModal({ open: false });
        }}
      />
      <EditResumeModal
        open={resumeModal.open}
        initialData={{ resume_url: jobSeeker.resume_url || "" }}
        onClose={() => setResumeModal({ open: false })}
        onSave={async (data) => {
          if (updateJobSeeker) await updateJobSeeker({ ...data, id: jobSeeker.id });
        }}
      />
      <div className="bg-background min-h-screen py-4">
        <div className="max-w-7xl mx-auto flex flex-row items-start gap-8 px-2 md:px-6">
          {/* Left Navbar */}
          <nav className="hidden md:flex flex-col gap-2 sticky top-24 h-fit min-w-[180px]">
            {sections.map((section: { id: string; label: string }) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-2 rounded hover:bg-primary/10 text-sm font-medium text-foreground transition-colors"
              >
                {section.label}
              </a>
            ))}
          </nav>
          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Header */}
            <div id="profile-header" className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 bg-background rounded-2xl shadow p-6 mb-8">
              <div className="relative group flex-shrink-0 flex flex-col items-center">
                <img
                  className="rounded-full h-28 w-28 object-cover border-4 border-white shadow"
                  src={avatarSrc}
                  alt="Profile"
                  onError={() => setAvatarSrc(fallbackAvatar)}
                />
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || typeof jobSeeker?.id !== "number") return;
                    if (!file.type.startsWith("image/")) {
                      alert("Only image files are allowed.");
                      return;
                    }
                    try {
                      const url = await import("@/services/jobSeekerApi").then(m => m.jobSeekerApi.uploadProfilePicture(jobSeeker.id as number, file));
                      setAvatarSrc(url);
                      if (updateJobSeeker) await updateJobSeeker({ profile_picture_url: url, id: jobSeeker.id });
                    } catch {
                      alert("Failed to upload profile picture.");
                    }
                  }}
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-100 group-hover:scale-105 transition-all cursor-pointer z-30"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
                >
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-300 shadow text-black text-xs font-semibold hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Update Photo</span>
                  </div>
                </label>
                <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-background px-2 py-1 rounded shadow border z-10 pointer-events-none whitespace-nowrap">
                  JPG, PNG, or GIF. Max 2MB.
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-2 items-center md:items-start w-full">
                <div className="flex items-center gap-2 w-full justify-between">
                  <div className="text-2xl font-bold">
                    {(jobSeeker.firstname || "") + " " + (jobSeeker.lastname || "")}
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => setProfileModal({ open: true })}>Edit</Button>
                </div>
                <div className="text-sm mt-2 text-center md:text-left">
                  {jobSeeker.profile_summary || ""}
                </div>
              </div>
            </div>

            {/* Contact & Personal Details Section */}
            <div className="max-w-5xl mx-auto mb-8 bg-background rounded-2xl shadow" id="personal-details">
              <h2 className="text-lg font-semibold mb-2 text-foreground px-6 pt-6 flex items-center justify-between">
                Contact & Personal Details
                <Button size="sm" variant="outline" onClick={() => setProfileModal({ open: true })}>Edit</Button>
              </h2>
              <Card className="bg-background shadow-none border-none">
                <CardContent className="py-4 px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                      <span className="block text-xs text-muted-foreground">Email</span>
                      <span className="font-medium">{jobSeeker.email || ""}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Phone</span>
                      <span className="font-medium">{jobSeeker.phone || ""}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Location</span>
                      <span className="font-medium">{jobSeeker.current_location || ""}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Date of Birth</span>
                      <span className="font-medium">{
                        jobSeeker.date_of_birth ?
                        (new Date(jobSeeker.date_of_birth)).toLocaleDateString() :
                        "Not Provided"
                      }</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Gender</span>
                      <span className="font-medium capitalize">{jobSeeker.gender?.toLowerCase() || ""}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">Country</span>
                      <span className="font-medium">{jobSeeker.country || ""}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section: Education & Achievements */}
            <div id="education" className="max-w-5xl mx-auto mb-8">
              <h2 className="text-lg font-semibold mb-2 text-foreground flex items-center justify-between">
                Education & Achievements
                <Button size="sm" variant="outline" onClick={() => setEduModal({ open: true })}>Add</Button>
              </h2>
              {/* Higher Education - full width, entries as cards */}
              <div className="mb-6">
                <div className="font-bold mb-2">Higher Education</div>
                {Array.isArray(jobSeeker.higher_educations) && jobSeeker.higher_educations.length > 0 ? (
                  jobSeeker.higher_educations.map((edu, idx) => (
                    <Card key={edu.id || idx}>
                      <CardContent className="text-sm flex flex-col gap-1 py-4">
                        <div className="font-semibold">Degree: {edu.course_name}</div>
                        <div>College: {edu.college_name}</div>
                        <div>Duration: {edu.starting_year} - {edu.passing_year}</div>
                        <div>Type: {edu.course_type}</div>
                        <Button size="sm" variant="outline" className="mt-2 self-end" onClick={() => setEduModal({ open: true, initial: edu, idx })}>Edit</Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-muted-foreground italic py-4">No higher education details added yet.</CardContent>
                  </Card>
                )}
              </div>
              {/* HSC */}
              <div className="mb-6">
                <div className="font-bold mb-2 flex items-center justify-between">HSC
                  <Button size="sm" variant="outline" onClick={() => setHscModal({ open: true })}>Edit</Button>
                </div>
                {jobSeeker.hsc_education ? (
                  <Card>
                    <CardContent className="text-sm flex flex-col gap-1 py-4">
                      <div className="font-semibold">Board: {jobSeeker.hsc_education?.examination_board || ""}</div>
                      <div>Medium: {jobSeeker.hsc_education?.medium_of_study || ""}</div>
                      <div>Percentage: {jobSeeker.hsc_education?.actual_percentage || ""}%</div>
                      <div>Passing Year: {jobSeeker.hsc_education?.passing_year || ""}</div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-muted-foreground italic py-4">No HSC details added yet.</CardContent>
                  </Card>
                )}
              </div>
              {/* SSC */}
              <div>
                <div className="font-bold mb-2 flex items-center justify-between">SSC
                  <Button size="sm" variant="outline" onClick={() => setSscModal({ open: true })}>Edit</Button>
                </div>
                {jobSeeker.ssc_education ? (
                  <Card>
                    <CardContent className="text-sm flex flex-col gap-1 py-4">
                      <div className="font-semibold">Board: {jobSeeker.ssc_education?.examination_board || ""}</div>
                      <div>Medium: {jobSeeker.ssc_education?.medium_of_study || ""}</div>
                      <div>Percentage: {jobSeeker.ssc_education?.actual_percentage || ""}%</div>
                      <div>Passing Year: {jobSeeker.ssc_education?.passing_year || ""}</div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-muted-foreground italic py-4">No SSC details added yet.</CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Section: Experience */}
            <div id="experience" className="max-w-5xl mx-auto mb-8">
              <h2 className="text-lg font-semibold mb-2 text-foreground flex items-center justify-between">
                Experience
                <Button size="sm" variant="outline" onClick={() => setExpModal({ open: true, type: 'employment' })}>Add</Button>
              </h2>
              {/* Employment - full width, entries as cards */}
              <div className="mb-6">
                <div className="font-bold mb-2">Employment Details</div>
                {Array.isArray(jobSeeker.employment_details) && jobSeeker.employment_details.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {jobSeeker.employment_details.map((job, idx) => (
                      <Card key={job.id || idx}>
                        <CardContent className="text-sm flex flex-col gap-1 py-4">
                          <div className="font-semibold">{job.designation}, {job.company_name}</div>
                          <div>Duration: {job.starting_month} {job.starting_year} - {job.ending_month} {job.ending_year || 'Present'}</div>
                          <div>Role: {job.work_description}</div>
                          <div>Experience: {job.experience_years || 0} years {job.experience_months || 0} months</div>
                          <div>Currently Working: {job.is_currently_working ? 'Yes' : 'No'}</div>
                          <Button size="sm" variant="outline" className="mt-2 self-end" onClick={() => setExpModal({ open: true, initial: job, idx, type: 'employment' })}>Edit</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-muted-foreground italic py-4">No employment details added yet.</CardContent>
                  </Card>
                )}
              </div>
              {/* Internships - full width, entries as cards */}
              <div>
                <div className="font-bold mb-2 flex items-center justify-between">
                  Internships
                  <Button size="sm" variant="outline" onClick={() => setExpModal({ open: true, type: 'internship' })}>Add</Button>
                </div>
                {Array.isArray(jobSeeker.internships) && jobSeeker.internships.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {jobSeeker.internships.map((intern, idx) => (
                      <Card key={intern.id || idx}>
                        <CardContent className="text-sm flex flex-col gap-1 py-4">
                          <div className="font-semibold">{intern.company_name}</div>
                          <div>Duration: {intern.starting_month} {intern.starting_year} - {intern.ending_month} {intern.ending_year}</div>
                          <div>Project: {intern.project_name}</div>
                          <div>Role: {intern.work_description}</div>
                          <div>Key Skills: {intern.key_skills}</div>
                          <div>Project URL: {intern.project_url}</div>
                          <Button size="sm" variant="outline" className="mt-2 self-end" onClick={() => setExpModal({ open: true, initial: intern, idx, type: 'internship' })}>Edit</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-muted-foreground italic py-4">No internships added yet.</CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Section: Skills & Preferences */}
            <div id="skills" className="max-w-5xl mx-auto mb-8">
              <h2 className="text-lg font-semibold mb-2 text-foreground flex items-center justify-between">
                Skills & Preferences
                <Button size="sm" variant="outline" onClick={() => setSkillsModal({ open: true })}>Edit</Button>
              </h2>
              {/* Key Skills - pills */}
              <div className="mb-6">
                <div className="font-bold mb-2">Key Skills</div>
                {jobSeeker.key_skills && jobSeeker.key_skills.split(",").map(s => s.trim()).filter(Boolean).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {jobSeeker.key_skills.split(",").map((skill, i) => skill.trim()).filter(Boolean).map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-muted text-xs font-medium">{skill}</span>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">({jobSeeker.key_skills.split(",").map(s => s.trim()).filter(Boolean).length})</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No key skills added yet.</span>
                )}
              </div>
              {/* Languages - pills */}
              <div className="mb-6">
                <div className="font-bold mb-2">Languages</div>
                {jobSeeker.languages && jobSeeker.languages.split(",").map(l => l.trim()).filter(Boolean).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {jobSeeker.languages.split(",").map((lang, i) => lang.trim()).filter(Boolean).map((lang, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-muted text-xs font-medium">{lang}</span>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">({jobSeeker.languages.split(",").map(l => l.trim()).filter(Boolean).length})</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No languages added yet.</span>
                )}
              </div>
              {/* Career Preference - full width card */}
              <div>
                <div className="font-bold mb-2 flex items-center justify-between">
                  Career Preference
                  <Button size="sm" variant="outline" onClick={() => setCareerModal({ open: true })}>Edit</Button>
                </div>
                <Card>
                  <CardContent className="text-sm flex flex-col gap-1 py-4">
                    <div>
                      <span className="font-semibold">Preferred Location:</span> {jobSeeker.preferred_work_location || <span className="text-muted-foreground italic">Not specified</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Looking For:</span> {[
                        jobSeeker.career_preference_internships ? "Internship" : null,
                        jobSeeker.career_preference_jobs ? "Full-time Job" : null
                      ].filter(Boolean).join(", ") || <span className="text-muted-foreground italic">Not specified</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Minimum Duration (months):</span> {typeof jobSeeker.min_duration_months === "number" ? jobSeeker.min_duration_months : <span className="text-muted-foreground italic">Not specified</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section: Achievements & More */}
            <div id="achievements" className="max-w-5xl mx-auto mb-8">
              <h2 className="text-lg font-semibold mb-2 text-foreground">Achievements & More</h2>
              {/* Certifications - full width, entries as cards */}
              <div className="mb-6">
                <div className="font-bold mb-2 flex items-center justify-between">
                  Certifications
                  <Button size="sm" variant="outline" onClick={() => setCertModal({ open: true })}>Add</Button>
                </div>
                <div className="flex flex-col gap-4">
                  {Array.isArray(jobSeeker.certifications) && jobSeeker.certifications.length > 0 ? (
                    jobSeeker.certifications.map((cert, idx) => (
                      <Card key={cert.id || idx}>
                        <CardContent className="text-sm flex flex-col gap-1 py-4">
                          <div className="font-semibold">{cert.certification_name}</div>
                          <div>Issued by: {cert.certification_provider}</div>
                          <div>Completion ID: {cert.completion_id}</div>
                          <div>Certification URL: {cert.certification_url}</div>
                          <div>Start: {cert.starting_month ? cert.starting_month + "/" : ""}{cert.starting_year}</div>
                          <div>End: {cert.ending_month ? cert.ending_month + "/" : ""}{cert.ending_year}</div>
                          <div>Expires: {cert.certificate_expires ? "Yes" : "No"}</div>
                          <Button size="sm" variant="outline" className="mt-2 self-end" onClick={() => setCertModal({ open: true, initial: cert, idx })}>Edit</Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-muted-foreground italic py-4">No certifications added yet.</CardContent>
                    </Card>
                  )}
                </div>
              </div>
              {/* Clubs & Committees - full width, entries as cards */}
              <div className="mb-6">
                <div className="font-bold mb-2 flex items-center justify-between">
                  Clubs & Committees
                  <Button size="sm" variant="outline" onClick={() => setClubModal({ open: true })}>Add</Button>
                </div>
                <div className="flex flex-col gap-4">
                  {Array.isArray(jobSeeker.clubs_and_committees) && jobSeeker.clubs_and_committees.length > 0 ? (
                    jobSeeker.clubs_and_committees.map((club, idx) => (
                      <Card key={club.id || idx}>
                        <CardContent className="text-sm flex flex-col gap-1 py-4">
                          <div className="font-semibold">{club.committee_name} - {club.position}</div>
                          <div>Role: {club.responsibility_description}</div>
                          <div>Duration: {club.starting_month ? club.starting_month + "/" : ""}{club.starting_year} - {club.ending_month ? club.ending_month + "/" : ""}{club.ending_year}</div>
                          <div>Currently Working: {club.is_currently_working ? 'Yes' : 'No'}</div>
                          <Button size="sm" variant="outline" className="mt-2 self-end" onClick={() => setClubModal({ open: true, initial: club, idx })}>Edit</Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-muted-foreground italic py-4">No clubs or committees added yet.</CardContent>
                    </Card>
                  )}
                </div>
              </div>
              {/* Competitive Exams - full width, entries as cards */}
              <div>
                <div className="font-bold mb-2 flex items-center justify-between">
                  Competitive Exams
                  <Button size="sm" variant="outline" onClick={() => setExamModal({ open: true })}>Add</Button>
                </div>
                <div className="flex flex-col gap-4">
                  {Array.isArray(jobSeeker.competitive_exams) && jobSeeker.competitive_exams.length > 0 ? (
                    jobSeeker.competitive_exams.map((exam, idx) => (
                      <Card key={exam.id || idx}>
                        <CardContent className="text-sm flex flex-col gap-1 py-4">
                          <div className="font-semibold">{exam.exam_label}</div>
                          <div>Score: {exam.score}</div>
                          <Button size="sm" variant="outline" className="mt-2 self-end" onClick={() => setExamModal({ open: true, initial: exam, idx })}>Edit</Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-muted-foreground italic py-4">No competitive exams added yet.</CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
            {/* Section: Projects */}
            <div id="projects" className="max-w-5xl mx-auto mb-8">
              <h2 className="text-lg font-semibold mb-2 text-foreground flex items-center justify-between">
                Projects
                <Button size="sm" variant="outline" onClick={() => setProjectModal({ open: true })}>Add</Button>
              </h2>
              <div className="flex flex-col gap-4">
                {Array.isArray(jobSeeker.projects) && jobSeeker.projects.length > 0 ? (
                  jobSeeker.projects.map((proj, idx) => (
                    <Card key={proj.id || idx}>
                      <CardContent className="text-sm py-4 flex flex-col gap-1">
                        <div className="font-bold">{proj.project_name}</div>
                        <div>Duration: {proj.starting_month}/{proj.starting_year} - {proj.ending_month}/{proj.ending_year}</div>
                        <div>Description: {proj.project_description}</div>
                        <div>Key Skills: {proj.key_skills}</div>
                        <div>Project URL: {proj.project_url}</div>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => setProjectModal({ open: true, initial: proj, idx })}>Edit</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-muted-foreground italic py-4">No projects added yet.</CardContent>
                  </Card>
                )}
              </div>
            </div>
            {/* Section: Resume */}
            <div id="resume" className="max-w-5xl mx-auto mb-8">
              <h2 className="text-lg font-semibold mb-2 text-foreground flex items-center justify-between">
                Resume
                <Button size="sm" variant="outline" onClick={() => setResumeModal({ open: true })}>Edit</Button>
              </h2>
              <Card>
                <CardHeader className="font-bold">Resume</CardHeader>
                <CardContent className="text-sm flex items-center gap-2">
                  <span className="rounded-full p-2">📄</span>
                  {jobSeeker.resume_url ? (
                    <>
                      <span className="mr-4">Current Resume.pdf</span>
                      <a href={jobSeeker.resume_url} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">No resume uploaded yet.</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <style>{`html { scroll-behavior: smooth; }`}</style>
      </div>
    </JobSeekerLayout>
  );
}

export default JobSeekerProfile;
