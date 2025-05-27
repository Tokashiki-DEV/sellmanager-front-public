import "./servicos.css";
import { Button, TextInput } from "@mantine/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import API from "@/app/api";

export default function CadastrarServicoPopup() {
  const [cost, setCost] = useState<number>(0);
  const [name, setName] = useState<string>("");

  async function handleSubmit() {
    const payload = {
      name: name,
      price: cost,
    };
    await API.post("/services", payload);
    alert("criado!");
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="addButton" id="serviceAddButton">
          Cadastrar serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center min-w-fit items-start gap-8 bg-[var(--sidebar-bg-color)] border border-solid border-[#0a265c25] rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-[var(--primary-color)]">
            Cadastrar um serviço
          </DialogTitle>
          <DialogDescription className="font-medium text-sm text-[var(--small-text)]">
            Preencha os dados para cadastrar um serviço.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col border-b border-[var(--separator-color)] pb-[32] w-full gap-y-[18]">
          <div className="flex flex-col gap-4">
            <TextInput
              label="Nome"
              description="Digite o nome do serviço"
              placeholder="Nome do serviço"
              className="servicosPopupTextInput"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextInput
              label="Valor"
              description="Digite o valor do serviço"
              placeholder="R$"
              className="servicosPopupTextInput"
              onChange={(e) => setCost(Number(e.target.value) * 100)}
              required
            />
          </div>
        </div>
        <Button className="confirmButton" onClick={handleSubmit}>
          Cadastrar Serviço
        </Button>
      </DialogContent>
    </Dialog>
  );
}
