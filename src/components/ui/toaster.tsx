import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport 
        className="fixed bottom-4 right-4 top-auto flex flex-col-reverse gap-2 w-full max-w-[420px] z-[200]"
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
          pointerEvents: 'none',
        }}
      />
    </ToastProvider>
  )
}