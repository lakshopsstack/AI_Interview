import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClubAndCommittee } from "@/types/jobSeeker";

interface EditClubCommitteeModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: ClubAndCommittee;
  onSave: (data: ClubAndCommittee) => void;
}

const defaultClub: ClubAndCommittee = {
  committee_name: "",
  position: "",
  starting_month: undefined,
  starting_year: undefined,
  ending_month: undefined,
  ending_year: undefined,
  is_currently_working: false,
  responsibility_description: "",
};

const EditClubCommitteeModal: React.FC<EditClubCommitteeModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<ClubAndCommittee>(initialData || defaultClub);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData || defaultClub);
  }, [initialData, open]);

  const handleChange = (key: keyof ClubAndCommittee, value: any) => {
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Club/Committee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Committee Name</Label>
            <Input value={form.committee_name || ""} onChange={e => handleChange("committee_name", e.target.value)} required />
          </div>
          <div>
            <Label>Position</Label>
            <Input value={form.position || ""} onChange={e => handleChange("position", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Starting Month</Label>
              <Input type="number" value={form.starting_month || ""} onChange={e => handleChange("starting_month", Number(e.target.value))} />
            </div>
            <div className="flex-1">
              <Label>Starting Year</Label>
              <Input type="number" value={form.starting_year || ""} onChange={e => handleChange("starting_year", Number(e.target.value))} />
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
            <Label>Currently Working</Label>
            <input type="checkbox" checked={!!form.is_currently_working} onChange={e => handleChange("is_currently_working", e.target.checked)} />
          </div>
          <div>
            <Label>Responsibility Description</Label>
            <Input value={form.responsibility_description || ""} onChange={e => handleChange("responsibility_description", e.target.value)} />
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

export default EditClubCommitteeModal;
