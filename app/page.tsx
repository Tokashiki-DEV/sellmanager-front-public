"use client";
import { TextInput, Button, ActionIcon } from "@mantine/core";
import { FaUserCircle } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./login.css";
import { useState } from "react";
import { useForm } from "@mantine/form";
import API from "./api";
import { useAuth } from "./loginService";
import { useRouter } from "next/navigation";
export default function Login() {
  const { apiHandleLogin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginForm = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  async function handleLogin() {
    const { username, password } = loginForm.getValues();
    const { data } = await API.post("/login", {
      username: username,
      password: password,
    });

    if (data.status == 401) {
      loginForm.setErrors({
        username: "Usuário ou senha invalida",
        password: "Usuário ou senha invalida",
      });
    }
    apiHandleLogin(data);
    router.push("/dashboard/home");
  }

  return (
    <div className="flex flex-row">
      <div className="flex flex-row h-screen w-2/3">
        <div className="flex flex-col items-center justify-center gap-y-4 bg-[#040810] text-white w-full">
          <div className="flex flex-col justify-center items-center">
            <p className="text-2xl font-medium">BEM VINDO AO</p>
            <p className="text-4xl tracking-[12px] font-bold">SELLS MANAGER</p>
          </div>
          <div className="flex flex-col rounded-2xl w-1/3 h-1/3 gap-y-2.5 p-4 items-center bg-[#F8F8F8] text-[#252525]">
            <div>
              <p className="font-bold">Notas de atualização</p>
            </div>
            <div>
              <p className="font-regular text-base">
                V1.0 - Lançamento oficial do Sells Manager
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center w-1/3 gap-y-4">
        <FaUserCircle className="userIcon" />
        <TextInput
          placeholder="Usuário"
          variant="filled"
          className="userInput"
          key={loginForm.key("username")}
          {...loginForm.getInputProps("username")}
          required
        />
        <TextInput
          placeholder="Senha"
          variant="filled"
          className="passwordInput"
          type={showPassword ? "text" : "password"}
          required
          key={loginForm.key("password")}
          {...loginForm.getInputProps("password")}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          rightSection={
            <ActionIcon
              onClick={() => setShowPassword(!showPassword)}
              style={{
                cursor: "pointer",
                backgroundColor: "transparent",
                color: "black",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </ActionIcon>
          }
        />
        <Button variant="filled" className="loginButton" onClick={handleLogin}>
          Logar
        </Button>
      </div>
    </div>
  );
}
