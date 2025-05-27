"use client";
import { useAuth } from "@/app/loginService";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { loggedRole } = useAuth();
  const router = useRouter();
  return (
    <div className="flex flex-col justify-center max-h-svh w-full items-center gap-y-[16]">
      <p className="font-bold text-2xl text-[var(--primary-color)] ">
        Bem vindo ao Sells Manager!
      </p>
      <p className="p-[16] font-bold text-xl text-[var(--primary-color)] ">
        Clique em uma opção para o acesso rapido ou clique nos botões da barra
        lateral
      </p>
      <div className="flex flex-row gap-x-[16]">
        <button
          type="button"
          className="flex flex-col p-[8] border border-[var(--separator-color)] w-90 h-20 rounded-lg gap-y-[2] cursor-pointer homeCard"
          onClick={() => router.push("/dashboard/pedidos")}
        >
          <p className="font-bold text-lg flex justify-start">Criar Pedido</p>
          <div className="flex flex-row gap-x-[4]">
            <p className="font-medium text-sm ">Ir para tela de criar pedido</p>
            <p className="font-bold text-sm "></p>
          </div>
        </button>
        <button
          type="button"
          className="flex flex-col p-[8] border border-[var(--separator-color)] w-90 h-20 rounded-lg gap-y-[2] cursor-pointer homeCard"
          onClick={() => router.push("/dashboard/clientes")}
        >
          <p className="font-bold text-lg flex justify-start">
            Cadastrar cliente
          </p>
          <div className="flex flex-row gap-x-[4]">
            <p className="font-medium text-sm ">
              Ir para tela de cadastrar clientes
            </p>
            <p className="font-bold text-sm "></p>
          </div>
        </button>
      </div>
      <div className="flex flex-row gap-x-[16] ">
        {loggedRole === "admin" ? (
          <button
            type="button"
            className="flex flex-col p-[8] border border-[var(--separator-color)] w-90 h-20 rounded-lg gap-y-[2] cursor-pointer homeCard"
            onClick={() => router.push("/dashboard/funcionarios")}
          >
            <p className="font-bold text-lg flex justify-start">
              Comissão de hoje
            </p>
            <div className="flex flex-row gap-x-[4]">
              <p className="font-medium text-sm ">
                Visualizar comissão dos funcionarios de hoje
              </p>
              <p className="font-bold text-sm "></p>
            </div>
          </button>
        ) : null}

        <button
          type="button"
          className="flex flex-col p-[8] border border-[var(--separator-color)]  w-90 h-20 rounded-lg gap-y-[2] cursor-pointer homeCard"
          onClick={() => router.push("/dashboard/clientes")}
        >
          <p className="font-bold text-lg flex justify-start">
            Clientes cadastrados
          </p>
          <div className="flex flex-row gap-x-[4]">
            <p className="font-medium text-sm ">
              Visualizar clientes cadastrados
            </p>
            <p className="font-bold text-sm "></p>
          </div>
        </button>
      </div>
    </div>
  );
}
