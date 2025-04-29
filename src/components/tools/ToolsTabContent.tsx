
import React from "react";
import { Tool } from "@/data/toolsData";
import ToolCard from "./ToolCard";

interface ToolsTabContentProps {
  tools: Tool[];
  navigate: (path: string) => void;
  isSubscriber: boolean;
}

const ToolsTabContent = ({ tools, navigate, isSubscriber }: ToolsTabContentProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map(tool => (
        <ToolCard
          key={tool.id}
          tool={tool}
          navigate={navigate}
          isSubscriber={isSubscriber}
        />
      ))}
    </div>
  );
};

export default ToolsTabContent;
