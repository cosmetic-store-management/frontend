import { toast } from "./toast";

export function handleMutationError(
  error: any,
  fallbackMessage: string = "An error occurred",
) {
  if (error && error.message) {
    toast.error(error.message);
  } else if (typeof error === "string") {
    toast.error(error);
  } else {
    toast.error(fallbackMessage);
  }
}
