import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import Button from "../components/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <CompassIcon className="h-10 w-10 text-aces-purple-300" />
      <h1 className="font-display text-2xl font-bold text-aces-purple-900">Page not found</h1>
      <p className="max-w-sm text-sm text-aces-purple-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
