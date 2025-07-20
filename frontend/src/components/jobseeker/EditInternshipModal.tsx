import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Internship } from "@/types/jobSeeker";

interface EditInternshipModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Internship;
  onSave: (data: Internship) => void;
}

const defaultIntern: Internship = {
  company_name: "",
  starting_month: undefined,
  starting_year: undefined,
  ending_month: undefined,
  ending_year: undefined,
  project_name: "",
  work_description: "",
  key_skills: "",
  project_url: "",
};

const EditInternshipModal: React.FC<EditInternshipModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<Internship>(initialData || defaultIntern);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData || defaultIntern);
  }, [initialData, open]);

  const handleChange = (key: keyof Internship, value: any) => {
    setForm((prev: Internship) => ({ ...prev, [key]: value }));
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Internship</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Company Name</Label>
            <Input value={form.company_name || ""} onChange={e => handleChange("company_name", e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Starting Month</Label>
              <Input type="number" value={form.starting_month || ""} onChange={e => handleChange("starting_month", Number(e.target.value))} required />
            </div>
            <div className="flex-1">
              <Label>Starting Year</Label>
              <Input type="number" value={form.starting_year || ""} onChange={e => handleChange("starting_year", Number(e.target.value))} required />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Ending Month</Label>
              <Input type="number" value={form.ending_month || ""} onChange={e => handleChange("ending_month", Number(e.target.value))} />
            </div>
            <div className="flex-1">
              <Label>Ending Year</Label>
              <Input type="number" value={form.ending_year || ""} onChange={e => handleChange("ending_year", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Project Name</Label>
            <Input value={form.project_name || ""} onChange={e => handleChange("project_name", e.target.value)} />
          </div>
          <div>
            <Label>Work Description</Label>
            <Input value={form.work_description || ""} onChange={e => handleChange("work_description", e.target.value)} />
          </div>
          <div>
            <Label>Key Skills</Label>
            <Input value={form.key_skills || ""} onChange={e => handleChange("key_skills", e.target.value)} />
          </div>
          <div>
            <Label>Project URL</Label>
            <Input value={form.project_url || ""} onChange={e => handleChange("project_url", e.target.value)} />
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

export default EditInternshipModal;
