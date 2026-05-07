import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  const { loading } = useAuth();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-700 font-medium">Loading CareSync...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait while we secure your session</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;