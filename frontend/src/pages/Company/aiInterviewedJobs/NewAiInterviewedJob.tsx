import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/CompanyLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import * as z from "zod";
import { Save, Trash2, ArrowRight, ChevronsUpDown, Check } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { companyApi } from "@/services/companyApi";
import {
  AiInterviewedJobData,
  DSAQuestion,
  InterviewQuestion,
  MCQuestion,
  TestCase,
} from "@/types/aiInterviewedJob";
import { autoCompletionApi } from "@/services/autoCompletionApi";
import AIGeneratePopup from "@/components/company/aiInterviewedJobs/AIGeneratePopup";
import QuestionEditor from "@/components/company/QuestionEditor";
import DSAPoolSelector from "@/components/company/aiInterviewedJobs/DSAPoolSelector";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const NewJob = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobData, setJobData] = useState<AiInterviewedJobData>({
    id: 0,
    title: "",
    description: "",
    department: "",
    city: "",
    location: "",
    type: "full-time",
    min_experience: 0,
    max_experience: 0,
    duration_months: 12,
    key_qualification: "bachelors",
    salary_min: "",
    salary_max: "",
    currency: "INR",
    show_salary: true,
    requirements: "",
    benefits: "",
    status: "active",
    mcq_timing_mode: "whole_test",
    quiz_time_minutes: 60,
  });
  const [newDSAQuestion, setNewDSAQuestion] = useState<DSAQuestion>();
  const [newTestCase, setNewTestCase] = useState<TestCase>();
  const [newQuizQuestion, setNewQuizQuestion] = useState<MCQuestion>({
    type: "single",
  });
  const [quizImageFile, setQuizImageFile] = useState<File | null>();
  const [newQuizOptions, setNewQuizOptions] = useState<
    {
      label?: string;
      correct?: boolean;
    }[]
  >([
    { label: "", correct: false },
    { label: "", correct: false },
    { label: "", correct: false },
    { label: "", correct: false },
  ]);
  const [newCustomInterviewQuestion, setNewCustomInterviewQuestion] =
    useState<InterviewQuestion>({
      question: "",
      question_type: "problem_solving",
    });

  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [cityPopupOpen, setCityPopupOpen] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState("");
  const [currencyPopupOpen, setCurrencyPopupOpen] = useState(false);
  const [showDSAPoolModal, setShowDSAPoolModal] = useState(false);

  const jobFormSchema = z.object({
    title: z
      .string()
      .min(3, { message: "Job title must be at least 3 characters" })
      .nonempty({ message: "Job title is required" }),
    department: z.string().nonempty({ message: "Please select a department" }),
    city: z.string().nonempty({ message: "Please select a city" }),
    location: z.string().nonempty({ message: "Please select a location type" }),
    type: z.string().nonempty({ message: "Please select a job type" }),
    min_experience: z
      .number()
      .min(0, { message: "Minimum experience must be 0 or greater" })
      .int({ message: "Experience must be a whole number" }),
    max_experience: z
      .number()
      .min(0, { message: "Maximum experience must be 0 or greater" })
      .int({ message: "Experience must be a whole number" }),
    duration_months: z
      .number()
      .min(1, { message: "Duration must be at least 1 month" })
      .int({ message: "Duration must be a whole number" })
      .optional(),
    key_qualification: z
      .string()
      .nonempty({ message: "Please select a key qualification" }),
    salary_min: z
      .number()
      .min(0, { message: "Minimum salary must be 0 or greater" })
      .int({ message: "Salary must be a whole number" })
      .nullable()
      .optional(),
    salary_max: z
      .number()
      .min(0, { message: "Maximum salary must be 0 or greater" })
      .int({ message: "Salary must be a whole number" })
      .nullable()
      .optional(),
    show_salary: z.boolean().default(false),
    currency: z.string().nullable().optional(),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" })
      .nonempty({ message: "Job description is required" }),
    requirements: z
      .string()
      .min(10, { message: "Requirements must be at least 10 characters" })
      .nonempty({ message: "Job requirements are required" }),
    benefits: z.string().optional(),
    status: z.string().default("active"),
  });

  const customInterviewQuestionFormSchema = z.object({
    question: z.string().nonempty({ message: "Question is required" }),
    question_type: z.enum([
      "technical",
      "behavioral",
      "problem_solving",
      "custom",
    ]),
    order_number: z.number(),
  });

  const dsaQuestionFormSchema = z.object({
    title: z.string().nonempty({ message: "DSA question title is required" }),
    description: z
      .string()
      .nonempty({ message: "DSA question description is required" }),
    difficulty: z
      .string()
      .nonempty({ message: "Please select difficulty level" }),
    time_minutes: z
      .number()
      .min(1, { message: "Time limit must be at least 1 minute" })
      .max(180, { message: "Time limit cannot exceed 3 hours" }),
    test_cases: z
      .array(
        z.object({
          input: z
            .string()
            .nonempty({ message: "Test case input is required" }),
          expected_output: z.string().nonempty({
            message: "Test case expected output is required",
          }),
        })
      )
      .min(1, { message: "At least one test case is required" }),
  });

  const mcqQuestionFormSchema = z.object({
    title: z.string().optional(),
    type: z.enum(["single", "multiple", "true_false"]).optional(),
    category: z.enum(["technical", "aptitude"]).optional(),
    time_seconds: z.number().optional(),
    options: z
      .array(z.object({ label: z.string(), correct: z.boolean() }))
      .optional(),
  });

  useEffect(() => {
    if (citySearchTerm) {
      autoCompletionApi
        .fetchCities(citySearchTerm)
        .then((data) => setCities(data))
        .catch((_) => toast.error("Error while fetching cities"));
    }
  }, [citySearchTerm]);

  const validateField = (field: keyof AiInterviewedJobData, value: any) => {
    try {
      const validationSchema = z.object({
        [field]: z.any(),
      });
      validationSchema.parse({ [field]: value });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
    }
  };

  const handleChange = (field: keyof AiInterviewedJobData, value: any) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleCreateDSAQuestion = () => {
    if (!jobData.id || !newDSAQuestion) {
      return;
    }
    console.log(newDSAQuestion);
    let validationResult = dsaQuestionFormSchema.safeParse(newDSAQuestion);
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const path = error.path[0];
        if (typeof path === "string") {
          newErrors[path] = error.message;
        }
      });
      setErrors(newErrors);

      toast.error("Invalid data");
      setIsSaving(false);
      return;
    }

    companyApi
      .createDSAQuestion(jobData.id.toString(), newDSAQuestion)
      .then((res) => {
        let dsaQuestions: DSAQuestion[] = [];
        if (jobData.dsa_questions) {
          dsaQuestions = [...jobData.dsa_questions];
        }
        dsaQuestions.push(res.data);
        setJobData({ ...jobData, dsa_questions: dsaQuestions });
        setNewDSAQuestion({
          ...newDSAQuestion,
          description: "",
          test_cases: [],
          title: "",
        });
      })
      .catch((_) => {
        toast.error("Error while adding dsa question");
      });
  };

  const handleNewDsaQuestionChange = (field: keyof DSAQuestion, value: any) => {
    setNewDSAQuestion({ ...newDSAQuestion, [field]: value });
  };

  const handleNewTestCaseChange = (field: keyof TestCase, value: string) => {
    setNewTestCase({
      ...newTestCase,
      [field]: value,
    });
  };

  const handleSaveTestCase = () => {
    if (!newTestCase) {
      return;
    }
    let test_cases: TestCase[] = [];
    if (newDSAQuestion?.test_cases) {
      test_cases = [...newDSAQuestion.test_cases];
    }
    test_cases.push(newTestCase);
    setNewDSAQuestion({ ...newDSAQuestion, test_cases });
    setNewTestCase({ input: "", expected_output: "" });
  };

  const handleTestCaseDelete = (testCaseIndex: number) => {
    if (!newDSAQuestion || !newDSAQuestion.test_cases) {
      return;
    }
    let test_cases = [...newDSAQuestion.test_cases].filter(
      (_, index) => index !== testCaseIndex
    );
    setNewDSAQuestion({ ...newDSAQuestion, test_cases });
  };

  const handleSaveMcqTimingMode = () => {
    setIsSaving(true);
    if (jobData.mcq_timing_mode == "per_question") {
      setIsSaving(false);
      setShowQuizForm(true);
      return;
    }

    if (!jobData || !jobData.id) {
      return;
    }
    companyApi
      .updateAiInterviewedJob(jobData.id.toString(), {
        quiz_time_minutes: jobData.quiz_time_minutes,
      })
      .then((res) => {
        setJobData({ ...jobData, ...res.data });
      })
      .catch((_) => {
        toast.error("Could not save MCQ timing mode");
      })
      .finally(() => {
        setIsSaving(false);
        setShowQuizForm(true);
      });
  };

  const handleMcqQuestionChange = (field: keyof MCQuestion, value: any) => {
    if (!newQuizQuestion) {
      return;
    }
    setNewQuizQuestion({ ...newQuizQuestion, [field]: value });
  };

  const handleCustomQuestionChange = (
    field: keyof InterviewQuestion,
    value: any
  ) => {
    setNewCustomInterviewQuestion({
      ...newCustomInterviewQuestion,
      [field]: value,
    });
  };

  const handleSaveJobDetails = async () => {
    setIsSaving(true);
    try {
      const dataToValidate = {
        ...jobData,
        salary_min: jobData.salary_min ? Number(jobData.salary_min) : null,
        salary_max: jobData.salary_max ? Number(jobData.salary_max) : null,
      };

      const validationResult = jobFormSchema.safeParse(dataToValidate);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);

        toast.error("Invalid data");
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setIsSaving(false);
        return;
      }

      let response;
      response = await companyApi.createAiInterviewedJob({
        ...jobData,
        salary_min: jobData.salary_min ? Number(jobData.salary_min) : null,
        salary_max: jobData.salary_max ? Number(jobData.salary_max) : null,
      });

      if ((response.status = 200)) {
        toast.success(
          jobData.id
            ? "Job details updated successfully"
            : "Job details saved successfully"
        );
        setJobData((prev) => ({
          ...prev,
          id: response.data.id,
        }));
        setActiveTab("dsa");
      } else {
        throw new Error("Failed to save job details");
      }
    } catch (error: any) {
      let errorMessage = "Failed to save job details";

      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg)
            .join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  interface Currency {
    value: string;
    label: string;
    symbol: string;
    name: string;
  }

  interface LocationCurrency {
    currency: string;
    symbol: string;
    name: string;
  }

  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([
    { value: "USD", label: "$ USD", symbol: "$", name: "US Dollar" },
    { value: "INR", label: "₹ INR", symbol: "₹", name: "Indian Rupee" },
  ]);

  // Add effect to update currency when city changes
  // useEffect(() => {
  //   const updateCurrencyForLocation = async () => {
  //     if (jobData.city && recruiter?.country) {
  //       const locationCurrency = await getLocationCurrency(
  //         jobData.city,
  //         recruiter.country
  //       );
  //       if (locationCurrency) {
  //         // Update available currencies
  //         const currencies = await getAvailableCurrencies();
  //         setAvailableCurrencies(currencies);

  //         // Set the currency if it's not already set
  //         if (!jobData.currency) {
  //           handleChange("currency", locationCurrency.currency);
  //         }
  //       }
  //     }
  //   };

  //   updateCurrencyForLocation();
  // }, [jobData.city, recruiter?.country]);

  const handleTimingModeChange = (value: "per_question" | "whole_test") => {
    setJobData((prev) => ({
      ...prev,
      mcq_timing_mode: value,
      quiz_time_minutes: value === "whole_test" ? 60 : null,
      mcq_questions: prev.mcq_questions?.map((q) => ({
        ...q,
        time_seconds: value === "per_question" ? q.time_seconds : undefined,
      })),
    }));
  };

  const handleQuizTimeChange = (value: string) => {
    const minutes = parseInt(value);
    setJobData((prev) => ({
      ...prev,
      quiz_time_minutes: minutes,
    }));
  };

  const handleSaveMcqQuestion = async () => {
    try {
      setIsSaving(true);
      if (!jobData.id) {
        return;
      }
      let quizData = { ...newQuizQuestion, options: [...newQuizOptions] };
      if (jobData.mcq_timing_mode == "per_question" && !quizData.time_seconds) {
        throw new Error("Please select proper time for mcq question");
      }
      const validationResult = mcqQuestionFormSchema.safeParse(quizData);
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        const firstError = Object.entries(newErrors)[0];
        throw new Error(`${firstError[0]} ${firstError[1]}`);
      }

      const response = await companyApi.createQuizQuestion(
        quizData,
        jobData.id,
        quizImageFile || undefined
      );
      if (!response) {
        throw new Error("Failed to save MCQ question");
      }
      quizData = { ...quizData, ...response.data };
      const options = [];
      for (const option of newQuizOptions || []) {
        const res = await companyApi.createQuizOption(option, quizData.id);
        if (!res) {
          throw new Error("Failed to save MCQ option");
        }
        options.push(res.data);
      }
      quizData.options = options;
      setJobData({
        ...jobData,
        mcq_questions: [...(jobData.mcq_questions || []), quizData],
      });
      setNewQuizQuestion({
        description: "",
        type: "single",
        category: newQuizQuestion.category,
        time_seconds: newQuizQuestion.time_seconds,
      });
      setNewQuizOptions([
        { label: "", correct: false },
        { label: "", correct: false },
        { label: "", correct: false },
        { label: "", correct: false },
      ]);
      setQuizImageFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      toast.success("MCQ question saved successfully");
    } catch (error: any) {
      let errorMessage = "Failed to save MCQ question";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCustomInterviewQuestion = async () => {
    if (!jobData.id) {
      return;
    }

    try {
      const validationResult = customInterviewQuestionFormSchema.safeParse(
        newCustomInterviewQuestion
      );
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        console.log(errors);
        throw new Error(
          "Please fill in all required fields for custom questions"
        );
      }

      const res = await companyApi.createCustomInterviewQuestion(
        newCustomInterviewQuestion,
        jobData.id
      );
      if (res.status != 200) {
        throw new Error("Could not create question");
      }

      setJobData({
        ...jobData,
        custom_interview_questions: [
          ...(jobData.custom_interview_questions || []),
          res.data,
        ],
      });
      setNewCustomInterviewQuestion((prev) => {
        return {
          order_number: prev.order_number ? prev.order_number + 1 : 0,
          question: "",
        };
      });

      toast.success("Custom question saved successfully");
    } catch (error: any) {
      let errorMessage = "Failed to save custom questions";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Job</h1>
          <p className="text-muted-foreground">
            Add a new job posting to find the perfect candidate
          </p>
        </div>

        <div className="space-y-8">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="dsa">DSA Questions</TabsTrigger>
              <TabsTrigger value="mcq">MCQ Questions</TabsTrigger>
              <TabsTrigger value="custom">Custom Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">
                      Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="job-title"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("department", val)}
                      defaultValue={jobData.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="customer_support">
                          Customer Support
                        </SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-destructive">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Job Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("type", val)}
                      defaultValue={jobData.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-destructive">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Location Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => handleChange("location", val)}
                      defaultValue={jobData.location}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Popover
                      open={cityPopupOpen}
                      onOpenChange={setCityPopupOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !jobData.city && "text-muted-foreground"
                          )}
                        >
                          {jobData.city || "Select a city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search city..."
                            value={citySearchTerm}
                            onValueChange={setCitySearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {cities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={city.name}
                                  onSelect={() => {
                                    handleChange("city", city.name);
                                    setCityPopupOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      jobData.city === city.name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience & Salary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Minimum Experience (Years){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        handleChange("min_experience", Number(val))
                      }
                      defaultValue={jobData.min_experience?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select min experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Fresher</SelectItem>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="4">4 years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.min_experience && (
                      <p className="text-sm text-destructive">
                        {errors.min_experience}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Maximum Experience (Years){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        handleChange("max_experience", Number(val))
                      }
                      defaultValue={jobData.max_experience?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select max experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="4">4 years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.max_experience && (
                      <p className="text-sm text-destructive">
                        {errors.max_experience}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Required Qualification{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={jobData.key_qualification}
                      onValueChange={(value) =>
                        handleChange("key_qualification", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelors">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.key_qualification && (
                      <p className="text-sm text-destructive">
                        {errors.key_qualification}
                      </p>
                    )}
                  </div>

                  {(jobData.type === "internship" ||
                    jobData.type === "contract" ||
                    jobData.type === "temporary") && (
                    <div className="space-y-2">
                      <Label>
                        Job Duration (Months){" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="duration_months"
                        type="number"
                        min="1"
                        value={jobData.duration_months}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d+$/.test(value)) {
                            handleChange(
                              "duration_months",
                              value === "" ? 0 : parseInt(value)
                            );
                          }
                        }}
                      />
                      {errors.duration_months && (
                        <p className="text-sm text-destructive">
                          {errors.duration_months}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Salary Range</Label>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-normal">
                          Show salary in posting
                        </Label>
                        <Switch
                          checked={jobData.show_salary}
                          onCheckedChange={(checked) => {
                            handleChange("show_salary", checked);
                          }}
                        />
                      </div>
                    </div>

                    {
                      <>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Popover
                            open={currencyPopupOpen}
                            onOpenChange={setCurrencyPopupOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !jobData.currency && "text-muted-foreground"
                                )}
                              >
                                {jobData.currency
                                  ? availableCurrencies.find(
                                      (c) => c.value === jobData.currency
                                    )?.label
                                  : "Select currency"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search currency..."
                                  value={currencySearchTerm}
                                  onValueChange={setCurrencySearchTerm}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    No currency found.
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-[300px] overflow-auto">
                                    {availableCurrencies
                                      .filter(
                                        (currency) =>
                                          currency.value
                                            .toLowerCase()
                                            .includes(
                                              currencySearchTerm.toLowerCase()
                                            ) ||
                                          currency.name
                                            .toLowerCase()
                                            .includes(
                                              currencySearchTerm.toLowerCase()
                                            )
                                      )
                                      .map((currency) => (
                                        <CommandItem
                                          key={currency.value}
                                          value={currency.value}
                                          onSelect={() => {
                                            handleChange(
                                              "currency",
                                              currency.value
                                            );
                                            setCurrencyPopupOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              jobData.currency ===
                                                currency.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {currency.label}
                                          <span className="ml-2 text-muted-foreground">
                                            {currency.name}
                                          </span>
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {jobData.currency && (
                            <p className="text-sm text-muted-foreground">
                              {
                                availableCurrencies.find(
                                  (c) => c.value === jobData.currency
                                )?.name
                              }
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="salary_min">Minimum Salary</Label>
                            <Input
                              id="salary_min"
                              type="number"
                              min="0"
                              placeholder="e.g. 60000"
                              value={
                                typeof jobData.salary_min === "string"
                                  ? jobData.salary_min
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d+$/.test(value)) {
                                  handleChange("salary_min", value);
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="salary_max">Maximum Salary</Label>
                            <Input
                              id="salary_max"
                              type="number"
                              min="0"
                              placeholder="e.g. 80000"
                              value={
                                typeof jobData.salary_max === "string"
                                  ? jobData.salary_max
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d+$/.test(value)) {
                                  handleChange("salary_max", value);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    }
                    {(errors.salary_min ||
                      errors.salary_max ||
                      errors.currency ||
                      errors.show_salary) && (
                      <p className="text-sm text-destructive">
                        {errors.salary_min ||
                          errors.salary_max ||
                          errors.currency ||
                          errors.show_salary}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>
                        Job Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <AIGeneratePopup
                        title="Generate Description"
                        fieldLabel="Description"
                        jobTitle={jobData.title || ""}
                        department={jobData.department || ""}
                        location={jobData.location || ""}
                        jobType={jobData.type || ""}
                        keyQualification={jobData.key_qualification || ""}
                        minExperience={jobData.min_experience?.toString() || ""}
                        maxExperience={jobData.max_experience?.toString() || ""}
                        onGenerated={(content) =>
                          handleChange("description", content)
                        }
                      />
                    </div>
                    <Textarea
                      id="description"
                      className="min-h-[200px]"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      value={jobData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>
                        Requirements <span className="text-destructive">*</span>
                      </Label>
                      <AIGeneratePopup
                        title="Generate Requirements"
                        fieldLabel="Requirements"
                        jobTitle={jobData.title || ""}
                        department={jobData.department || ""}
                        location={jobData.location || ""}
                        jobType={jobData.type || ""}
                        keyQualification={jobData.key_qualification || ""}
                        minExperience={jobData.min_experience?.toString() || ""}
                        maxExperience={jobData.max_experience?.toString() || ""}
                        onGenerated={(content) =>
                          handleChange("requirements", content)
                        }
                      />
                    </div>
                    <Textarea
                      id="requirements"
                      className="min-h-[200px]"
                      placeholder="List the required skills, qualifications, and experience..."
                      value={jobData.requirements}
                      onChange={(e) =>
                        handleChange("requirements", e.target.value)
                      }
                    />
                    {errors.requirements && (
                      <p className="text-sm text-destructive">
                        {errors.requirements}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits (Optional)</Label>
                    <Textarea
                      id="benefits"
                      className="min-h-[150px]"
                      placeholder="List the benefits and perks offered (optional)..."
                      value={jobData.benefits}
                      onChange={(e) => handleChange("benefits", e.target.value)}
                    />
                    {errors.benefits && (
                      <p className="text-sm text-destructive">
                        {errors.benefits}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      onClick={handleSaveJobDetails}
                      disabled={isSaving}
                      variant="outline"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Job Details and Next
                          <ArrowRight />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dsa">
              <Card>
                <CardHeader>
                  <CardTitle>DSA Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={() => setShowDSAPoolModal(true)}>
                      Add from DSA Pool
                    </Button>
                  </div>
                  <Dialog open={showDSAPoolModal} onOpenChange={setShowDSAPoolModal}>
                    <DialogContent className="max-w-2xl w-full">
                      <DialogTitle>Select a DSA Pool Question</DialogTitle>
                      <DialogDescription>
                        Browse and select a DSA pool question to add to this job.
                      </DialogDescription>
                      <DSAPoolSelector
                        onSelectPoolQuestion={(q) => {
                          setJobData((prev) => ({
                            ...prev,
                            dsa_questions: [...(prev.dsa_questions || []), q],
                          }));
                          setShowDSAPoolModal(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  {jobData.dsa_questions?.map(
                    (question: DSAQuestion, questionIndex: number) => (
                      <Card key={questionIndex} className="p-4">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Question Title</Label>
                              <Input
                                value={question.title}
                                disabled
                                placeholder="e.g. Two Sum"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Difficulty</Label>
                              <Select value={question.difficulty} disabled>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Easy">Easy</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Time Limit (minutes)</Label>
                              <Select
                                value={question.time_minutes?.toString()}
                                disabled
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time limit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">60 minutes</SelectItem>
                                  <SelectItem value="90">90 minutes</SelectItem>
                                  <SelectItem value="120">
                                    120 minutes
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Question Description</Label>
                            <div>
                              questionDescription={question.description || ""}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label>Test Cases</Label>
                            </div>

                            {question.test_cases?.map(
                              (testCase: TestCase, testCaseIndex: number) => (
                                <div
                                  key={testCaseIndex}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                  <div className="space-y-2">
                                    <Label>Input</Label>
                                    <Textarea
                                      value={testCase.input}
                                      disabled
                                      placeholder="Input"
                                      className="min-h-[100px] font-mono whitespace-pre-wrap"
                                      rows={4}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Expected Output</Label>
                                    <Textarea
                                      value={testCase.expected_output}
                                      disabled
                                      placeholder="Expected Output"
                                      className="min-h-[100px] font-mono whitespace-pre-wrap"
                                      rows={4}
                                    />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  )}

                  <Card className="p-4">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Question Title</Label>
                          <Input
                            value={newDSAQuestion?.title}
                            onChange={(e) => {
                              handleNewDsaQuestionChange(
                                "title",
                                e.target.value
                              );
                            }}
                            placeholder="e.g. Two Sum"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select
                            value={newDSAQuestion?.difficulty}
                            onValueChange={(value) => {
                              handleNewDsaQuestionChange("difficulty", value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Time Limit (minutes)</Label>
                          <Select
                            value={newDSAQuestion?.time_minutes?.toString()}
                            onValueChange={(value) => {
                              handleNewDsaQuestionChange(
                                "time_minutes",
                                parseInt(value)
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time limit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                              <SelectItem value="120">120 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Description</Label>
                        <QuestionEditor
                          questionDescription={
                            newDSAQuestion?.description || ""
                          }
                          setQuestionDescription={(value) => {
                            handleNewDsaQuestionChange("description", value);
                          }}
                        />
                      </div>

                      <div className="space-y-4">
                        {newDSAQuestion?.test_cases?.map(
                          (testCase: TestCase, testCaseIndex: number) => (
                            <div
                              key={testCaseIndex}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <div className="space-y-2">
                                <Label>Input</Label>
                                <Textarea
                                  value={testCase.input}
                                  disabled
                                  placeholder="Input"
                                  className="min-h-[100px] font-mono whitespace-pre-wrap"
                                  rows={4}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Expected Output</Label>
                                <Textarea
                                  value={testCase.expected_output}
                                  disabled
                                  placeholder="Expected Output"
                                  className="min-h-[100px] font-mono whitespace-pre-wrap"
                                  rows={4}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleTestCaseDelete(testCaseIndex);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Input</Label>
                            <Textarea
                              value={newTestCase?.input || ""}
                              onChange={(e) => {
                                handleNewTestCaseChange(
                                  "input",
                                  e.target.value
                                );
                              }}
                              placeholder="Input"
                              className="min-h-[100px] font-mono whitespace-pre-wrap"
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                              value={newTestCase?.expected_output || ""}
                              onChange={(e) => {
                                handleNewTestCaseChange(
                                  "expected_output",
                                  e.target.value
                                );
                              }}
                              placeholder="Expected Output"
                              className="min-h-[100px] font-mono whitespace-pre-wrap"
                              rows={4}
                            />
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSaveTestCase}
                          className="w-full"
                        >
                          Save Test Case
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end mt-6">
                    <Button type="button" onClick={handleCreateDSAQuestion}>
                      Save DSA Question
                    </Button>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveTab("mcq");
                      }}
                      disabled={isSaving}
                      variant="outline"
                    >
                      Save And Next
                      <ArrowRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcq">
              <Card>
                <CardHeader>
                  <CardTitle>MCQ Questions</CardTitle>
                  <CardDescription>
                    Add multiple-choice questions for the assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Timing Mode</Label>
                      <Select
                        value={jobData.mcq_timing_mode}
                        onValueChange={handleTimingModeChange}
                        disabled={showQuizForm}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_question">
                            Per Question Timing
                          </SelectItem>
                          <SelectItem value="whole_test">
                            Whole Test Timing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {jobData.mcq_timing_mode === "whole_test" && (
                      <div className="space-y-2">
                        <Label>Total Test Time (minutes)</Label>
                        <Select
                          value={jobData.quiz_time_minutes?.toString() || "60"}
                          onValueChange={handleQuizTimeChange}
                          disabled={showQuizForm}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select total time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {!showQuizForm && (
                    <div>
                      <Button type="button" onClick={handleSaveMcqTimingMode}>
                        Save
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">MCQ Questions</h3>
                        <p className="text-sm text-muted-foreground">
                          Total Questions: {jobData.mcq_questions?.length || 0}
                        </p>
                      </div>
                    </div>
                    {jobData.mcq_questions?.map((question, index) => (
                      <Card key={index} className="mb-4">
                        <CardContent className="pt-6">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor={`question-${index}`}>
                                Question
                              </Label>
                              <Textarea
                                id={`question-${index}`}
                                value={question.description}
                                disabled
                                placeholder="Enter your question"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="mt-2">
                                {question.image_url && (
                                  <img
                                    src={question.image_url}
                                    alt="Question preview"
                                    className="max-w-xs max-h-48 object-contain rounded-md border border-gray-200"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Label>Question Type</Label>
                              <Select value={question.type} disabled>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">
                                    Single Choice
                                  </SelectItem>
                                  <SelectItem value="multiple">
                                    Multiple Choice
                                  </SelectItem>
                                  <SelectItem value="true_false">
                                    True/False
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-2">
                              <Label>Category</Label>
                              <Select value={question.category} disabled>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="technical">
                                    Technical
                                  </SelectItem>
                                  <SelectItem value="aptitude">
                                    Aptitude
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {jobData.mcq_timing_mode === "per_question" && (
                              <div className="grid gap-2">
                                <Label>Time Limit (seconds)</Label>
                                <Input
                                  type="number"
                                  min="30"
                                  max="180"
                                  value={question.time_seconds?.toString()}
                                  disabled
                                />
                              </div>
                            )}

                            <div className="grid gap-2">
                              <Label>Options</Label>
                              {question.options?.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center space-x-2"
                                >
                                  <div
                                    className={
                                      "w-full p-2 rounded flex items-center" +
                                      (option.correct
                                        ? " border-green-400 border text-green-400"
                                        : " ")
                                    }
                                  >
                                    {option.label}
                                    {option.correct && (
                                      <Check className="ml-auto" size={16} />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleMcqQuestionDelete(index)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Question
                              </Button>
                            </div> */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {showQuizForm && (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Question</Label>
                            <Textarea
                              value={newQuizQuestion?.description}
                              onChange={(e) =>
                                handleMcqQuestionChange(
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Enter your question"
                            />
                          </div>

                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setQuizImageFile(file);
                                }
                              }}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Question Type</Label>
                            <Select
                              value={newQuizQuestion?.type}
                              onValueChange={(value) => {
                                handleMcqQuestionChange("type", value);
                                if (value == "single") {
                                  setNewQuizOptions([
                                    { label: "", correct: false },
                                    { label: "", correct: false },
                                    { label: "", correct: false },
                                    { label: "", correct: false },
                                  ]);
                                } else if (value == "multiple") {
                                  setNewQuizOptions([
                                    { label: "", correct: false },
                                    { label: "", correct: false },
                                    { label: "", correct: false },
                                    { label: "", correct: false },
                                  ]);
                                } else if (value == "true_false") {
                                  setNewQuizOptions([
                                    { label: "True", correct: false },
                                    { label: "False", correct: false },
                                  ]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">
                                  Single Choice
                                </SelectItem>
                                <SelectItem value="multiple">
                                  Multiple Choice
                                </SelectItem>
                                <SelectItem value="true_false">
                                  True/False
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select
                              value={newQuizQuestion?.category}
                              onValueChange={(value) =>
                                handleMcqQuestionChange("category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">
                                  Technical
                                </SelectItem>
                                <SelectItem value="aptitude">
                                  Aptitude
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {jobData.mcq_timing_mode === "per_question" && (
                            <div className="grid gap-2">
                              <Label>Time Limit (seconds)</Label>
                              <Input
                                type="number"
                                min="30"
                                max="180"
                                value={newQuizQuestion?.time_seconds?.toString()}
                                onChange={(e) =>
                                  handleMcqQuestionChange(
                                    "time_seconds",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div>
                          )}

                          <div className="grid gap-2">
                            <Label>Options</Label>
                            {newQuizQuestion?.type === "true_false" && (
                              <div className="space-y-2">
                                <RadioGroup
                                  value={
                                    newQuizOptions.filter(
                                      (option) => option.correct == true
                                    )?.[0]?.label
                                  }
                                  onValueChange={(value) => {
                                    setNewQuizOptions([
                                      {
                                        label: "True",
                                        correct: value == "True",
                                      },
                                      {
                                        label: "False",
                                        correct: value == "False",
                                      },
                                    ]);
                                  }}
                                >
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="True" />
                                      <Label>True</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="False" />
                                      <Label>False</Label>
                                    </div>
                                  </div>
                                </RadioGroup>
                              </div>
                            )}
                            {newQuizQuestion.type === "single" && (
                              <RadioGroup
                                value={
                                  newQuizOptions.filter(
                                    (option) => option.correct == true
                                  )?.[0]?.label
                                }
                                onValueChange={(value) => {
                                  let options = newQuizOptions;
                                  setNewQuizOptions([
                                    ...options.map((option) => {
                                      if (option.label == value) {
                                        return {
                                          label: option.label,
                                          correct: true,
                                        };
                                      } else {
                                        return {
                                          label: option.label,
                                          correct: false,
                                        };
                                      }
                                    }),
                                  ]);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value={newQuizOptions[0].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[0].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[0].correct,
                                        },
                                        newQuizOptions[1],
                                        newQuizOptions[2],
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 1`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value={newQuizOptions[1].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[1].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[1].correct,
                                        },
                                        newQuizOptions[2],
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 2`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value={newQuizOptions[2].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[2].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        newQuizOptions[1],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[2].correct,
                                        },
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 3`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value={newQuizOptions[3].label || ""}
                                  />
                                  <Input
                                    value={newQuizOptions[3].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        newQuizOptions[1],
                                        newQuizOptions[2],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[3].correct,
                                        },
                                      ]);
                                    }}
                                    placeholder={`Option 4`}
                                  />
                                </div>
                              </RadioGroup>
                            )}
                            {newQuizQuestion.type === "multiple" && (
                              <div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={newQuizOptions[0].correct}
                                    onCheckedChange={(checked) => {
                                      let options = newQuizOptions;
                                      if (checked) {
                                        options[0].correct = true;
                                      } else {
                                        options[0].correct = false;
                                      }
                                      setNewQuizOptions([...options]);
                                    }}
                                  />
                                  <Input
                                    value={newQuizOptions[0].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[0].correct,
                                        },
                                        newQuizOptions[1],
                                        newQuizOptions[2],
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 1`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={newQuizOptions[1].correct}
                                    onCheckedChange={(checked) => {
                                      let options = newQuizOptions;
                                      if (checked) {
                                        options[1].correct = true;
                                      } else {
                                        options[1].correct = false;
                                      }
                                      setNewQuizOptions([...options]);
                                    }}
                                  />
                                  <Input
                                    value={newQuizOptions[1].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[1].correct,
                                        },
                                        newQuizOptions[2],
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 2`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={newQuizOptions[2].correct}
                                    onCheckedChange={(checked) => {
                                      let options = newQuizOptions;
                                      if (checked) {
                                        options[2].correct = true;
                                      } else {
                                        options[2].correct = false;
                                      }
                                      setNewQuizOptions([...options]);
                                    }}
                                  />
                                  <Input
                                    value={newQuizOptions[2].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        newQuizOptions[1],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[2].correct,
                                        },
                                        newQuizOptions[3],
                                      ]);
                                    }}
                                    placeholder={`Option 3`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={newQuizOptions[3].correct}
                                    onCheckedChange={(checked) => {
                                      let options = newQuizOptions;
                                      if (checked) {
                                        options[3].correct = true;
                                      } else {
                                        options[3].correct = false;
                                      }
                                      setNewQuizOptions([...options]);
                                    }}
                                  />
                                  <Input
                                    value={newQuizOptions[3].label}
                                    onChange={(e) => {
                                      setNewQuizOptions([
                                        newQuizOptions[0],
                                        newQuizOptions[1],
                                        newQuizOptions[2],
                                        {
                                          label: e.target.value,
                                          correct: newQuizOptions[3].correct,
                                        },
                                      ]);
                                    }}
                                    placeholder={`Option 4`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              onClick={handleSaveMcqQuestion}
                              disabled={isSaving}
                              variant="outline"
                            >
                              {isSaving ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Saving MCQ Question...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save MCQ Question
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("custom")}
                      disabled={isSaving}
                      variant="outline"
                    >
                      Save and Next
                      <ArrowRight />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Interview Questions</CardTitle>
                  <CardDescription>
                    Add custom questions that will be asked during the interview
                    process. These questions will be presented to candidates in
                    the order specified.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobData.custom_interview_questions?.map(
                      (question, index) => (
                        <Card key={index} className="mb-4">
                          <CardContent className="pt-6">
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor={`question-${index}`}>
                                  Question
                                </Label>
                                <Textarea
                                  id={`question-${index}`}
                                  value={question.question}
                                  disabled
                                  placeholder="Enter your interview question"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Question Type</Label>
                                <Select value={question.question_type} disabled>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select question type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="technical">
                                      Technical
                                    </SelectItem>
                                    <SelectItem value="behavioral">
                                      Behavioral
                                    </SelectItem>
                                    <SelectItem value="problem_solving">
                                      Problem Solving
                                    </SelectItem>
                                    <SelectItem value="custom">
                                      Custom
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCustomQuestionDelete(index)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Question
                                </Button>
                              </div> */}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={newCustomInterviewQuestion.order_number}
                              onChange={(e) =>
                                handleCustomQuestionChange(
                                  "order_number",
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Question</Label>
                            <Textarea
                              value={newCustomInterviewQuestion.question}
                              onChange={(e) =>
                                handleCustomQuestionChange(
                                  "question",
                                  e.target.value
                                )
                              }
                              placeholder="Enter your interview question"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Question Type</Label>
                            <Select
                              value={newCustomInterviewQuestion.question_type}
                              onValueChange={(value) =>
                                handleCustomQuestionChange(
                                  "question_type",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">
                                  Technical
                                </SelectItem>
                                <SelectItem value="behavioral">
                                  Behavioral
                                </SelectItem>
                                <SelectItem value="problem_solving">
                                  Problem Solving
                                </SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleCreateCustomInterviewQuestion}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Question
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        onClick={() => navigate("/company/ai-interviewed-jobs")}
                        disabled={isSaving}
                      >
                        <Check />
                        Finish
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewJob;