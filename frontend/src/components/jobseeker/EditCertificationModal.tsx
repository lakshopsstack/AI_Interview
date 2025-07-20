import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Certification {
  id?: number;
  certification_name?: string;
  certification_provider?: string;
  completion_id?: string;
  certification_url?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  certificate_expires?: boolean;
}

interface EditCertificationModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Certification;
  onSave: (data: Certification) => void;
}

const defaultCert: Certification = {
  certification_name: "",
  certification_provider: "",
  completion_id: "",
  certification_url: "",
  starting_month: undefined,
  starting_year: undefined,
  ending_month: undefined,
  ending_year: undefined,
  certificate_expires: false,
};

const EditCertificationModal: React.FC<EditCertificationModalProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<Certification>(initialData || defaultCert);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData || defaultCert);
  }, [initialData, open]);

  const handleChange = (key: keyof Certification, value: any) => {
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
          <DialogTitle>{form.id ? "Edit" : "Add"} Certification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Certification Name</Label>
            <Input value={form.certification_name || ""} onChange={e => handleChange("certification_name", e.target.value)} required />
          </div>
          <div>
            <Label>Provider</Label>
            <Input value={form.certification_provider || ""} onChange={e => handleChange("certification_provider", e.target.value)} />
          </div>
          <div>
            <Label>Completion ID</Label>
            <Input value={form.completion_id || ""} onChange={e => handleChange("completion_id", e.target.value)} />
          </div>
          <div>
            <Label>Certification URL</Label>
            <Input value={form.certification_url || ""} onChange={e => handleChange("certification_url", e.target.value)} />
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
          <div className="flex items-center gap-2">
            <Checkbox id="cert-expires" checked={!!form.certificate_expires} onCheckedChange={checked => handleChange("certificate_expires", checked as boolean)} />
            <Label htmlFor="cert-expires">Certificate Expires</Label>
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

export default EditCertificationModal;
