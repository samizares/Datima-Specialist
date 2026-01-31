import { toast, ToastT } from "sonner";
import { useActionFeedback } from "./hooks/use-action-feedback";
import { ActionState } from "./utils/to-action-state";
import { cn } from "@/lib/utils";

type FormProps = {
  action: (payload: FormData) => void;
  actionState: ActionState;
  children: React.ReactNode;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
  toastOptions?: Omit<ToastT, "id"> | undefined;
  className?: string;
};

const Form = ({
  action,
  actionState,
  children,
  onSuccess,
  onError,
  toastOptions,
  className,
}: FormProps) => {
  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message, toastOptions);
      }

      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message) {
        toast.error(actionState.message, toastOptions);
      }

      onError?.(actionState);
    },
  });

  return (
    <form action={action} className={cn("flex flex-col gap-y-2", className)}>
      {children}
    </form>
  );
};

export { Form };
