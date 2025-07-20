import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { adminApi } from "@/services/adminApi";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TestCase {
  id?: number;
  input: string;
  expected_output: string;
}

interface DSAPoolQuestion {
  id?: number;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  time_minutes: number;
  test_cases: TestCase[];
}

const difficulties = ["Easy", "Medium", "Hard"];

const AdminDSAPool: React.FC = () => {
  const [questions, setQuestions] = useState<DSAPoolQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DSAPoolQuestion | null>(null);
  const [form, setForm] = useState<DSAPoolQuestion>({
    title: "",
    description: "",
    topic: "",
    difficulty: "Easy",
    time_minutes: 30,
    test_cases: [],
  });
  const [testCase, setTestCase] = useState<TestCase>({ input: "", expected_output: "" });
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const [allExpanded, setAllExpanded] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDSAPoolQuestions();
      setQuestions(res.data);
    } catch (e) {
      toast.error("Failed to fetch pool questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFormChange = (field: keyof DSAPoolQuestion, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTestCase = () => {
    if (!testCase.input || !testCase.expected_output) return;
    setForm((prev) => ({ ...prev, test_cases: [...(prev.test_cases || []), testCase] }));
    setTestCase({ input: "", expected_output: "" });
  };

  const handleDeleteTestCase = (idx: number) => {
    setForm((prev) => ({ ...prev, test_cases: prev.test_cases.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    try {
      if (editingQuestion) {
        await adminApi.updateDSAPoolQuestion(editingQuestion.id, form);
        toast.success("Question updated");
      } else {
        await adminApi.createDSAPoolQuestion(form);
        toast.success("Question created");
      }
      setShowForm(false);
      setEditingQuestion(null);
      setForm({ title: "", description: "", topic: "", difficulty: "Easy", time_minutes: 30, test_cases: [] });
      fetchQuestions();
    } catch (e) {
      toast.error("Failed to save question");
    }
  };

  const handleEdit = (q: DSAPoolQuestion) => {
    setEditingQuestion(q);
    setForm({ ...q, test_cases: q.test_cases || [] });
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await adminApi.deleteDSAPoolQuestion(id);
      toast.success("Question deleted");
      fetchQuestions();
    } catch (e) {
      toast.error("Failed to delete question");
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleExpandAll = () => {
    if (allExpanded) {
      setExpanded({});
      setAllExpanded(false);
    } else {
      const all: { [id: string]: boolean } = {};
      questions.forEach(q => { if (q.id !== undefined) all[q.id] = true; });
      setExpanded(all);
      setAllExpanded(true);
    }
  };

  return (
    <div className="w-full py-8">
      <h1 className="text-2xl font-bold mb-6">DSA Pool Management</h1>
      <Button onClick={() => { setShowForm(true); setEditingQuestion(null); setForm({ title: "", description: "", topic: "", difficulty: "Easy", time_minutes: 30, test_cases: [] }); }}>Add New Question</Button>
      {showForm && (
        <Card className="my-6">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Title" value={form.title} onChange={e => handleFormChange("title", e.target.value)} />
            <Textarea placeholder="Description" value={form.description} onChange={e => handleFormChange("description", e.target.value)} />
            <Input placeholder="Topic" value={form.topic} onChange={e => handleFormChange("topic", e.target.value)} />
            <Select value={form.difficulty} onValueChange={v => handleFormChange("difficulty", v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Time (minutes)" value={form.time_minutes} onChange={e => handleFormChange("time_minutes", Number(e.target.value))} />
            <div>
              <div className="font-medium mb-2">Test Cases</div>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Input" value={testCase.input} onChange={e => setTestCase(tc => ({ ...tc, input: e.target.value }))} />
                <Input placeholder="Expected Output" value={testCase.expected_output} onChange={e => setTestCase(tc => ({ ...tc, expected_output: e.target.value }))} />
                <Button type="button" onClick={handleAddTestCase}>Add</Button>
              </div>
              <ul className="space-y-1">
                {form.test_cases.map((tc, idx) => (
                  <li key={idx} className="flex gap-2 items-center">
                    <span className="text-xs">Input: {tc.input}</span>
                    <span className="text-xs">Output: {tc.expected_output}</span>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteTestCase(idx)}>Delete</Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>{editingQuestion ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingQuestion(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Questions</span>
            <Button size="sm" variant="outline" onClick={handleExpandAll}>{allExpanded ? "Collapse All" : "Expand All"}</Button>
          </div>
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th></th>
                <th className="text-left">Title</th>
                <th className="text-left">Topic</th>
                <th className="text-left">Difficulty</th>
                <th className="text-left">Time</th>
                <th className="text-left">Test Cases</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <React.Fragment key={q.id ?? q.title}>
                  <tr className={idx % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td>
                      <Button variant="ghost" size="icon" onClick={() => q.id !== undefined && toggleExpand(q.id)}>
                        {expanded[q.id ?? ""] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </Button>
                    </td>
                    <td>{q.title}</td>
                    <td>{q.topic}</td>
                    <td>{q.difficulty}</td>
                    <td>{q.time_minutes} min</td>
                    <td>{Array.isArray(q.test_cases) ? q.test_cases.length : (q.test_cases ? Object.keys(q.test_cases).length : 0)}</td>
                    <td>
                      <Button size="sm" onClick={() => handleEdit(q)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => typeof q.id === 'number' ? handleDelete(q.id) : undefined} disabled={typeof q.id !== 'number'}>Delete</Button>
                    </td>
                  </tr>
                  {expanded[q.id ?? ""] && (
                    <tr className="bg-muted/30">
                      <td colSpan={7} className="p-4">
                        <div className="mb-2">
                          <span className="font-semibold">Description:</span>
                          <div className="whitespace-pre-line ml-2">{q.description}</div>
                        </div>
                        <div>
                          <span className="font-semibold">Test Cases:</span>
                          <table className="w-full text-xs mt-1 border">
                            <thead>
                              <tr className="bg-muted">
                                <th className="text-left">#</th>
                                <th className="text-left">Input</th>
                                <th className="text-left">Expected Output</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(q.test_cases || []).map((tc, tIdx) => (
                                <tr key={tIdx}>
                                  <td>{tIdx + 1}</td>
                                  <td className="font-mono whitespace-pre-wrap">{tc.input}</td>
                                  <td className="font-mono whitespace-pre-wrap">{tc.expected_output}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDSAPool; 