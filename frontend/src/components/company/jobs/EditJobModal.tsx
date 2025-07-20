import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Job } from "@/types/job";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

interface EditJobModalProps {
    open: boolean;
    onClose: () => void;
    job?: Job; 
    onSave: (job: Job) => Promise<void>; 
}

const defaultJob: Job = {
    job_title: "",
    job_role: "",
    job_location: "",
    job_locality: "",
    work_mode: "",
    min_work_experience: 0,
    max_work_experience: 0,
    min_salary_per_month: 0,
    max_salary_per_month: 0,
    qualification: "",
}

const EditJobModal: React.FC<EditJobModalProps> = ({open, onClose, job, onSave }) => {
    const [form, setForm] = useState<Job>({...defaultJob, ...job});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (job) {
            setForm({ ...defaultJob, ...job });
        } else {
            setForm(defaultJob);
        }
    }, [job]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
        onClose();
    };

    return(
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="overflow-auto max-h-[90vh]">
                <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-bold">
                        {form.id ? "Edit Job" : "Add Job"}
                </DialogTitle>
                </ DialogHeader>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Job Title</label>
                        <Input
                        value={form.job_title}
                        onChange={(e) =>
                            setForm({ ...form, job_title: e.target.value })
                        }
                        placeholder="Enter job title"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Job Role</label>
                        <Input
                        value={form.job_role}
                        onChange={(e) => setForm({ ...form, job_role: e.target.value })}
                        placeholder="Enter job role"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">City</label>
                        <Input
                        value={form.job_location}
                        onChange={(e) => setForm({ ...form, job_location: e.target.value })}
                        placeholder="Enter city"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Locality</label>
                        <Input
                        value={form.job_locality}
                        onChange={(e) => setForm({ ...form, job_locality: e.target.value })}
                        placeholder="Enter locality"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Type</label>
                        <select
                        value={form.work_mode}
                        onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
                        className="w-full rounded-md bg-background"
                        >
                        <option value="">Select type</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="on-site">On-site</option>
                        </select>
                    </div>
                    <div className="mb-4 flex gap-2">
                        <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Min Experience (years)</label>
                        <Input
                            type="number"
                            value={form.min_work_experience ?? ''}
                            onChange={(e) => setForm({ ...form, min_work_experience: Number(e.target.value) })}
                            placeholder="Min experience"
                        />
                        </div>
                        <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Max Experience (years)</label>
                        <Input
                            type="number"
                            value={form.max_work_experience ?? ''}
                            onChange={(e) => setForm({ ...form, max_work_experience: Number(e.target.value) })}
                            placeholder="Max experience"
                        />
                        </div>
                    </div>
                    <div className="mb-4 flex gap-2">
                        <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Min Salary/Month</label>
                        <Input
                            type="number"
                            value={form.min_salary_per_month ?? ''}
                            onChange={(e) => setForm({ ...form, min_salary_per_month: Number(e.target.value) })}
                            placeholder="Min salary"
                        />
                        </div>
                        <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">Max Salary/Month</label>
                        <Input
                            type="number"
                            value={form.max_salary_per_month ?? ''}
                            onChange={(e) => setForm({ ...form, max_salary_per_month: Number(e.target.value) })}
                            placeholder="Max salary"
                        />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Qualification</label>
                        <Input
                        value={form.qualification}
                        onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                        placeholder="e.g. Graduate, Postgraduate"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Gender Preference</label>
                        <Input
                        value={form.gender_preference}
                        onChange={(e) => setForm({ ...form, gender_preference: e.target.value })}
                        placeholder="e.g. Any, Male, Female"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Previous Industry</label>
                        <Input
                        value={form.candidate_prev_industry}
                        onChange={(e) => setForm({ ...form, candidate_prev_industry: e.target.value })}
                        placeholder="Enter previous industry"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Languages</label>
                        <Input
                        value={form.languages}
                        onChange={(e) => setForm({ ...form, languages: e.target.value })}
                        placeholder="Enter languages"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Education Degree</label>
                        <Input
                        value={form.education_degree}
                        onChange={(e) => setForm({ ...form, education_degree: e.target.value })}
                        placeholder="Enter education degree"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Description</label>
                        <textarea
                        value={form.job_description}
                        onChange={(e) => setForm({ ...form, job_description: e.target.value })}
                        placeholder="Enter job description"
                        className="w-full rounded-md bg-background p-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Skills</label>
                        <textarea
                        value={form.skills}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        placeholder="e.g. JavaScript, Python, SQL"
                        className="w-full rounded-md bg-background p-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">Additional Benefits</label>
                        <textarea
                        value={form.additional_benefits}
                        onChange={(e) => setForm({ ...form, additional_benefits: e.target.value })}
                        placeholder="Enter additional benefits"
                        className="w-full rounded-md bg-background p-2"
                        />
                    </div>
                <DialogFooter>
                    <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={saving}
                    >
                    Cancel
                    </Button>
                    <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="mr-2"
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}

export default EditJobModal;