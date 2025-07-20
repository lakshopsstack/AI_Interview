import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditSkillsModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: { key_skills?: string; languages?: string };
  onSave: (data: { key_skills: string; languages: string }) => void;
}

const defaultSkills = { key_skills: "", languages: "" };
const normalizeSkills = (data?: { key_skills?: string; languages?: string }) => ({
  key_skills: data?.key_skills ?? "",
  languages: data?.languages ?? "",
});

const EditSkillsModal: React.FC<EditSkillsModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<{ key_skills: string; languages: string }>(normalizeSkills(initialData));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(normalizeSkills(initialData));
  }, [initialData, open]);

  const handleChange = (key: "key_skills" | "languages", value: string) => {
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
          <DialogTitle>Edit Key Skills & Languages</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Key Skills (comma separated)</Label>
            <Input value={form.key_skills} onChange={e => handleChange("key_skills", e.target.value)} placeholder="e.g. Python, React, SQL" />
          </div>
          <div>
            <Label>Languages (comma separated)</Label>
            <Input value={form.languages} onChange={e => handleChange("languages", e.target.value)} placeholder="e.g. English, Hindi" />
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

export default EditSkillsModal;
