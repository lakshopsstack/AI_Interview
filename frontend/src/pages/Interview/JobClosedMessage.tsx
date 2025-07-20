import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Lock, XCircle } from "lucide-react";

const JobClosedMessage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50 py-12 px-2">
    <Card className="w-full max-w-md shadow-xl border bg-background">
      <CardHeader className="flex flex-col items-center gap-2 pb-2">
        <div className="bg-destructive/10 rounded-full p-3 mb-2">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Job Closed</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          This job is closed and no longer accepting applications or interviews.<br />
          If you believe this is a mistake, please contact the company or support.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Lock className="h-6 w-6 text-muted-foreground mb-2" />
        <span className="text-muted-foreground text-sm">Thank you for your interest.</span>
      </CardContent>
    </Card>
  </div>
);

export default JobClosedMessage; 