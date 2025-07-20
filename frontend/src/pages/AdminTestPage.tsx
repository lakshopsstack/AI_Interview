import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { adminApi } from "@/services/adminApi";

export default function AdminTestPage() {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTests([]); // Clear tests before fetching new page
    fetchTests(page, pageSize);
  }, [page, pageSize]);

  const fetchTests = async (page = 1, pageSize = 10) => {
    try {
      // If your backend supports pagination, pass page & pageSize as query params
      // Otherwise, paginate client-side
      const res = await adminApi.getTests();
      const allTests = res.data || [];
      setTotal(allTests.length);
      const startIdx = (page - 1) * pageSize;
      // Always set exactly the number of tests for the page
      setTests(allTests.slice(startIdx, startIdx + pageSize));
    } catch {
      setTests([]);
      setTotal(0);
    }
  };

  // Removed unused handleCreateTest and related state
  // Enforce strict page size: always 10 rows per page, remove dropdown
  // Remove pageSize dropdown and set pageSize to 10
  useEffect(() => {
    setPageSize(10);
  }, []);

  // Multi-stage form for creating a test
  function MultiStageTestForm({
    onSuccess,
    onCancel,
  }: {
    onSuccess: () => void;
    onCancel: () => void;
  }) {
    const [step, setStep] = useState(0);
    const [testId, setTestId] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [techField, setTechField] = useState("");
    const [description, setDescription] = useState("");
    const [dsaQuestions, setDsaQuestions] = useState([
      {
        question: "",
        difficulty: "",
        time_minutes: "",
        testCases: [{ input: "", output: "" }],
        saved: false,
      },
    ]);
    const [quizQuestions, setQuizQuestions] = useState([
      {
        question: "",
        type: "single", // "single", "multiple", "boolean"
        options: [
          { label: "", correct: false },
          { label: "", correct: false },
          { label: "", correct: false },
          { label: "", correct: false },
        ],
        time_minutes: "", // Add time_minutes field for quiz question
        saved: false,
      },
    ]);
    const [aiInterviewQuestions, setAiInterviewQuestions] = useState([
      {
        question: "",
        saved: false,
        category: "general",
      },
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Save test to backend when moving from stage 0 to 1
    const handleNext = async () => {
      if (step === 0) {
        setLoading(true);
        try {
          const res = await adminApi.createTest({
            title,
            tech_field: techField,
            description,
          });
          setTestId(res.data.id);
          setMessage("");
          setStep(1);
        } catch {
          setMessage("Failed to save test.");
        } finally {
          setLoading(false);
        }
      } else if (step === 1) {
        // Save all unsaved DSA questions
        if (testId) {
          setLoading(true);
          try {
            for (let i = 0; i < dsaQuestions.length; i++) {
              if (!dsaQuestions[i].saved) {
                await adminApi.createDSAQuestion({
                  edudiagno_test_id: testId,
                  title: dsaQuestions[i].question,
                  description: "",
                  difficulty: dsaQuestions[i].difficulty,
                  time_minutes: Number(dsaQuestions[i].time_minutes),
                  test_cases: dsaQuestions[i].testCases,
                });
                dsaQuestions[i].saved = true;
              }
            }
            setDsaQuestions([...dsaQuestions]);
            setMessage("");
            setStep(2);
          } catch {
            setMessage("Failed to save DSA questions.");
          } finally {
            setLoading(false);
          }
        }
      } else if (step === 2) {
        // Save quiz questions and options
        if (testId) {
          setLoading(true);
          try {
            for (let i = 0; i < quizQuestions.length; i++) {
              const qObj = quizQuestions[i];
              if (!qObj.saved && qObj.question) {
                // Save question
                const res = await adminApi.createQuizQuestions({
                  edudiagno_test_id: testId,
                  question: qObj.question,
                });
                // Save options
                for (let opt of qObj.options) {
                  await adminApi.createQuizOption({
                    label: opt.label,
                    correct: opt.correct,
                    question_id: res.data.id,
                  });
                }
                qObj.saved = true;
              }
            }
            setQuizQuestions([...quizQuestions]);
            setMessage("");
            setStep(3);
          } catch {
            setMessage("Failed to save quiz questions.");
          } finally {
            setLoading(false);
          }
        }
      }
    };

    // Add DSA question and save previous
    const handleAddDSAQuestion = async () => {
      const lastIdx = dsaQuestions.length - 1;
      const lastQ = dsaQuestions[lastIdx];
      if (!lastQ.saved && testId) {
        setLoading(true);
        try {
          await adminApi.createDSAQuestion({
            edudiagno_test_id: testId,
            title: lastQ.question,
            description: "",
            difficulty: lastQ.difficulty,
            time_minutes: Number(lastQ.time_minutes),
            test_cases: lastQ.testCases,
          });
          lastQ.saved = true;
          setDsaQuestions([
            ...dsaQuestions,
            { question: "", difficulty: "", time_minutes: "", testCases: [{ input: "", output: "" }], saved: false },
          ]);
          setMessage("");
        } catch {
          setMessage("Failed to save DSA question.");
        } finally {
          setLoading(false);
        }
      }
    };

    const handleBack = () => setStep((s) => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      try {
        await adminApi.createTest({
          title,
          tech_field: techField,
          description,
          dsa_questions: dsaQuestions,
          quiz_questions: quizQuestions,
          ai_interview_questions: aiInterviewQuestions,
        });
        setMessage("Test created successfully!");
        onSuccess();
      } catch {
        setMessage("Failed to create test.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create Test</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <>
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                placeholder="Tech Field"
                value={techField}
                onChange={(e) => setTechField(e.target.value)}
                required
              />
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="font-semibold mb-2">Add DSA Question</div>
              {/* DSA Question Input Form */}
              <div className="mb-4 p-2 border rounded bg-muted">
                <Input
                  value={dsaQuestions[dsaQuestions.length-1].question}
                  onChange={e => {
                    const arr = [...dsaQuestions];
                    arr[arr.length-1].question = e.target.value;
                    setDsaQuestions(arr);
                  }}
                  placeholder={`DSA Question ${dsaQuestions.length}`}
                  required
                  disabled={dsaQuestions[dsaQuestions.length-1].saved}
                />
                <select
                  value={dsaQuestions[dsaQuestions.length-1].difficulty}
                  onChange={e => {
                    const arr = [...dsaQuestions];
                    arr[arr.length-1].difficulty = e.target.value;
                    setDsaQuestions(arr);
                  }}
                  required
                  className="block w-full border rounded px-2 py-1 mt-2 mb-2"
                  disabled={dsaQuestions[dsaQuestions.length-1].saved}
                >
                  <option value="" disabled>Select Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <Input
                  value={dsaQuestions[dsaQuestions.length-1].time_minutes}
                  type="number"
                  min={1}
                  onChange={e => {
                    const arr = [...dsaQuestions];
                    arr[arr.length-1].time_minutes = e.target.value;
                    setDsaQuestions(arr);
                  }}
                  placeholder="Time (minutes)"
                  required
                  disabled={dsaQuestions[dsaQuestions.length-1].saved}
                />
                <div className="mt-2 ml-2">
                  <div className="font-medium">Test Cases</div>
                  {dsaQuestions[dsaQuestions.length-1].testCases.map((tc, tcIdx) => (
                    <div key={tcIdx} className="flex gap-2 mb-1">
                      <Input
                        value={tc.input}
                        onChange={e => {
                          const arr = [...dsaQuestions];
                          arr[arr.length-1].testCases[tcIdx].input = e.target.value;
                          setDsaQuestions(arr);
                        }}
                        placeholder="Input"
                        required
                        disabled={dsaQuestions[dsaQuestions.length-1].saved}
                      />
                      <Input
                        value={tc.output}
                        onChange={e => {
                          const arr = [...dsaQuestions];
                          arr[arr.length-1].testCases[tcIdx].output = e.target.value;
                          setDsaQuestions(arr);
                        }}
                        placeholder="Expected Output"
                        required
                        disabled={dsaQuestions[dsaQuestions.length-1].saved}
                      />
                      {!dsaQuestions[dsaQuestions.length-1].saved && (
                        <Button type="button" variant="destructive" onClick={() => {
                          const arr = [...dsaQuestions];
                          arr[arr.length-1].testCases.splice(tcIdx, 1);
                          setDsaQuestions(arr);
                        }}>Remove</Button>
                      )}
                    </div>
                  ))}
                  {!dsaQuestions[dsaQuestions.length-1].saved && (
                    <Button type="button" onClick={() => {
                      const arr = [...dsaQuestions];
                      arr[arr.length-1].testCases.push({ input: "", output: "" });
                      setDsaQuestions(arr);
                    }}>Add Test Case</Button>
                  )}
                </div>
                {!dsaQuestions[dsaQuestions.length-1].saved && (
                  <Button
                    type="button"
                    className="mt-2"
                    disabled={
                      !dsaQuestions[dsaQuestions.length-1].question ||
                      !dsaQuestions[dsaQuestions.length-1].difficulty ||
                      !dsaQuestions[dsaQuestions.length-1].time_minutes ||
                      dsaQuestions[dsaQuestions.length-1].testCases.some(tc => !tc.input || !tc.output)
                    }
                    onClick={handleAddDSAQuestion}
                  >
                    Save & Add DSA Question
                  </Button>
                )}
              </div>
              <div className="font-semibold mt-6 mb-2">Saved DSA Questions</div>
              {dsaQuestions.slice(0, -1).map((qObj, qIdx) => (
                <div key={qIdx} className="mb-4 p-2 border rounded">
                  <div className="font-medium">{qObj.question}</div>
                  <div className="text-sm text-muted-foreground">Difficulty: {qObj.difficulty}, Time: {qObj.time_minutes} min</div>
                  <div className="mt-2 ml-2">
                    <div className="font-medium">Test Cases</div>
                    {qObj.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="flex gap-2 mb-1">
                        <span className="px-2 py-1 bg-muted rounded">Input: {tc.input}</span>
                        <span className="px-2 py-1 bg-muted rounded">Output: {tc.output}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={handleBack}>Back</Button>
                <Button type="button" onClick={handleNext}>Next</Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <div className="font-semibold">Quiz Questions</div>
                {/* Quiz Question Input Form (for unsaved question) */}
                {(() => {
                  const lastIdx = quizQuestions.length - 1;
                  const qObj = quizQuestions[lastIdx];
                  const isSingle = qObj.type === "single";
                  const isMultiple = qObj.type === "multiple";
                  const isBoolean = qObj.type === "boolean";
                  let options = qObj.options;
                  if (isBoolean) {
                    options = [
                      { label: "True", correct: qObj.options[0]?.correct || false },
                      { label: "False", correct: qObj.options[1]?.correct || false },
                    ];
                  }
                  if (!qObj.saved) {
                    return (
                      <div className="mb-4 p-2 border rounded bg-muted">
                        <Input
                          value={qObj.question}
                          onChange={e => {
                            const arr = [...quizQuestions];
                            arr[lastIdx].question = e.target.value;
                            setQuizQuestions(arr);
                          }}
                          placeholder={`Quiz Question ${quizQuestions.length}`}
                          required
                          disabled={qObj.saved}
                        />
                        <Input
                          value={qObj.time_minutes}
                          type="number"
                          min={1}
                          onChange={e => {
                            const arr = [...quizQuestions];
                            arr[lastIdx].time_minutes = e.target.value;
                            setQuizQuestions(arr);
                          }}
                          placeholder="Time (seconds)"
                          required
                          disabled={qObj.saved}
                        />
                        <div className="mt-2">
                          <label className="font-medium mr-2">Type:</label>
                          <select
                            value={qObj.type}
                            onChange={e => {
                              const arr = [...quizQuestions];
                              arr[lastIdx].type = e.target.value;
                              if (e.target.value === "single" || e.target.value === "multiple") {
                                arr[lastIdx].options = [
                                  { label: "", correct: false },
                                  { label: "", correct: false },
                                  { label: "", correct: false },
                                  { label: "", correct: false },
                                ];
                              } else if (e.target.value === "boolean") {
                                arr[lastIdx].options = [
                                  { label: "True", correct: false },
                                  { label: "False", correct: false },
                                ];
                              }
                              setQuizQuestions(arr);
                            }}
                            disabled={qObj.saved}
                            className="border rounded px-2 py-1"
                          >
                            <option value="single">Single Correct (4 options)</option>
                            <option value="multiple">Multiple Correct (4 options)</option>
                            <option value="boolean">Boolean (True/False)</option>
                          </select>
                        </div>
                        <div className="mt-2 ml-2">
                          <div className="font-medium">Options</div>
                          {options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex gap-2 mb-1 items-center">
                              <Input
                                value={opt.label}
                                onChange={e => {
                                  const arr = [...quizQuestions];
                                  arr[lastIdx].options[optIdx].label = e.target.value;
                                  setQuizQuestions(arr);
                                }}
                                placeholder={isBoolean ? opt.label : `Option ${optIdx + 1}`}
                                required
                                disabled={qObj.saved || isBoolean}
                              />
                              <label className="flex items-center gap-1">
                                <input
                                  type={isSingle || isBoolean ? "radio" : "checkbox"}
                                  name={`quiz-correct-${lastIdx}`}
                                  checked={opt.correct}
                                  onChange={e => {
                                    const arr = [...quizQuestions];
                                    if (isSingle || isBoolean) {
                                      arr[lastIdx].options = arr[lastIdx].options.map((o, idx) => ({ ...o, correct: idx === optIdx ? e.target.checked : false }));
                                    } else {
                                      arr[lastIdx].options[optIdx].correct = e.target.checked;
                                    }
                                    setQuizQuestions(arr);
                                  }}
                                  disabled={qObj.saved}
                                />
                                Correct
                              </label>
                              {!qObj.saved && !isBoolean && (
                                <Button type="button" variant="destructive" size="sm" onClick={() => {
                                  const arr = [...quizQuestions];
                                  arr[lastIdx].options.splice(optIdx, 1);
                                  setQuizQuestions(arr);
                                }}>Remove</Button>
                              )}
                            </div>
                          ))}
                          {!qObj.saved && !isBoolean && options.length < 4 && (
                            <Button type="button" size="sm" onClick={() => {
                              const arr = [...quizQuestions];
                              arr[lastIdx].options.push({ label: "", correct: false });
                              setQuizQuestions(arr);
                            }}>Add Option</Button>
                          )}
                        </div>
                        <Button
                          type="button"
                          className="mt-2"
                          disabled={
                            !qObj.question ||
                            !qObj.time_minutes ||
                            (isSingle || isMultiple ? options.length !== 4 : options.length !== 2) ||
                            options.some(opt => !opt.label) ||
                            (isSingle && options.filter(opt => opt.correct).length !== 1)
                          }
                          onClick={async () => {
                            if (testId) {
                              setLoading(true);
                              try {
                                // Save question
                                const res = await adminApi.createQuizQuestions({
                                  edudiagno_test_id: testId,
                                  question: qObj.question,
                                  type: qObj.type,
                                  time_seconds: Number(qObj.time_minutes),
                                });
                                // Save options
                                for (let opt of qObj.options) {
                                  await adminApi.createQuizOption({
                                    label: opt.label,
                                    correct: opt.correct,
                                    question_id: res.data.id,
                                  });
                                }
                                const arr = [...quizQuestions];
                                arr[lastIdx].saved = true;
                                setQuizQuestions([
                                  ...arr,
                                  { question: "", type: "single", options: [ { label: "", correct: false }, { label: "", correct: false }, { label: "", correct: false }, { label: "", correct: false } ], time_minutes: "", saved: false }
                                ]);
                                setMessage("");
                              } catch {
                                setMessage("Failed to save quiz question.");
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        >
                          Save & Add Quiz Question
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="font-semibold mt-6 mb-2">Saved Quiz Questions</div>
                {quizQuestions.slice(0, -1).map((qObj, qIdx) => (
                  <div key={qIdx} className="mb-4 p-2 border rounded">
                    <div className="font-medium">{qObj.question}</div>
                    <div className="text-sm text-muted-foreground">Type: {qObj.type}, Time: {qObj.time_minutes} sec</div>
                    <div className="mt-2 ml-2">
                      <div className="font-medium">Options</div>
                      {qObj.options.map((opt, optIdx) => (
                        <span key={optIdx} className="px-2 py-1 bg-muted rounded mr-2">
                          {opt.label} {opt.correct ? <b>(Correct)</b> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Button type="button" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="font-semibold">AI Interview Questions</div>
              {/* Input for unsaved question (always above the list) */}
              {(() => {
                const lastIdx = aiInterviewQuestions.length - 1;
                const qObj = aiInterviewQuestions[lastIdx];
                if (!qObj.saved) {
                  return (
                    <div className="mb-2 flex gap-2 items-center">
                      <Input
                        value={qObj.question}
                        onChange={e => {
                          const arr = [...aiInterviewQuestions];
                          arr[lastIdx].question = e.target.value;
                          setAiInterviewQuestions(arr);
                        }}
                        placeholder={`AI Interview Question ${lastIdx + 1}`}
                        disabled={qObj.saved}
                      />
                      <select
                        value={qObj.category || "general"}
                        onChange={e => {
                          const arr = [...aiInterviewQuestions];
                          arr[lastIdx].category = e.target.value;
                          setAiInterviewQuestions(arr);
                        }}
                        disabled={qObj.saved}
                        className="border rounded px-2 py-1"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="problem_solving">Problem Solving</option>
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!qObj.question}
                        onClick={async () => {
                          if (testId) {
                            setLoading(true);
                            try {
                              await adminApi.createInterviewQuestion({
                                edudiagno_test_id: testId,
                                question: qObj.question,
                                category: qObj.category || "general",
                              });
                              const arr = [...aiInterviewQuestions];
                              arr[lastIdx].saved = true;
                              setAiInterviewQuestions([
                                ...arr,
                                { question: "", saved: false, category: "general" }
                              ]);
                              setMessage("");
                            } catch {
                              setMessage("Failed to save interview question.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                      >
                        Save & Add
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="font-semibold mt-6 mb-2">Saved AI Interview Questions</div>
              {aiInterviewQuestions.slice(0, -1).map((qObj, i) => (
                <div key={i} className="mb-2 p-2 border rounded">
                  <div className="font-medium">{qObj.question}</div>
                  <div className="text-sm text-muted-foreground">Category: {qObj.category || "general"}</div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Test"}
                </Button>
              </div>
            </>
          )}
          {message && (
            <div className="mt-4 text-muted-foreground">{message}</div>
          )}
        </form>
      </div>
    );
  }

  // Delete test handler
  const handleDeleteTest = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    setLoading(true);
    setMessage("");
    try {
      await adminApi.deleteTest(id);
      setMessage("Test deleted successfully!");
      fetchTests();
    } catch {
      setMessage("Failed to delete test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <span className="font-semibold">All Tests</span>
          <Button onClick={() => setShowForm(true)}>Create Test</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Tech Field</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test: any) => (
              <TableRow key={test.id}>
                <TableCell>{test.id}</TableCell>
                <TableCell>{test.title}</TableCell>
                <TableCell>{test.tech_field}</TableCell>
                <TableCell>{test.created_at}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTest(test.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Improved Pagination Controls */}
        <div className="flex items-center justify-center mt-4">
          <nav className="flex gap-2 items-center bg-muted rounded px-4 py-2 shadow">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              &#171;
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              &#8249;
            </Button>
            <span className="mx-2 font-semibold text-sm text-muted-foreground">
              Page {page} of {Math.max(1, Math.ceil(total / 10))}
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              disabled={page * 10 >= total}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              &#8250;
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              disabled={page === Math.ceil(total / 10) || total === 0}
              onClick={() => setPage(Math.max(1, Math.ceil(total / 10)))}
              aria-label="Last page"
            >
              &#187;
            </Button>
          </nav>
        </div>
        {message && (
          <div className="mt-4 text-muted-foreground">{message}</div>
        )}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <MultiStageTestForm
              onSuccess={() => {
                setShowForm(false);
                fetchTests();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
