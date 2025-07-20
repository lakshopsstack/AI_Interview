import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Project {
  id?: number;
  project_name?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  project_description?: string;
  key_skills?: string;
  project_url?: string;
}

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Project;
  onSave: (data: Project) => void;
}

const defaultProject: Project = {
  project_name: "",
  starting_month: undefined,
  starting_year: undefined,
  ending_month: undefined,
  ending_year: undefined,
  project_description: "",
  key_skills: "",
  project_url: "",
};

const EditProjectModal: React.FC<EditProjectModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<Project>(initialData || defaultProject);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData || defaultProject);
  }, [initialData, open]);

  const handleChange = (key: keyof Project, value: any) => {
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Project Name</Label>
            <Input value={form.project_name || ""} onChange={e => handleChange("project_name", e.target.value)} required />
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
            <Label>Description</Label>
            <Input value={form.project_description || ""} onChange={e => handleChange("project_description", e.target.value)} />
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

export default EditProjectModal;
