import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Wand2,
  Copy,
  ArrowRight,
  Sparkles,
  PenBox,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { companyApi } from "@/services/companyApi";

interface AIGeneratePopupProps {
  title: string;
  fieldLabel: string;
  jobTitle: string;
  department: string;
  location: string;
  jobType: string;
  keyQualification: string;
  minExperience: string;
  maxExperience: string;
  onGenerated: (content: string) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

const AIGeneratePopup: React.FC<AIGeneratePopupProps> = ({
  title,
  fieldLabel,
  jobTitle,
  department,
  location,
  jobType,
  keyQualification,
  minExperience,
  maxExperience,
  onGenerated,
  buttonText = "Generate with AI",
  buttonVariant = "outline",
  buttonSize = "sm",
}) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState("keywords");
  const [keywords, setKeywords] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getButtonIcon = () => {
    switch (fieldLabel) {
      case "Description":
        return <PenBox className="mr-2 h-4 w-4" />;
      case "Requirements":
        return <Lightbulb className="mr-2 h-4 w-4" />;
      default:
        return <Wand2 className="mr-2 h-4 w-4" />;
    }
  };

  const handleGenerate = async () => {
    if (!jobTitle) {
      toast.error("Please enter a job title first");
      return;
    }

    if (!department) {
      toast.error("Please select department first");
      return;
    }

    if (!location) {
      toast.error("Please select location first");
      return;
    }

    if (!keyQualification) {
      toast.error("Please enter key qualification first");
      return;
    }

    if (!minExperience || !maxExperience) {
      toast.error("Please enter experience range first");
      return;
    }

    if (tabValue === "keywords" && !keywords.trim()) {
      toast.error("Please enter some keywords");
      return;
    }

    if (tabValue === "custom" && !customPrompt.trim()) {
      toast.error("Please enter a custom prompt");
      return;
    }

    setIsGenerating(true);

    try {
      let content = "";

      if (fieldLabel === "Description") {
        const response = await companyApi.generateAiInterviewedJobDescription(
          jobTitle,
          department,
          location,
          keyQualification,
          minExperience,
          maxExperience
        );
        content = response.data.description;
      } else if (fieldLabel === "Requirements") {
        const response = await companyApi.generateAiInterviewedJobRequirements(
          jobTitle,
          department,
          location,
          keyQualification,
          minExperience,
          maxExperience,
          keywords
        );
        content = response.data.requirements;
      }

      setGeneratedContent(content);
      toast.success(`${fieldLabel} generated successfully`);
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onGenerated(generatedContent);
      setOpen(false);
      toast.success(`${fieldLabel} applied successfully`);

      setGeneratedContent("");
      setKeywords("");
      setCustomPrompt("");
      setTabValue("keywords");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedContent)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={"sm"}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all shadow-sm hover:shadow-md"
      >
        {getButtonIcon()}
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-b from-background to-background/80 border-slate-200/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-500" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!generatedContent ? (
              <>
                <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-4 mb-2 border border-slate-200/20">
                  <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <PenBox className="h-4 w-4 text-blue-500" />
                    Job Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">
                        {jobTitle || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">
                        {department || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">
                        {location || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">
                        {jobType || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <Tabs value={tabValue} onValueChange={setTabValue}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="keywords"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Keywords
                    </TabsTrigger>
                    <TabsTrigger
                      value="custom"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      <PenBox className="h-4 w-4 mr-2" />
                      Custom Prompt
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="keywords" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="keywords">Enter Keywords</Label>
                      <Input
                        id="keywords"
                        placeholder={
                          fieldLabel === "Description"
                            ? "e.g., remote work, flexible hours, startup culture, innovation"
                            : fieldLabel === "Requirements"
                            ? "e.g., 5+ years experience, Python, AWS, Agile, leadership"
                            : "e.g., 401k matching, unlimited PTO, health insurance, stock options"
                        }
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="mt-1.5 border-slate-300 focus-visible:ring-blue-500"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Separate keywords with commas for better results
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="custom" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="custom-prompt">Custom Prompt</Label>
                      <Textarea
                        id="custom-prompt"
                        placeholder={`Create a detailed ${fieldLabel.toLowerCase()} for a ${jobTitle} position...`}
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="min-h-[120px] mt-1.5 border-slate-300 focus-visible:ring-purple-500"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Generated {fieldLabel}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="hover:bg-slate-100 border-slate-300"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="hover:bg-slate-100 border-slate-300"
                    >
                      {isGenerating ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-1.5" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-4 min-h-[200px] max-h-[300px] overflow-y-auto bg-white/50 backdrop-blur-sm shadow-inner">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {!generatedContent ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Apply to Form
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIGeneratePopup;
