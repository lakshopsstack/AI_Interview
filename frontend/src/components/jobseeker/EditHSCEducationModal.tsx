import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HSCEducation } from "@/types/jobSeeker";
import { toast } from "sonner";

interface EditHSCEducationModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Partial<HSCEducation>;
  onSave: (data: Partial<HSCEducation>) => Promise<void>;
}

const EditHSCEducationModal: React.FC<EditHSCEducationModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<Partial<HSCEducation>>(initialData || {});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setForm(initialData || {});
  }, [initialData, open]);

  const handleChange = (key: keyof HSCEducation, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      toast.error(err.detail ? err.detail : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit HSC Education</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Examination Board</Label>
            <Input value={form.examination_board || ""} onChange={e => handleChange("examination_board", e.target.value)} />
          </div>
          <div>
            <Label>Medium of Study</Label>
            <Input value={form.medium_of_study || ""} onChange={e => handleChange("medium_of_study", e.target.value)} />
          </div>
          <div>
            <Label>Actual Percentage</Label>
            <Input value={form.actual_percentage || ""} onChange={e => handleChange("actual_percentage", e.target.value)} />
          </div>
          <div>
            <Label>Passing Year</Label>
            <Input type="number" value={form.passing_year || ""} onChange={e => handleChange("passing_year", Number(e.target.value))} />
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

export default EditHSCEducationModal;
