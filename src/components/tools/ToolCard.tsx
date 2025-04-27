
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
  color: string;
}

const ToolCard = ({ title, description, icon, to, color }: ToolCardProps) => {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-all border hover:shadow-md hover:-translate-y-1">
        <CardHeader>
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${color}`}
          >
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium text-pdf-primary group-hover:text-pdf-accent transition-colors flex items-center gap-2">
            Utiliser cet outil
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform transform group-hover:translate-x-1"
            >
              <path
                d="M6.5 12.5L11 8L6.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ToolCard;
