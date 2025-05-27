// hooks/useAuth.ts
import { useRouter } from "next/navigation";
import { loginSucessData } from "./interfaces";
import { useLocalStorage } from "./hooks/use-local-storage";

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useLocalStorage({ key: "sellManagerStoredToken" });
  const [loggedUsername, setName] = useLocalStorage({ key: "sellManagerStoredName" });
  const [loggedRole, setRole] = useLocalStorage({ key: "sellManagerStoredRole" });

  function apiHandleLogin(data: loginSucessData) {
    setToken(data.token);
    setName(data.name);
    setRole(data.role);
  }

  function apiLogout() {
    setToken("");
    setName("");
    setRole("");
    router.push("/");
  }

  return {
    apiHandleLogin,
    apiLogout,
    token,
    loggedUsername,
    loggedRole
  };
}
