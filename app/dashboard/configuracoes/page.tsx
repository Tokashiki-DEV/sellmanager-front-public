"use client";
import { Button, Checkbox, TextInput } from "@mantine/core";
import "./configuracoes.css";
import { Feedatum } from "@/app/interfaces";
import { useEffect, useState } from "react";
import API from "@/app/api";
import useSWR, { mutate } from "swr";
import fetcher from "@/app/fetcher";
import { toast } from "react-toastify";

export default function Configuracoes() {
  const feeMock: Feedatum[] = [
    { id: 0, name: "service_comission_percent", value: 0, is_used: false },
    { id: 0, name: "product_comission_percent", value: 0, is_used: false },
  ];

  const { data: fee_data, error } = useSWR<Feedatum[]>("/fee", fetcher);
  const [feeData, setFeeData] = useState<Feedatum[]>(feeMock);

  const serviceEntry = feeData.find(
    (f) => f.name === "service_comission_percent"
  )!;
  const productEntry = feeData.find(
    (f) => f.name === "product_comission_percent"
  )!;

  const [serviceChecked, setServiceChecked] = useState(false);
  const [productChecked, setProductChecked] = useState(false);
  const [serviceFeeValue, setServiceFeeValue] = useState(0);
  const [productFeeValue, setProductFeeValue] = useState(0);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fee_data) {
      setFeeData(fee_data);
      const svc = fee_data.find((f) => f.name === "service_comission_percent");
      const prd = fee_data.find((f) => f.name === "product_comission_percent");

      if (svc) {
        setServiceChecked(svc.is_used);
        setServiceFeeValue(svc.value);
      }
      if (prd) {
        setProductChecked(prd.is_used);
        setProductFeeValue(prd.value);
      }
    }
  }, [fee_data]);

  async function handleSubmit() {
    setIsSaving(true);

    const payloads = [
      { id: serviceEntry.id, value: serviceFeeValue, is_used: serviceChecked },
      { id: productEntry.id, value: productFeeValue, is_used: productChecked },
    ];

    await toast.promise(
      Promise.all(payloads.map((p) => API.patch("/fee", p))),
      {
        pending: "Salvando configurações...",
        success: "Configurações salvas com sucesso!",
        error: "Erro ao salvar configurações. Tente novamente!",
      }
    );

    await mutate("/fee");

    setIsSaving(false);
  }

  if (error) {
    return <div>Erro ao carregar configurações.</div>;
  }

  return (
    <div className="flex flex-col justify-center items-start w-[750] h-[400] bg-[var(--sidebar-bg-color)] border border-solid border-[#0a265c25] rounded-lg">
      <div className="flex flex-col p-[32] w-full h-full gap-y-[32]">
        <p className="font-bold text-2xl text-[var(--primary-color)]">
          Configurações
        </p>

        <div className="flex flex-row gap-x-[16] justify-between">
          <TextInput
            label="Comissão de serviços (%)"
            description="Percentual que o funcionário recebe sobre serviços"
            value={String(serviceFeeValue)}
            onChange={(e) => setServiceFeeValue(Number(e.currentTarget.value))}
            className="feeInput"
          />
          <TextInput
            label="Comissão de produtos (%)"
            description="Percentual que o funcionário recebe sobre produtos"
            value={String(productFeeValue)}
            onChange={(e) => setProductFeeValue(Number(e.currentTarget.value))}
            className="feeInput"
          />
        </div>

        <div className="flex flex-col gap-y-[10]">
          <p className="font-semibold text-lg text-[var(--color-text1)]">
            Funcionários recebem comissão de:
          </p>
          <div className="flex flex-row gap-x-[10]">
            <Checkbox
              label="Serviços"
              color="#0A265C"
              checked={serviceChecked}
              onChange={(e) => setServiceChecked(e.currentTarget.checked)}
            />
            <Checkbox
              label="Produtos"
              color="#0A265C"
              checked={productChecked}
              onChange={(e) => setProductChecked(e.currentTarget.checked)}
            />
          </div>
        </div>

        <Button
          className="confirmButton"
          onClick={handleSubmit}
          loading={isSaving}
          disabled={isSaving}
        >
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}
