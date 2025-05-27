import "./pedidos.css";
import { Button, TextInput } from "@mantine/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "@mantine/form";
import {
  Customer,
  CustomerFormValues,
  PedidoFormValues,
} from "@/app/interfaces";
import API from "@/app/api";
import { useState } from "react";
import { formatPhoneNumber } from "@/app/utils/masks";
import { toast } from "react-toastify";

type Props = {
  pedidoForm: ReturnType<typeof useForm<PedidoFormValues>>;
  onCustomerCreated?: (newCustomer: any) => void;
};
export default function ClientePopup({ pedidoForm, onCustomerCreated }: Props) {
  const customerForm = useForm<CustomerFormValues>({
    initialValues: {
      name: "",
      phone: "",
      email: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleCustomerFormSubmit() {
    setLoading(true);
    if (customerForm.getValues().name == "") {
      customerForm.setErrors({
        name: "Campo obrigatório para realizar o cadastro!",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await toast.promise(
        API.post("/customers", customerForm.values),
        {
          pending: "Cadastrando cliente...",
          success: "Cliente cadastrado com sucesso!",
          error: "Erro ao cadastrar o cliente, tente novamente!",
        }
      );
      const newCustomer = {
        id: response.data,
        name: customerForm.values.name,
        phone: customerForm.values.phone,
        email: customerForm.values.email,
        created_at: new Date().toISOString(),
        last_purchase: "",
        total_orders: 0,
        total_spend: 0,
      };

      pedidoForm.setFieldValue("client_id", String(response.data));
      pedidoForm.setFieldValue("client_name", customerForm.values.name);

      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }

      setDialogOpen(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="addButton">Cadastrar cliente</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center items-start gap-8 bg-[var(--sidebar-bg-color)] border border-solid border-[#0a265c25] rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-[var(--primary-color)]">
            Cadastrar um cliente
          </DialogTitle>
          <DialogDescription className="font-medium text-sm text-[var(--small-text)]">
            Preencha os dados para cadastrar um cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4">
          <TextInput
            label="Nome"
            required
            placeholder="Nome do cliente"
            className="addClientInput"
            key={customerForm.key("name")}
            {...customerForm.getInputProps("name")}
          />
          <TextInput
            label="Telefone"
            required
            placeholder="Telefone do cliente"
            className="addClientInput"
            key={customerForm.key("phone")}
            value={customerForm.values.phone!}
            onChange={(event) => {
              const formatted = formatPhoneNumber(event.currentTarget.value);
              customerForm.setFieldValue("phone", formatted);
            }}
          />
          <TextInput
            label="Email"
            placeholder="Email do cliente"
            className="addClientInput"
            key={customerForm.key("email")}
            {...customerForm.getInputProps("email")}
          />
        </div>
        <Button className="confirmButton" onClick={handleCustomerFormSubmit}>
          Cadastrar Cliente
        </Button>
      </DialogContent>
    </Dialog>
  );
}
