import { LoaderIcon } from "lucide-react";

function LoaderUI() {
  return (
    <div className="bg-[#E5F4DD] min-h-screen h-[calc(100vh-4rem-1px)] flex items-center justify-center">
      <LoaderIcon className="h-8 w-8 animate-spin text-[#547454]" />
    </div>
  );
}

export default LoaderUI;