import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { InterviewQuestion, MCQuestion } from "@/types/aiInterviewedJob";
import { companyApi } from "@/services/companyApi";

const InterviewQuestionManagement = ({ jobId }: { jobId: number }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<InterviewQuestion>({
    order_number: 0,
    question: "",
    question_type: "problem_solving",
  });

  useEffect(() => {
    fetchInterviewQuestions();
  }, [jobId]);

  const fetchInterviewQuestions = async () => {
    try {
      setLoading(true);
      const response = await companyApi.getCustomInterviewQuestionByJobId(jobId);
      setQuestions(response.data || []);
    } catch (error) {
      toast.error("Failed to load Interview questions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof InterviewQuestion, value: any) => {
    setNewQuestion((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const handleSaveQuestion = async () => {
    try {
      setLoading(true);
      const response = await companyApi.createCustomInterviewQuestion(newQuestion, jobId);
      if (!response || response.status != 200) {
        throw new Error("Failed to save Interview question");
      }

      setNewQuestion({
        order_number: 0,
        question: "",
        question_type: newQuestion.question_type,
      });

      toast.success("Interview question saved successfully");
      await fetchInterviewQuestions();
    } catch (error: any) {
      if (error.name == "AxiosError") {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to save Interview question");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id?: number) => {
    if (!id) return;
    try {
      setLoading(true);
      await companyApi.deleteCustomInterviewQuestion(id);
      toast.success("Interview question deleted successfully");
      await fetchInterviewQuestions();
    } catch (error) {
      toast.error("Failed to delete Interview question");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Total Questions: {questions.length}
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order No.</Label>
              <Input
                type="number"
                value={newQuestion.order_number}
                onChange={(e) =>
                  handleChange("order_number", parseInt(e.target.value))
                }
                placeholder="Order Priority"
              />
            </div>
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={newQuestion.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="Enter your question"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Question Type</Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={(value) => handleChange("question_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="problem_solving">
                    Problem Solving
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSaveQuestion} className="w-full">
              Save Question
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pb-24">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="w-full flex justify-between items-center">
                <span>
                  {question.question_type == "behavioral" ? (
                    <Badge>Behavioral</Badge>
                  ) : question.question_type == "custom" ? (
                    <Badge>Custom</Badge>
                  ) : question.question_type == "problem_solving" ? (
                    <Badge>Problem Solving</Badge>
                  ) : question.question_type == "technical" ? (
                    <Badge>Technical</Badge>
                  ) : (
                    ""
                  )}
                  <span className="ml-2">[{question.order_number}]</span>
                </span>
                <Button size="icon" variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
              <div className="flex gap-4 mt-2">
                <div>{question.question}</div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InterviewQuestionManagement;
