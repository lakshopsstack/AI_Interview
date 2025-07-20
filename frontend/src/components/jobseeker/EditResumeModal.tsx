import React, { useState, useEffect, useRef, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { AppContext } from "@/context/AppContext";

interface EditResumeModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: { resume_url?: string };
  onSave: (data: { resume_url: string }) => void;
}

const defaultResume = { resume_url: "" };
const normalizeResume = (data?: { resume_url?: string }) => ({
  resume_url: data?.resume_url ?? "",
});

const EditResumeModal: React.FC<EditResumeModalProps> = ({ open, onClose, initialData, onSave }) => {
  const appContext = useContext(AppContext);
  const jobSeeker = appContext?.jobSeeker;

  const [form, setForm] = useState<{ resume_url: string }>(normalizeResume(initialData));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(normalizeResume(initialData));
    setUploadedFileName("");
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPendingFile(file);
    setUploadedFileName(file.name);
    // Do not upload yet, wait for Save
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let resumeUrl = form.resume_url;
    if (pendingFile && jobSeeker?.id) {
      setUploading(true);
      try {
        resumeUrl = await jobSeekerApi.uploadResume(jobSeeker.id, pendingFile);
        setForm({ resume_url: resumeUrl });
      } catch (err) {
        alert("Failed to upload resume. Please try again.");
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    await onSave({ resume_url: resumeUrl });
    setSaving(false);
    setPendingFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Resume File (PDF, DOCX, etc.)</Label>
            <Input type="file" accept=".pdf,application/pdf" ref={fileInputRef} onChange={handleFileChange} disabled={uploading || saving} />
            {uploading && <div className="text-xs text-muted-foreground mt-1">Uploading...</div>}
            {form.resume_url && uploadedFileName && !uploading && (
              <div className="text-xs text-green-700 mt-1">Uploaded: {uploadedFileName}</div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving || uploading}>Cancel</Button>
            <Button type="submit" disabled={saving || uploading || (!form.resume_url && !pendingFile)}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditResumeModal;
