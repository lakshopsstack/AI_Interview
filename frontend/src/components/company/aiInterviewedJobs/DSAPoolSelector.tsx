import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DSAQuestion } from "@/types/aiInterviewedJob";
import { companyApi } from "@/services/companyApi";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DSAPoolSelectorProps {
  onSelectPoolQuestion: (question: DSAQuestion) => void;
}

interface DSAPoolQuestion {
  id: number;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  time_minutes: number;
  test_cases: { input: string; expected_output: string }[];
}

const DSAPoolSelector: React.FC<DSAPoolSelectorProps> = ({ onSelectPoolQuestion }) => {
  const [poolQuestions, setPoolQuestions] = useState<DSAPoolQuestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<DSAPoolQuestion | null>(null);

  useEffect(() => {
    const fetchPoolQuestions = async () => {
      setLoading(true);
      try {
        const res = await companyApi.getDSAPoolQuestions();
        setPoolQuestions(res.data);
      } catch (error) {
        toast.error("Failed to fetch DSA pool questions");
      } finally {
        setLoading(false);
      }
    };
    fetchPoolQuestions();
  }, []);

  const topics = Array.from(new Set(poolQuestions.map(q => q.topic))).filter(topic => !!topic && topic.trim() !== "");
  const filteredQuestions = poolQuestions.filter(q => q.topic === selectedTopic);

  useEffect(() => {
    if (topics.length > 0 && !selectedTopic) {
      setSelectedTopic(topics[0]);
    }
  }, [topics, selectedTopic]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <label className="font-medium">Select Topic:</label>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map(topic => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map(q => (
            <Card key={q.id} className="cursor-pointer hover:bg-muted transition" onClick={() => setSelectedQuestion(q)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{q.title}</div>
                  <Badge variant="outline" className="mr-2">{q.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">Test Cases: {q.test_cases?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && filteredQuestions.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No questions found for this topic.</div>
          )}
        </div>
        <Dialog open={!!selectedQuestion} onOpenChange={open => !open && setSelectedQuestion(null)}>
          <DialogContent className="max-w-2xl w-full">
            {selectedQuestion && (
              <>
                <DialogTitle>{selectedQuestion.title}</DialogTitle>
                <DialogDescription>
                  Full details for this DSA pool question, including description and test cases.
                </DialogDescription>
                <div className="space-y-4 mt-2">
                  <div className="mb-2">
                    <Badge variant="outline" className="mr-2">{selectedQuestion.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">Topic: {selectedQuestion.topic}</span>
                    <span className="ml-4 text-xs text-muted-foreground">Time: {selectedQuestion.time_minutes} min</span>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Description:</div>
                    <div className="whitespace-pre-line text-sm">{selectedQuestion.description}</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Test Cases:</div>
                    <table className="w-full text-xs mt-1 border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left">#</th>
                          <th className="text-left">Input</th>
                          <th className="text-left">Expected Output</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedQuestion.test_cases || []).map((tc, tIdx) => (
                          <tr key={tIdx}>
                            <td>{tIdx + 1}</td>
                            <td className="font-mono whitespace-pre-wrap">{tc.input}</td>
                            <td className="font-mono whitespace-pre-wrap">{tc.expected_output}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => { onSelectPoolQuestion(selectedQuestion); setSelectedQuestion(null); }}>Select This Question</Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DSAPoolSelector; 