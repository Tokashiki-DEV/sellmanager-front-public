import { Button, Checkbox, Modal, Select } from "@mantine/core";
import "./pedidos.css";
import ClientePopup from "./clientePopup";
import {
  Customer,
  Employee,
  Employeedatum,
  PedidoFormValues,
} from "@/app/interfaces";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

type props = {
  nextStep: () => void;
  employee_data: Employee;
  customers_data: Customer[];
  pedidoForm: ReturnType<typeof useForm<PedidoFormValues>>;
};

const customerMock: Customer = {
  created_at: "Carregando...",
  email: "Carregando...",
  id: 0,
  last_purchase: "Carregando...",
  name: "Carregando...",
  phone: "Carregando...",
  total_orders: 0,
  total_spend: 0,
};

export default function PedidosStep1({
  nextStep,
  employee_data,
  customers_data: initialCustomersData,
  pedidoForm,
}: props) {
  useEffect(() => {
    setCustomersData(initialCustomersData);
  }, [initialCustomersData]);
  const [opened, { open, close }] = useDisclosure(false);
  const [customersData, setCustomersData] =
    useState<Customer[]>(initialCustomersData);
  const handleNewCustomer = (newCustomer: Customer) => {
    setCustomersData((prev) => [...prev, newCustomer]);

    pedidoForm.setValues({
      customer_id: String(newCustomer.id),
      customer_name: newCustomer.name,
      isClientEmpty: false,
    });
  };

  const isFormValid = () => {
    const {
      isClientEmpty,
      employee_id,
      customer_id: client_id,
      customer_name: client_name,
    } = pedidoForm.values;

    if (!employee_id) return false;

    if (isClientEmpty) return true;
    return Boolean(client_id && client_name);
  };

  return (
    <div className="flex flex-col justify-center items-start w-[600] h-[516] bg-[var(--sidebar-bg-color)] border border-solid border-[#0a265c25] rounded-lg ">
      <div className="flex flex-col p-[32] w-full h-full gap-y-[32]">
        <div className=" flex flex-col gap-2">
          <p className="font-bold text-2xl text-[var(--primary-color)]">
            Adicionar pedido
          </p>
          <p className="font-medium text-sm text-[var(--small-text)]">
            Selecione o cliente e o funcionario para gerar esse pedido
          </p>
        </div>
        <Select
          className="ordersSelect"
          searchable
          label="Funcionario"
          description="Selecione o funcionario que irá gerar o pedido"
          placeholder="Nome do funcionario"
          onChange={(value) => {
            const selected = employee_data.employee_data.find(
              (emp) => String(emp.id) === value
            );
            if (selected) {
              pedidoForm.setValues({
                employee_id: String(selected.id),
                employee_name: selected.name,
              });
            }
          }}
          data={employee_data.employee_data.map((item) => ({
            value: String(item.id),
            label: item.name,
          }))}
          required
        />
        <Select
          className="ordersSelect"
          label="Cliente"
          description="Selecione o cliente para gerar o pedido"
          searchable
          placeholder="Nome do cliente"
          onChange={(value) => {
            const selected = customersData.find(
              (client) => String(client.id) === value
            );
            if (selected) {
              pedidoForm.setValues({
                customer_id: String(selected.id),
                customer_name: selected.name,
                isClientEmpty: false,
              });
            }
          }}
          data={customersData.map((item) => ({
            value: String(item.id),
            label: `${item.name} - ${item.phone}`,
          }))}
          disabled={pedidoForm.values.isClientEmpty}
          required={!pedidoForm.values.isClientEmpty}
          value={
            pedidoForm.values.isClientEmpty ? "" : pedidoForm.values.customer_id
          }
        />
        <div className="flex flex-row justify-between">
          <Checkbox
            label="Continuar sem cadastro"
            color="#0A265C"
            checked={pedidoForm.values.isClientEmpty}
            onChange={(e) => {
              const isChecked = e.target.checked;
              pedidoForm.setValues({
                isClientEmpty: isChecked,
                customer_id: isChecked ? "0" : "",
                customer_name: isChecked ? "Sem cadastro" : "",
              });
            }}
          />
          <ClientePopup
            pedidoForm={pedidoForm}
            onCustomerCreated={handleNewCustomer}
          />
        </div>
        <Button
          className="confirmButton"
          disabled={!isFormValid()}
          onClick={() => nextStep()}
        >
          Próximo passo
        </Button>
      </div>
    </div>
  );
}
