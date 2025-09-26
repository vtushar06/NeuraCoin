import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";

export default function AuthInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []); // Empty dependency array is key

  return null; // This component renders nothing
}
