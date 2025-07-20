import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface RejectionStageProps {
  score: number;
  skillsMatch: { skill: string; match: boolean }[];
  jobTitle: string;
}

const RejectionStage: React.FC<RejectionStageProps> = ({ score, skillsMatch, jobTitle }) => {
  const matchingSkills = skillsMatch.filter(s => s.match).map(s => s.skill);
  const missingSkills = skillsMatch.filter(s => !s.match).map(s => s.skill);
  
  // Recommendations based on missing skills
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (missingSkills.includes("Node.js")) {
      recommendations.push("Take a Node.js course on platforms like Udemy or Coursera");
    }
    
    if (missingSkills.includes("GraphQL")) {
      recommendations.push("Build a small project using GraphQL and add it to your portfolio");
    }
    
    if (missingSkills.includes("AWS")) {
      recommendations.push("Get AWS certified with a focus on cloud development");
    }
    
    // Add generic recommendations if we don't have specific ones
    if (recommendations.length === 0) {
      recommendations.push("Enhance your portfolio with projects showcasing key skills");
      recommendations.push("Consider gaining certification in relevant technologies");
    }
    
    return recommendations;
  };
  
  const recommendations = generateRecommendations();

  return (
    <div className="py-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Thank You for Your Interest</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We've carefully reviewed your profile for the {jobTitle} position. Unfortunately, we've identified some gaps between your current skills and our requirements.
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <h3 className="font-medium">Your Compatibility Score</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Match Level</span>
            <span className="text-sm font-medium">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Matching Skills
            </h4>
            <ul className="space-y-1">
              {matchingSkills.length > 0 ? (
                matchingSkills.map((skill, i) => (
                  <li key={i} className="text-sm pl-6">• {skill}</li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground pl-6">No matching skills identified</li>
              )}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              Areas for Development
            </h4>
            <ul className="space-y-1">
              {missingSkills.map((skill, i) => (
                <li key={i} className="text-sm pl-6">• {skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Recommendations for Improvement</h3>
        <ul className="space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2">
              <div className="mt-1 text-primary flex-shrink-0">•</div>
              <p className="text-sm">{rec}</p>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" asChild>
          <Link to="/jobseeker/job-search">
            View Other Opportunities
          </Link>
        </Button>
        <Button variant="default" asChild>
          <Link to="/">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default RejectionStage;