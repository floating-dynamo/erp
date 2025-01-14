import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import React from "react";

interface LoaderProps {
  text?: string;
  className?: string;
}

const Loader = ({ className, text }: LoaderProps) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center h-60 gap-6",
        className
      )}
    >
      <Loader2Icon className="animate-spin h-6 w-6 text-muted-foreground" />
      {text && <span className="ml-2 text-muted-foreground">{text}</span>}
    </div>
  );
};

export default Loader;
