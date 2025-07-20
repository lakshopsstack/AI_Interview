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
import { Check, Trash2 } from "lucide-react";
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
import { companyApi } from "@/services/companyApi";
import { MCQuestion } from "@/types/aiInterviewedJob";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface McqManagementProps {
  jobId: number;
}

const McqManagement = ({ jobId }: McqManagementProps) => {
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timingMode, setTimingMode] = useState<"per_question" | "whole_test">();
  const [wholeTestMinutes, setWholeTestMinutes] = useState<number>();
  const [newQuestion, setNewQuestion] = useState<MCQuestion>({
    description: "",
    category: "technical",
    type: "single",
    options: [
      { label: "", correct: false },
      { label: "", correct: false },
      { label: "", correct: false },
      { label: "", correct: false },
    ],
  });
  const [imageFile, setImageFile] = useState<File | null>();

  useEffect(() => {
    fetchMcqQuestions();
  }, [jobId]);

  const fetchMcqQuestions = async () => {
    try {
      setLoading(true);
      const response = await companyApi.getQuizQuestionByAiInterviewedJobId(jobId.toString());
      setQuestions(response.data || []);
      const jobResponse = await companyApi.getAiInterviewedJobById(jobId.toString());
      if (jobResponse.data.quiz_time_minutes) {
        setTimingMode("whole_test");
        setWholeTestMinutes(jobResponse.data.quiz_time_minutes);
      } else {
        setTimingMode("per_question");
      }
    } catch (error) {
      toast.error("Failed to load MCQ questions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MCQuestion, value: any) => {
    setNewQuestion((prev) => {
      let options = prev.options;
      if (field == "type") {
        if (value == "single") {
          options = [
            { label: "", correct: false },
            { label: "", correct: false },
            { label: "", correct: false },
            { label: "", correct: false },
          ];
        } else if (value == "multiple") {
          options = [
            { label: "", correct: false },
            { label: "", correct: false },
            { label: "", correct: false },
            { label: "", correct: false },
          ];
        } else if (value == "true_false") {
          options = [
            { label: "True", correct: true },
            { label: "False", correct: false },
          ];
        }
      } else if (field == "options") {
        options = value;
      }
      return { ...prev, [field]: value, options };
    });
  };

  const handleSaveQuestion = async () => {
    try {
      setLoading(true);
      if (timingMode == "per_question" && !newQuestion.time_seconds) {
        throw new Error("Please select proper time for mcq question");
      }
      const response = await companyApi.createQuizQuestion(
        newQuestion,
        jobId,
        imageFile || undefined
      );
      if (!response) {
        throw new Error("Failed to save MCQ question");
      }

      const questionId = response.data.id;
      for (const option of newQuestion.options || []) {
        const res = await companyApi.createQuizOption(option, questionId);
        if (!res) {
          throw new Error("Failed to save MCQ option");
        }
      }
      setNewQuestion({
        description: "",
        type: "single",
        category: newQuestion.category,
        time_seconds: newQuestion.time_seconds,
        options: [
          { label: "", correct: false },
          { label: "", correct: false },
          { label: "", correct: false },
          { label: "", correct: false },
        ],
      });
      setImageFile(null);

      toast.success("MCQ question saved successfully");

      await fetchMcqQuestions();
    } catch (error: any) {
      let msg = error.message || "Failed to save MCQ questions";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id?: number) => {
    if (!id) {
      return;
    }
    try {
      setLoading(true);

      await companyApi.deleteQuizQuestion(id);
      toast.success("MCQ question deleted successfully");

      await fetchMcqQuestions();
    } catch (error: any) {
      let msg = error.message || "Failed to delete MCQ questions";
      toast.error(msg);
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
          <div className="space-y-4 flex gap-8">
            <div className="space-y-2">
              <div>Timing Mode</div>
              <div>
                {timingMode == "per_question" ? "Per Question" : "Whole Quiz"}
              </div>
            </div>

            {timingMode === "whole_test" && (
              <div className="space-y-2">
                <div>Total Test Time (minutes)</div>
                <div>{wholeTestMinutes}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={newQuestion.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter your question"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={newQuestion.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="aptitude">Aptitude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Answer Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => {
                        handleChange("type", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select answer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Choice</SelectItem>
                        <SelectItem value="multiple">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {timingMode === "per_question" && (
                    <div className="space-y-2">
                      <Label>Time Limit (seconds)</Label>
                      <Select
                        value={newQuestion.time_seconds?.toString()}
                        onValueChange={(value) =>
                          handleChange("time_seconds", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="45">45 seconds</SelectItem>
                          <SelectItem value="60">60 seconds</SelectItem>
                          <SelectItem value="90">90 seconds</SelectItem>
                          <SelectItem value="120">120 seconds</SelectItem>
                          <SelectItem value="180">180 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Card>
                    <CardHeader>
                      <CardDescription>Options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {newQuestion.type == "single" ? (
                        <RadioGroup
                          className="w-full"
                          value={
                            newQuestion.options?.filter(
                              (option) => option.correct == true
                            )[0]?.label
                          }
                          onValueChange={(value: string) => {
                            handleChange(
                              "options",
                              newQuestion.options?.map((option) => {
                                if (option.label == value) {
                                  return { label: option.label, correct: true };
                                } else {
                                  return {
                                    label: option.label,
                                    correct: false,
                                  };
                                }
                              })
                            );
                          }}
                        >
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[0].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[0].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[0].correct,
                                    },
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[1].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[1].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[1].correct,
                                    },
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[2].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[2].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[2].correct,
                                    },
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem
                              value={newQuestion.options?.[3].label || ""}
                            ></RadioGroupItem>
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[3].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[3].correct,
                                    },
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                        </RadioGroup>
                      ) : newQuestion.type == "multiple" ? (
                        <div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[0].correct}
                              onCheckedChange={(checked: boolean) => {
                                handleChange("options", [
                                  {
                                    label: newQuestion.options?.[0].label,
                                    correct: checked,
                                  },
                                  newQuestion.options?.[1],
                                  newQuestion.options?.[2],
                                  newQuestion.options?.[3],
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[0].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[0].correct,
                                    },
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[1].correct}
                              onCheckedChange={(checked: boolean) => {
                                handleChange("options", [
                                  newQuestion.options?.[0],
                                  {
                                    label: newQuestion.options?.[1].label,
                                    correct: checked,
                                  },
                                  newQuestion.options?.[2],
                                  newQuestion.options?.[3],
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[1].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[1].correct,
                                    },
                                    newQuestion.options?.[2],
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[2].correct}
                              onCheckedChange={(checked: boolean) => {
                                handleChange("options", [
                                  newQuestion.options?.[0],
                                  newQuestion.options?.[1],
                                  {
                                    label: newQuestion.options?.[2].label,
                                    correct: checked,
                                  },
                                  newQuestion.options?.[3],
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[2].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[2].correct,
                                    },
                                    newQuestion.options?.[3],
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={newQuestion.options?.[3].correct}
                              onCheckedChange={(checked: boolean) => {
                                handleChange("options", [
                                  newQuestion.options?.[0],
                                  newQuestion.options?.[1],
                                  newQuestion.options?.[2],
                                  {
                                    label: newQuestion.options?.[3].label,
                                    correct: checked,
                                  },
                                ]);
                              }}
                            />
                            <Label className="w-full">
                              <Input
                                className="w-full"
                                value={newQuestion.options?.[3].label}
                                onChange={(e) => {
                                  handleChange("options", [
                                    newQuestion.options?.[0],
                                    newQuestion.options?.[1],
                                    newQuestion.options?.[2],
                                    {
                                      label: e.target.value,
                                      correct: newQuestion.options?.[3].correct,
                                    },
                                  ]);
                                }}
                              />
                            </Label>
                          </div>
                        </div>
                      ) : newQuestion.type == "true_false" ? (
                        <RadioGroup
                          className="w-full"
                          value={
                            newQuestion.options?.filter(
                              (option) => option.correct == true
                            )[0].label
                          }
                          onValueChange={(value: string) => {
                            setNewQuestion((prev) => {
                              return {
                                ...prev,
                                options: [
                                  { label: "True", correct: value == "True" },
                                  { label: "False", correct: value == "False" },
                                ],
                              };
                            });
                          }}
                        >
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem value="True"></RadioGroupItem>
                            <Label className="w-full">True</Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <RadioGroupItem value="False"></RadioGroupItem>
                            <Label className="w-full">False</Label>
                          </div>
                        </RadioGroup>
                      ) : (
                        <></>
                      )}
                    </CardContent>
                  </Card>
                  <Button
                    size="sm"
                    onClick={handleSaveQuestion}
                    className="w-full"
                  >
                    Save Question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pb-24">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="w-full flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive ml-auto"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div>{question.description}</div>
                </div>

                {question.image_url && (
                  <div className="space-y-2">
                    <img
                      src={question.image_url}
                      alt="Question"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        question.category === "technical"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {question.category}
                    </Badge>
                    <Badge variant="secondary">
                      {question.type === "single"
                        ? "Single Choice"
                        : question.type === "multiple"
                        ? "Multiple Choice"
                        : "True/False"}
                    </Badge>
                    {timingMode === "per_question" && (
                      <Badge variant={"info"} className="space-y-2">
                        {question.time_seconds} seconds
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        option.correct
                          ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="w-full flex">
                        {option.label}{" "}
                        {option.correct && (
                          <Check className={"ml-auto text-green-400"} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default McqManagement;
