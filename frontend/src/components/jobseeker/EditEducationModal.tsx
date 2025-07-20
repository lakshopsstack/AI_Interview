import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HigherEducation } from "@/types/jobSeeker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditEducationModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: HigherEducation;
  onSave: (data: HigherEducation) => void;
}

const defaultEdu: HigherEducation = {
  course_name: "",
  college_name: "",
  starting_year: undefined,
  passing_year: undefined,
  course_type: "",
};

const EditEducationModal: React.FC<EditEducationModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<HigherEducation>(initialData || defaultEdu);
  const [saving, setSaving] = useState(false);

  // Update form state when initialData changes
  useEffect(() => {
    setForm(initialData || defaultEdu);
  }, [initialData, open]);

  const handleChange = (key: keyof HigherEducation, value: any) => {
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Higher Education</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Course Name</Label>
            <Input value={form.course_name || ""} onChange={e => handleChange("course_name", e.target.value)} required />
          </div>
          <div>
            <Label>College Name</Label>
            <Input value={form.college_name || ""} onChange={e => handleChange("college_name", e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Starting Year</Label>
              <Input type="number" value={form.starting_year || ""} onChange={e => handleChange("starting_year", Number(e.target.value))} required />
            </div>
            <div className="flex-1">
              <Label>Passing Year</Label>
              <Input type="number" value={form.passing_year || ""} onChange={e => handleChange("passing_year", Number(e.target.value))} required />
            </div>
          </div>
          <div>
            <Label>Course Type</Label>
            <Input value={form.course_type || ""} onChange={e => handleChange("course_type", e.target.value)} />
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

export default EditEducationModal;
