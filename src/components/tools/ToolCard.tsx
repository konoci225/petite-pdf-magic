
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Original Tool interface for the tools page
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isPremium: boolean;
}

// Interface for the home page tools grid
interface HomePageTool {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
}

interface ToolCardProps {
  tool?: Tool;
  navigate?: (path: string) => void;
  isSubscriber?: boolean;
  
  // Homepage version properties
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  to?: string;
  color?: string;
}

const ToolCard = (props: ToolCardProps) => {
  const navigate = useNavigate();
  
  // Handle both versions of the card
  const isToolsPageVersion = !!props.tool;
  
  const handleClick = () => {
    if (isToolsPageVersion) {
      if (props.tool?.isPremium && !props.isSubscriber) {
        props.navigate ? props.navigate("/subscription") : navigate("/subscription");
      } else {
        props.navigate ? props.navigate(props.tool.path) : navigate(props.tool.path);
      }
    } else if (props.to) {
      navigate(props.to);
    }
  };

  // Render the tools page version
  if (isToolsPageVersion && props.tool) {
    const Icon = props.tool.icon;
    
    return (
      <Card className={`${props.tool.isPremium && !props.isSubscriber ? 'bg-gray-50 opacity-80' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {props.tool.name}
              {props.tool.isPremium && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 ml-2">
                  Premium
                </Badge>
              )}
            </CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p>{props.tool.description}</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleClick} 
            className="w-full"
            variant={props.tool.isPremium && !props.isSubscriber ? "outline" : "default"}
          >
            {props.tool.isPremium && !props.isSubscriber ? (
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
  }
  
  // Render the homepage version
  return (
    <Card className="overflow-hidden">
      <div className={`${props.color || 'bg-primary'} p-4`}>
        <div className="rounded-full bg-white bg-opacity-20 w-10 h-10 flex items-center justify-center">
          {props.icon}
        </div>
      </div>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{props.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleClick} className="w-full">
          Utiliser
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ToolCard;
