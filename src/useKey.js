
import { useEffect, useCallback } from "react";

export function useKey(key, action) {
  
  const callback = useCallback(
    (e) => {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        action();
      }
    },
    [key, action]
  );

  useEffect(() => {
  document.addEventListener("keydown", callback);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [callback]);
}
