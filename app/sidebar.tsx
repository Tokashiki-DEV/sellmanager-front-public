"use client";
import "./sidebar.css";
import {
  FaShoppingCart,
  FaUserCircle,
  FaUserFriends,
  FaHome,
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { FaScissors, FaUsers, FaGear } from "react-icons/fa6";
import { BsFillBarChartFill } from "react-icons/bs";
import { IoMdExit } from "react-icons/io";
import {
  TbLayoutSidebarRightExpandFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";
import { useState } from "react";
import { useAuth } from "./loginService";
import { usePathname, useRouter } from "next/navigation";

export default function SideBar() {
  const [isSideBarActive, setIsSidebarActive] = useState<boolean>(true);
  const { apiLogout, loggedUsername, loggedRole, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <>
      {isSideBarActive ? (
        <div
          className={"sidebar flex flex-col p-4 h-lvh w-50 items-center gap-8"}
        >
          <div className="flex flex-row justify-around items-center userInfo border-bottom-separator font-bold text-lg h-[90px] w-full">
            <div className="flex flex-row items-center gap-[16] truncate">
              <FaUserCircle className="navUserIcon" />
              <p>{loggedUsername}</p>
            </div>
            <TbLayoutSidebarRightExpandFilled
              className="h-6 w-6 cursor-pointer mt-1 sidebarCloseIcon"
              onClick={() => setIsSidebarActive(false)}
            />
          </div>
          <div
            className={`nav-1 p-1 flex flex-row gap-1 font-medium font-base w-full items-center justify-left ${
              isActive("/dashboard/home") ? "isActive" : ""
            }`}
            onClick={() => router.push("/dashboard/home")}
          >
            <FaHome className="navIcon" />
            <p>Home</p>
          </div>
          <div
            className={`nav-1 p-1 flex flex-row gap-1 font-medium font-base w-full items-center justify-left ${
              isActive("/dashboard/pedidos") ? "isActive" : ""
            }`}
            onClick={() => router.push("/dashboard/pedidos")}
          >
            <FaShoppingCart className="navIcon" />
            <p>Pedidos</p>
          </div>
          <div className="flex flex-col gap-2 justify-left w-full">
            <div
              onClick={() => router.push("/dashboard/produtos")}
              className={`nav-1 ${
                isActive("/dashboard/produtos") ? "isActive" : ""
              }`}
            >
              <AiFillProduct className="navIcon" />
              <p>Produtos</p>
            </div>
            <div
              onClick={() => router.push("/dashboard/servicos")}
              className={`nav-1 ${
                isActive("/dashboard/servicos") ? "isActive" : ""
              }`}
            >
              <FaScissors className="navIcon" />
              <p>Serviços</p>
            </div>
            <div
              onClick={() => router.push("/dashboard/clientes")}
              className={`nav-1 ${
                isActive("/dashboard/clientes") ? "isActive" : ""
              }`}
            >
              <FaUserFriends className="navIcon" />
              <p>Clientes</p>
            </div>
            <div
              onClick={() => router.push("/dashboard/historico")}
              className={`nav-1 ${
                isActive("/dashboard/historico") ? "isActive" : ""
              }`}
            >
              <BsFillBarChartFill className="navIcon" />
              <p>Histórico</p>
            </div>
            {loggedRole === "admin" ? (
              <div
                onClick={() => router.push("/dashboard/funcionarios")}
                className={`nav-1 ${
                  isActive("/dashboard/funcionarios") ? "isActive" : ""
                }`}
              >
                <FaUsers className="navIcon" />
                <p>Funcionarios</p>
              </div>
            ) : null}
            {loggedRole === "admin" ? (
              <div
                onClick={() => router.push("/dashboard/configuracoes")}
                className={`nav-1 ${
                  isActive("/dashboard/configuracoes") ? "isActive" : ""
                }`}
              >
                <FaGear className="navIcon" />
                <p>Configurações</p>
              </div>
            ) : null}
          </div>
          <div className="logoutButton" onClick={() => apiLogout()}>
            <p>Deslogar</p>
            <IoMdExit className="navIcon mt-1" />
          </div>
        </div>
      ) : (
        <div
          className={"sidebar flex flex-col p-2 h-lvh w-15 items-center gap-8"}
        >
          <div className="flex flex-col justify-center items-center gap-2 userInfo border-bottom-separator font-bold text-lg h-[90px] w-full">
            <FaUserCircle className="navUserIcon" />
            <TbLayoutSidebarLeftExpandFilled
              className="h-6 w-6 cursor-pointer mt-1 sidebarCloseIcon"
              onClick={() => setIsSidebarActive(true)}
            />
          </div>
          <div
            className={`nav-1 p-1 flex flex-row gap-1 font-medium font-base w-full items-center justify-center ${
              isActive("/dashboard/pedidos") ? "isActive" : ""
            }`}
            onClick={() => router.push("/dashboard/pedidos")}
          >
            <FaShoppingCart className="navIcon" />
          </div>
          <div className="flex flex-col gap-2 justify-center w-full">
            <div
              onClick={() => router.push("/dashboard/produtos")}
              className={`nav-1 justify-center ${
                isActive("/dashboard/produtos") ? "isActive" : ""
              }`}
            >
              <AiFillProduct className="navIcon" />
            </div>
            <div
              onClick={() => router.push("/dashboard/servicos")}
              className={`nav-1 justify-center ${
                isActive("/dashboard/servicos") ? "isActive" : ""
              }`}
            >
              <FaScissors className="navIcon" />
            </div>
            <div
              onClick={() => router.push("/dashboard/clientes")}
              className={`nav-1 justify-center ${
                isActive("/dashboard/clientes") ? "isActive" : ""
              }`}
            >
              <FaUserFriends className="navIcon" />
            </div>
            <div
              onClick={() => router.push("/dashboard/historico")}
              className={`nav-1 justify-center ${
                isActive("/dashboard/historico") ? "isActive" : ""
              }`}
            >
              <BsFillBarChartFill className="navIcon" />
            </div>

            {loggedRole == "admin" ? (
              <div
                onClick={() => router.push("/dashboard/funcionarios")}
                className={`nav-1 justify-center ${
                  isActive("/dashboard/funcionarios") ? "isActive" : ""
                }`}
              >
                <FaUsers className="navIcon" />
              </div>
            ) : null}
            {loggedRole == "admin" ? (
              <div
                onClick={() => router.push("/dashboard/configuracoes")}
                className={`nav-1 justify-center ${
                  isActive("/dashboard/configuracoes") ? "isActive" : ""
                }`}
              >
                <FaGear className="navIcon" />
              </div>
            ) : null}
          </div>
          <div className="logoutButton" onClick={() => apiLogout()}>
            <IoMdExit className="navIcon mt-1" />
          </div>
        </div>
      )}
    </>
  );
}
