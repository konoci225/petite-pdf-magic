
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isPremium: boolean;
}

interface ToolCardProps {
  tool: Tool;
  navigate: (path: string) => void;
  isSubscriber: boolean;
}

const ToolCard = ({ tool, navigate, isSubscriber }: ToolCardProps) => {
  const handleClick = () => {
    if (tool.isPremium && !isSubscriber) {
      navigate("/subscription");
    } else {
      navigate(tool.path);
    }
  };

  const Icon = tool.icon;

  return (
    <Card className={`${tool.isPremium && !isSubscriber ? 'bg-gray-50 opacity-80' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {tool.name}
            {tool.isPremium && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 ml-2">
                Premium
              </Badge>
            )}
          </CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p>{tool.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClick} 
          className="w-full"
          variant={tool.isPremium && !isSubscriber ? "outline" : "default"}
        >
          {tool.isPremium && !isSubscriber ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Débloquer
            </>
          ) : (
            "Utiliser"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ToolCard;
