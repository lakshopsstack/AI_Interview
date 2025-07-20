import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { JobSeekerData } from "@/types/jobSeeker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { jobSeekerApi } from "@/services/jobSeekerApi";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Partial<JobSeekerData>;
  onSave: (data: Partial<JobSeekerData>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<Partial<JobSeekerData>>(initialData);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setForm(initialData);
  }, [initialData, open]);

  const handleChange = (key: keyof JobSeekerData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Remove string fields with empty string values
    const filteredForm = Object.fromEntries(
      Object.entries(form).filter(
        ([_, v]) => !(typeof v === "string" && v === "")
      )
    );
    try {
      await onSave(filteredForm);
      onClose();
    } catch (err: any) {
      toast.error(
        err.detail ? err.detail : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>First Name</Label>
            <Input value={form.firstname || ""} onChange={e => handleChange("firstname", e.target.value)} required />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.lastname || ""} onChange={e => handleChange("lastname", e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email || ""} onChange={e => handleChange("email", e.target.value)} required />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone || ""} onChange={e => handleChange("phone", e.target.value)} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={form.current_location || ""} onChange={e => handleChange("current_location", e.target.value)} />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" value={form.date_of_birth || ""} onChange={e => handleChange("date_of_birth", e.target.value)} />
          </div>
          <div>
            <Label>Gender</Label>
            <Input value={form.gender || ""} onChange={e => handleChange("gender", e.target.value)} />
          </div>
          <div>
            <Label>Country</Label>
            <Input value={form.country || ""} onChange={e => handleChange("country", e.target.value)} />
          </div>
          <div>
            <Label>Profile Summary</Label>
            <Input value={form.profile_summary || ""} onChange={e => handleChange("profile_summary", e.target.value)} />
          </div>
          <div>
            <Label>Work Experience (years)</Label>
            <Input
              type="number"
              min={0}
              value={form.work_experience_yrs ?? ""}
              onChange={e => handleChange("work_experience_yrs", e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g. 2"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
