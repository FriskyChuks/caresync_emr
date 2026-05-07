// src/hooks/useAuth.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

// Create the hook
const useAuth = () => useContext(AuthContext);

// Export as both default and named
export default useAuth;
export { useAuth };