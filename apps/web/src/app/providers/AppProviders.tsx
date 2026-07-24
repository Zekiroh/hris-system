import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import App from "../../App";
import { AuthProvider } from "../../app/auth/AuthContext";
import { LeaveProvider } from "../../features/leave/context/LeaveContext";

export function AppProviders() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeaveProvider>
          <App />
          <Toaster
            position="top-right"
            richColors
            expand={false}
            closeButton
            toastOptions={{ duration: 3000 }}
          />
        </LeaveProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
