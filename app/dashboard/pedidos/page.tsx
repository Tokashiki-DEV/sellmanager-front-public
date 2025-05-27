"use client";
import { useState } from "react";
import PedidosStep1 from "./step1";
import PedidosStep2 from "./step2";
import { IDisplayData, PedidoFormValues } from "@/app/interfaces";
import { useForm } from "@mantine/form";
import useSWR from "swr";
import fetcher from "@/app/fetcher";
import API from "@/app/api";
import { toast } from "react-toastify";

interface OrderPayload {
  order: {
    customer_id: number | null;
    employe_id: number;
  };
  order_items: Array<
    { service_id: number } | { product_id: number; quantity: number }
  >;
}

export default function Pedidos() {
  const { data: displayAllData }: { data: IDisplayData } = useSWR(
    "/displaydata",
    fetcher
  );
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pedidoForm = useForm<PedidoFormValues>({
    initialValues: {
      customer_name: "",
      customer_id: "",
      employee_id: "",
      employee_name: "",
      service_name: "",
      isClientEmpty: false,
      isProductEmpty: false,
      service_id: [],
      products: [],
    },
  });

  async function handleSubmitPedidoForm() {
    setIsSubmitting(true);
    try {
      const payload: OrderPayload = {
        order: {
          customer_id: Number(pedidoForm.values.customer_id),
          employe_id: Number(pedidoForm.values.employee_id),
        },
        order_items: [
          ...pedidoForm.values.service_id.map((serviceId) => ({
            service_id: Number(serviceId),
          })),
          ...pedidoForm.values.products.map((product) => ({
            product_id: product.product_id,
            quantity: product.quantity,
          })),
        ],
      };
      const response = await toast.promise(API.post("/sales", payload), {
        pending: "Cadastrando pedido...",
        success: "Pedido cadastrado com sucesso!",
        error: "Erro ao cadastrar o pedido, tente novamente!",
      });

      pedidoForm.reset();
      setStep(1);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PedidosStep1
            nextStep={nextStep}
            customers_data={displayAllData?.Customers || []}
            employee_data={displayAllData?.Employee || { employee_data: [] }}
            pedidoForm={pedidoForm}
          />
        );
      case 2:
        return (
          <PedidosStep2
            prevStep={prevStep}
            services_data={displayAllData?.Services || []}
            product_data={displayAllData?.Products || []}
            pedidoForm={pedidoForm}
            handleSubmitPedidoForm={handleSubmitPedidoForm}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return <div>{renderStep()}</div>;
}
