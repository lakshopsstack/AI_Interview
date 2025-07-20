import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EditCareerPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    preferred_work_location?: string;
    career_preference_jobs?: boolean;
    career_preference_internships?: boolean;
    min_duration_months?: number;
  };
  onSave: (data: {
    preferred_work_location: string;
    career_preference_jobs: boolean;
    career_preference_internships: boolean;
    min_duration_months: number | null;
  }) => void;
}

const defaultCareer = {
  preferred_work_location: "",
  career_preference_jobs: false,
  career_preference_internships: false,
  min_duration_months: null as number | null,
};

const EditCareerPreferenceModal: React.FC<EditCareerPreferenceModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<typeof defaultCareer>({ ...defaultCareer, ...initialData });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...defaultCareer, ...initialData });
  }, [initialData, open]);

  const handleChange = (key: keyof typeof defaultCareer, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Career Preference</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Preferred Work Location</Label>
            <Input value={form.preferred_work_location} onChange={e => handleChange("preferred_work_location", e.target.value)} placeholder="e.g. Mumbai, Remote" />
          </div>
          <div className="flex gap-4 items-center">
            <Checkbox id="jobs" checked={!!form.career_preference_jobs} onCheckedChange={checked => handleChange("career_preference_jobs", !!checked)} />
            <Label htmlFor="jobs">Full-time Job</Label>
            <Checkbox id="internships" checked={!!form.career_preference_internships} onCheckedChange={checked => handleChange("career_preference_internships", !!checked)} />
            <Label htmlFor="internships">Internship</Label>
          </div>
          <div>
            <Label>Minimum Duration (months)</Label>
            <Input type="number" value={form.min_duration_months ?? ""} onChange={e => handleChange("min_duration_months", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 6" min={0} />
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

export default EditCareerPreferenceModal;
