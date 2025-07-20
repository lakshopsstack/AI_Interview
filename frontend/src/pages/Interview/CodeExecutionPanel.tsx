import React from "react";
import { Editor } from "@monaco-editor/react";
import { Play, Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { interviewApi } from "@/services/interviewApi";

interface CodeExecutionPanelProps {
  questionId: number;
  onCompilationStatusChange?: (status: string) => void;
  onSuccessRateChange?: (rate: string) => void;
  compilationStatus: string;
  setCompilationStatus: React.Dispatch<React.SetStateAction<string>>;
  onNext?: () => void;
  onSubmit?: () => void;
  isLastQuestion?: boolean;
  isOnlyQuestion?: boolean;
  isFirstQuestion?: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

function CodeExecutionPanel({
  questionId,
  compilationStatus,
  setCompilationStatus,
  onNext,
  onSubmit,
  isLastQuestion,
  isOnlyQuestion,
}: CodeExecutionPanelProps) {
  const [taskId, setTaskId] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [codeError, setCodeError] = React.useState("");
  const [executionError, setSyntaxError] = React.useState("");
  const [runStatus, setRunStatus] = React.useState("");
  const [successRate, setSuccessRate] = React.useState("0%");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handleFinish = () => {
    navigate(`/interview/precheck?i_id=${searchParams.get("i_id")}`);
  };

  React.useEffect(() => console.log(taskId), [taskId]);

  const availableLanguages: string[] = [
    "C",
    "Python",
    "Java",
    "Cpp",
    "Nodejs",
    "Sqlite_3_48_0",
  ];

  // const expectedOutput = "Hello"; // set What result is required here nowww ...
  const codeTemplates: Record<string, string> = {
    C: '#include <stdio.h>\nint main(){\n\tprintf("Hello, World!");\n\treturn 0;\n}',
    Python: 'print("Hello, World!")',
    Java: 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
    Cpp: '#include <iostream>\nint main() {\n\tstd::cout << "Hello, World!" << std::endl;\n\treturn 0;\n}',
    Sqlite_3_48_0: "SELECT 'Hello, World!' AS message;",
    Nodejs: 'console.log("Hello, World!");',
  };
  const monacoLanguages: Record<string, string> = {
    C: "c",
    Python: "python",
    Java: "java",
    Cpp: "cpp",
    Sqlite_3_48_0: "sql",
    Nodejs: "javascript",
  };
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("C");
  const [code, setCode] = React.useState(codeTemplates["C"]);

  React.useEffect(() => {
    setCode(codeTemplates[selectedLanguage]);
    setCompilationStatus("");
  }, [selectedLanguage]);

  return (
    <div className="bg-[#18181b] h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 bg-[#27272a] border-b border-[#3f3f46] shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-green-500/20"
            onClick={async () => {
              setOutput("");
              setCodeError("");
              setSyntaxError("");
              setRunStatus("");
              setCompilationStatus("Running...");

              const currentCode = code || codeTemplates[selectedLanguage];
              setCode(currentCode);

              try {
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + "/interview/dsa-response", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("i_token")}`,
                  },
                  body: JSON.stringify({
                    language: selectedLanguage,
                    code: currentCode,
                    question_id: questionId,
                  }),
                });

                if (!response.ok) {
                  throw new Error("Failed to execute code");
                }
              } catch (error) {
                setCompilationStatus("Error: Failed to execute code");
                console.error("Error executing code:", error);
              }
            }}
          >
            <Play size={16} />
            Run Code
          </button>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="appearance-none bg-[#3f3f46] text-white rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleFinish}
            size="sm"
            className={cn(
              "px-4 py-2 rounded-lg transition-colors shadow-lg",
              runStatus === "successful"
                ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/20"
                : "hidden"
            )}
            disabled={runStatus !== "successful"}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Editor and Output Area */}
      <PanelGroup direction="vertical" className="flex-1">
        <Panel defaultSize={70} minSize={30}>
          <div className="h-full relative">
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1e1e1e] flex items-center px-4 border-b border-[#3f3f46]">
              <span className="text-sm text-gray-400">{selectedLanguage}</span>
            </div>
            <div className="absolute top-8 bottom-0 left-0 right-0">
              <Editor
                height="100%"
                width="100%"
                language={monacoLanguages[selectedLanguage] || "plaintext"}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                    useShadows: false,
                  },
                  renderWhitespace: "boundary",
                  wordWrap: "on",
                  bracketPairColorization: {
                    enabled: true,
                  },
                  guides: {
                    bracketPairs: true,
                  },
                }}
              />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="h-2 bg-border hover:bg-primary/50 transition-colors" />

        <Panel defaultSize={30} minSize={20}>
          <div className="h-full bg-[#18181b] border-t border-[#3f3f46]">
            <Tabs defaultValue="result" className="w-full h-full flex flex-col">
              <TabsList className="bg-[#27272a] w-full justify-start border-b border-[#3f3f46] shrink-0">
                <TabsTrigger
                  value="result"
                  className="data-[state=active]:bg-[#18181b] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                >
                  Result
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="result"
                className="p-4 space-y-4 flex-1 overflow-auto"
              >
                {codeError && (
                  <div className="text-red-500 bg-[#27272a] p-3 rounded-lg">
                    <h3 className="font-semibold mb-1 text-red-400">
                      Runtime Error:
                    </h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {codeError}
                    </pre>
                  </div>
                )}
                {executionError && (
                  <div className="text-red-500 bg-[#27272a] p-3 rounded-lg">
                    <h3 className="font-semibold mb-1 text-red-400">
                      Compilation Error:
                    </h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {executionError}
                    </pre>
                  </div>
                )}
                <div className="flex gap-2 bg-[#27272a] p-3 rounded-lg">
                  <span className="font-semibold text-gray-400">
                    Compilation Status:
                  </span>
                  <pre
                    className={`${
                      !executionError ? "text-green-400" : "text-red-500"
                    } font-mono`}
                  >
                    {compilationStatus}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Panel>
      </PanelGroup>

      <div className="flex justify-end gap-2 p-4 shrink-0">
        {isOnlyQuestion ? (
          <Button
            onClick={() => {
              console.log("Submit button (only question) clicked");
              onSubmit && onSubmit();
            }}
            variant="default"
          >
            Submit
          </Button>
        ) : !isLastQuestion ? (
          <Button
            onClick={() => {
              console.log("Go to Next Question button clicked");
              setCompilationStatus("");
              setCode(codeTemplates[selectedLanguage]);
              onNext && onNext();
            }}
            variant="default"
          >
            Go to Next Question
          </Button>
        ) : (
          <Button
            onClick={() => {
              console.log("Submit button (last question) clicked");
              onSubmit && onSubmit();
              interviewApi.updateInterview({status: "DSA Test Completed"}).then(() => {
                    console.log("Interview updated successfully");
              }).catch((err: any) => {
                    console.error("Error updating interview:", err);
              });
            }}
            variant="default"
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}

export default CodeExecutionPanel;
