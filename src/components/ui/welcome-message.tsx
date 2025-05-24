
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent } from "./card";
import { Users } from "lucide-react";

export function WelcomeMessage() {
  const { currentUser } = useAuth();
  
  if (!currentUser?.email) return null;
  
  const getWelcomeName = (email: string) => {
    if (email === "inetmediablog@gmail.com") return "Desmond";
    if (email === "ibethel.inbox@gmail.com") return "Bethel";
    return "User";
  };

  const welcomeName = getWelcomeName(currentUser.email);

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">
              Welcome, {welcomeName}!
            </h2>
            <p className="text-sm text-muted-foreground">
              Here's your financial overview
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
