import { useState, useCallback } from "react";

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ title, description, variant = "default" }) => {
    setToast({ title, description, variant, id: Date.now() });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return {
    toast,
    showToast,
    toast: showToast, // Alias for compatibility
  };
};

