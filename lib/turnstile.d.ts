declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}
export {};
