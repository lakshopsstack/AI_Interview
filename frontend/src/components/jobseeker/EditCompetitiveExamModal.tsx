import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompetitiveExam } from "@/types/jobSeeker";

interface EditCompetitiveExamModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: CompetitiveExam;
  onSave: (data: CompetitiveExam) => void;
}

const defaultExam: CompetitiveExam = {
  exam_label: "",
  score: "",
};

const EditCompetitiveExamModal: React.FC<EditCompetitiveExamModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<CompetitiveExam>(initialData || defaultExam);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData || defaultExam);
  }, [initialData, open]);

  const handleChange = (key: keyof CompetitiveExam, value: any) => {
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Competitive Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Exam Name</Label>
            <Input value={form.exam_label || ""} onChange={e => handleChange("exam_label", e.target.value)} required />
          </div>
          <div>
            <Label>Score</Label>
            <Input value={form.score || ""} onChange={e => handleChange("score", e.target.value)} />
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

export default EditCompetitiveExamModal;
