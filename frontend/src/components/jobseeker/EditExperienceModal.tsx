import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EmploymentDetail } from "@/types/jobSeeker";

interface EditExperienceModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: EmploymentDetail;
  onSave: (data: EmploymentDetail) => void;
}

const defaultExp: EmploymentDetail = {
  company_name: "",
  designation: "",
  starting_month: undefined,
  starting_year: undefined,
  ending_month: undefined,
  ending_year: undefined,
  is_currently_working: false,
  work_description: "",
  experience_years: undefined,
  experience_months: undefined,
};

const EditExperienceModal: React.FC<EditExperienceModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<EmploymentDetail>(initialData || defaultExp);
  const [saving, setSaving] = useState(false);

  // Reset form when initialData or open changes
  useEffect(() => {
    setForm(initialData || defaultExp);
  }, [initialData, open]);

  const handleChange = (key: keyof EmploymentDetail, value: any) => {
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Employment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Company Name</Label>
            <Input value={form.company_name || ""} onChange={e => handleChange("company_name", e.target.value)} required />
          </div>
          <div>
            <Label>Designation</Label>
            <Input value={form.designation || ""} onChange={e => handleChange("designation", e.target.value)} required />
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
          <div className="flex items-center gap-2">
            <Checkbox id="currently-working" checked={!!form.is_currently_working} onCheckedChange={checked => handleChange("is_currently_working", checked as boolean)} />
            <Label htmlFor="currently-working">Currently Working</Label>
          </div>
          <div>
            <Label>Work Description</Label>
            <Input value={form.work_description || ""} onChange={e => handleChange("work_description", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Experience Years</Label>
              <Input type="number" value={form.experience_years || ""} onChange={e => handleChange("experience_years", Number(e.target.value))} />
            </div>
            <div className="flex-1">
              <Label>Experience Months</Label>
              <Input type="number" value={form.experience_months || ""} onChange={e => handleChange("experience_months", Number(e.target.value))} />
            </div>
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

export default EditExperienceModal;
