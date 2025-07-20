import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { DSAQuestion, TestCase } from "@/types/aiInterviewedJob";
import { companyApi } from "@/services/companyApi";
import DSAPoolSelector from "./DSAPoolSelector";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DsaManagementProps {
  jobId: number;
}

const DsaManagement = ({ jobId }: DsaManagementProps) => {
  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<DSAQuestion>({});
  const [newTestCase, setNewTestCase] = useState({
    input: "",
    expected_output: "",
  });
  const [editingQuestion, setEditingQuestion] = useState<DSAQuestion | null>();
  const [editingNewTestCase, setEditingNewTestCase] = useState<TestCase | null>(
    {}
  );
  const [showDSAPoolModal, setShowDSAPoolModal] = useState(false);

  const fetchQuestions = async () => {
    try {
      const response = await companyApi.getDSAQuestion(jobId.toString());
      setQuestions(response.data);
    } catch (error) {
      toast.error("Failed to fetch questions");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [jobId]);

  const handleSaveNewQuestion = async () => {
    try {
      const response = await companyApi.createDSAQuestion(
        jobId.toString(),
        newQuestion
      );
      if (!response || response.status != 200) {
        throw Error("Could not create question");
      }

      toast.success("Question created successfully");
      setNewQuestion({
        title: "",
        description: "",
        difficulty: newQuestion.difficulty,
        time_minutes: newQuestion.time_minutes,
      });
      await fetchQuestions();
    } catch (error: any) {
      if (error.status == 422) {
        toast.error(
          `${error.response.data.detail[0].type} ${error.response.data.detail[0].loc[1]}`
        );
      } else if (error.name == "AxiosError") {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to create question");
      }
    }
  };

  const handleNewQuestionChange = (field: keyof DSAQuestion, value: any) => {
    setNewQuestion((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const handleNewTestCaseChange = (field: keyof TestCase, value: any) => {
    setNewTestCase((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const handleAddNewTestCase = () => {
    setNewQuestion((prev) => {
      return {
        ...prev,
        test_cases: [
          ...(prev.test_cases || []),
          {
            ...newTestCase,
          },
        ],
      };
    });
    setNewTestCase({ input: "", expected_output: "" });
  };

  const handleDeleteNewQuestionTestCase = (index: number) => {
    setNewQuestion((prev) => {
      return {
        ...prev,
        test_cases: prev.test_cases?.filter((_, i) => i != index),
      };
    });
  };

  const handleEditingQuestionChange = (
    field: keyof DSAQuestion,
    value: any
  ) => {
    setEditingQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteQuestion = async (id?: number) => {
    if (!id) {
      return;
    }
    try {
      await companyApi.deleteDSAQuestion(id);

      toast.success("Question delete successfully");
      await fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleSaveEditingQuestion = async () => {
    try {
      if (!editingQuestion) {
        return;
      }
      await companyApi.updateDSAQuestion(editingQuestion);

      toast.success("Changes saved successfully");
      await fetchQuestions();
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  const handleEditingAddTestCase = async () => {
    if (!editingQuestion?.id || !editingNewTestCase) return;

    try {
      await companyApi.createTestCase(editingNewTestCase, editingQuestion.id);
      setEditingNewTestCase({ input: "", expected_output: "" });
      toast.success("Test case added successfully");
      await fetchQuestions();
    } catch (error) {
      toast.error("Failed to add test case");
    }
  };

  const handleEditingDeleteTestCase = async (id?: number) => {
    if (!editingQuestion?.id || !id) {
      return;
    }

    try {
      await companyApi.deleteTestCase(id);
      toast.success("Test case deleted successfully");
      await fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete test case");
    }
  };

  const handleEditingNewTestCaseChange = (
    field: keyof TestCase,
    value: string
  ) => {
    setEditingNewTestCase((prev) => {
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  return (
    <div className="space-y-8">
      {/* DSA Pool Selector for company side */}
      <Dialog open={showDSAPoolModal} onOpenChange={setShowDSAPoolModal}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setShowDSAPoolModal(true)}>
            Select from DSA Pool
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-full">
          <DialogTitle>Select a DSA Pool Question</DialogTitle>
          <DialogDescription>
            Browse and select a DSA pool question to add to this job.
          </DialogDescription>
          <DSAPoolSelector
            onSelectPoolQuestion={(q) => {
              setNewQuestion(q);
              setShowDSAPoolModal(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <div className="grid gap-6">
        <Card className="bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  value={newQuestion.title || ""}
                  onChange={(e) =>
                    handleNewQuestionChange("title", e.target.value)
                  }
                  placeholder="Question Title"
                  className="text-lg font-medium border-0 bg-muted/50 focus-visible:ring-1"
                />
                <Select
                  value={newQuestion.difficulty}
                  onValueChange={(value) =>
                    handleNewQuestionChange("difficulty", value)
                  }
                >
                  <SelectTrigger className="w-[120px] bg-muted/50 border-0">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={newQuestion.description || ""}
                onChange={(e) =>
                  handleNewQuestionChange("description", e.target.value)
                }
                placeholder="Question Description"
                className="min-h-[100px] bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Test Cases</h3>
              </div>

              <div className="grid gap-4">
                {newQuestion.test_cases?.map((testCase, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="space-y-2 col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Input
                          </p>
                          <div className="bg-background font-mono whitespace-pre p-2">
                            {testCase.input}
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Expected Output
                          </p>
                          <div className="bg-background font-mono whitespace-pre p-2">
                            {testCase.expected_output}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNewQuestionTestCase(index)
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Input
                    </p>
                    <Textarea
                      value={newTestCase.input}
                      onChange={(e) =>
                        handleNewTestCaseChange("input", e.target.value)
                      }
                      className="bg-background min-h-[100px] font-mono whitespace-pre"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Expected Output
                    </p>
                    <Textarea
                      value={newTestCase.expected_output}
                      onChange={(e) =>
                        handleNewTestCaseChange(
                          "expected_output",
                          e.target.value
                        )
                      }
                      className="bg-background min-h-[100px] font-mono whitespace-pre"
                      rows={4}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddNewTestCase()}
                >
                  Add Test Case
                </Button>
              </CardContent>
            </Card>
            <Button className="w-full" onClick={handleSaveNewQuestion}>
              Save Question
            </Button>
          </CardContent>
        </Card>

        {questions.map((question) => (
          <Card key={question.id} className="bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {editingQuestion?.id == question.id ? (
                    <Input
                      value={editingQuestion?.title || ""}
                      onChange={(e) =>
                        handleEditingQuestionChange("title", e.target.value)
                      }
                      placeholder="Question Title"
                      className="text-lg font-medium border-0 bg-muted/50 focus-visible:ring-1"
                    />
                  ) : (
                    <h3 className="text-lg font-medium">{question.title}</h3>
                  )}

                  {editingQuestion?.id == question.id ? (
                    <Select
                      value={editingQuestion?.difficulty}
                      onValueChange={(value) =>
                        handleEditingQuestionChange("difficulty", value)
                      }
                    >
                      <SelectTrigger className="w-[120px] bg-muted/50 border-0">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{question.difficulty}</Badge>
                  )}
                  {editingQuestion?.id != question.id && (
                    <Button
                      variant={"ghost"}
                      className="ml-auto"
                      onClick={() => {
                        setEditingQuestion(question);
                      }}
                    >
                      <Edit />
                    </Button>
                  )}
                  {editingQuestion?.id != question.id && (
                    <Button
                      variant={"ghost"}
                      className="text-destructive"
                      onClick={() => {
                        handleDeleteQuestion(question.id);
                      }}
                    >
                      <Trash />
                    </Button>
                  )}
                </div>

                {editingQuestion?.id == question.id ? (
                  <Textarea
                    value={editingQuestion?.description || ""}
                    onChange={(e) =>
                      handleEditingQuestionChange("description", e.target.value)
                    }
                    placeholder="Question Description"
                    className="min-h-[100px] bg-muted/50 border-0 focus-visible:ring-1"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {question.description}
                  </p>
                )}

                {editingQuestion?.id == question.id && (
                  <Button
                    className="w-full"
                    onClick={handleSaveEditingQuestion}
                  >
                    Save Question
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {editingQuestion?.id == question.id && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Input
                          </p>
                          {editingQuestion?.id == question.id && (
                            <Textarea
                              value={editingNewTestCase?.input || ""}
                              onChange={(e) =>
                                handleEditingNewTestCaseChange(
                                  "input",
                                  e.target.value
                                )
                              }
                              className="bg-background min-h-[100px] font-mono whitespace-pre"
                              rows={4}
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Expected Output
                          </p>
                          {editingQuestion?.id == question.id && (
                            <Textarea
                              value={editingNewTestCase?.expected_output || ""}
                              onChange={(e) =>
                                handleEditingNewTestCaseChange(
                                  "expected_output",
                                  e.target.value
                                )
                              }
                              className="bg-background min-h-[100px] font-mono whitespace-pre"
                              rows={4}
                            />
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleEditingAddTestCase}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test Case
                      </Button>
                    </CardContent>
                  </Card>
                )}
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Test Cases</h3>
                </div>

                <div className="grid gap-4">
                  {question.test_cases?.map((testCase) => (
                    <Card key={testCase.id} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="space-y-2 md:col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Input
                            </p>
                            <p className="text-sm">{testCase.input}</p>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Expected Output
                            </p>
                            <p className="text-sm">
                              {testCase.expected_output}
                            </p>
                          </div>
                          {editingQuestion?.id == question.id && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditingDeleteTestCase(testCase.id)
                                }
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {editingQuestion?.id == question.id && (
                <div className="flex justify-end gap-4">
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      setEditingQuestion(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DsaManagement;
