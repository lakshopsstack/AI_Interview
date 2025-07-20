import React from 'react';
// at the top of your file
import MDEditor from '@uiw/react-md-editor';

interface QuestionAreaProps {
  title: string; // e.g., "EduDiagno - Question 1"
  successRate: string; // e.g., "Success rate: 2.56%"
  questionNumber: string; // e.g., "1."
  questionTitle: string; // e.g., "Two Sum"
  difficulty: string; // e.g., "Easy"
  topics?: string[]; // Optional array, e.g., ["Array", "Hash Table"]
  companies?: string[]; // Optional array, e.g., ["Google", "Amazon"]
  hint?: string; // Optional hint text
  description: string; // Allows text or JSX (e.g., with <code>)
  testCases: { input: string; expectedOutput: string }[]; // Array of test cases
  constraints?: string; // Optional constraints text
  compilationStatus?: string;
}

function DsaQuestion({
  title,
  successRate,
  questionNumber,
  questionTitle,
  difficulty,
  topics = [],
  companies = [],
  hint,
  description,
  testCases,
  constraints,
  compilationStatus
}: QuestionAreaProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-[#18181b] text-white p-4 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="mb-4 shrink-0">
        <h3 className="text-lg font-semibold">
          {questionNumber} {questionTitle}
        </h3>
        <span className={`text-sm font-medium ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </span>
        {topics.length > 0 && (
          <div className="mt-2">
            <span className="font-medium">Topics: </span>
            {topics.join(', ')}
          </div>
        )}
        {companies.length > 0 && (
          <div className="mt-2">
            <span className="font-medium">Companies: </span>
            {companies.join(', ')}
          </div>
        )}
        {hint && (
          <div className="mt-2">
            <span className="font-medium">Hint: </span>
            {hint}
          </div>
        )}
      </div>

      {/* <div className="mb-4">
        {description}
        {constraints && (
          <p className="mt-2">{constraints}</p>
        )}
      </div> */}
      <div
        className="mb-4 prose max-w-none dark:prose-invert overflow-auto"
        data-color-mode="dark"
      >
        <MDEditor.Markdown source={String(description)}
          style={{
            backgroundColor: "#18181b",
            color: "white",
            borderRadius: "8px",
          }}
        />

        {constraints && <p className="mt-2">{constraints}</p>}
      </div>

      <div className="shrink-0">
        <h4 className="text-lg font-semibold mb-2">Sample Test Cases</h4>
        <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-600 p-2">Input</th>
              <th className="border border-gray-600 p-2">Expected Output</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase, index) => (
              <tr key={index}>
                <td className="border border-gray-600 p-2">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{testCase.input}</pre>
                </td>
                <td className="border border-gray-600 p-2">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{testCase.expectedOutput}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default DsaQuestion;