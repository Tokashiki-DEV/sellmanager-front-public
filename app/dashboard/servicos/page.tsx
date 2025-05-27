"use client";
import {
  Button,
  Checkbox,
  Modal,
  NumberInput,
  NumberInputHandlers,
  Pagination,
  Table,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { useEffect, useRef, useState } from "react";
import "./servicos.css";
import { FaCheck, FaEdit, FaRegTrashAlt, FaTimes } from "react-icons/fa";
import CadastrarServicoPopup from "./servicoPopup";
import { IDisplayData, Service } from "@/app/interfaces";
import API from "@/app/api";
import fetcher from "@/app/fetcher";
import useSWR from "swr";
import { useDisclosure } from "@mantine/hooks";
import { toast } from "react-toastify";

const servicosMock = [
  {
    id: 0,
    name: "Carregando...",
    price: 0,
  },
];

export default function Servicos() {
  const { data: displayAllData }: { data: IDisplayData } = useSWR(
    "/displaydata",
    fetcher
  );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState(servicosMock);
  const [name, setName] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    price: 0,
  });

  const itemsPerPage = 10;

  const filteredData = tableData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const dataToShow = search === "" ? tableData : filteredData;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataToShow.slice(startIndex, endIndex);

  const totalPages = Math.ceil(dataToShow.length / itemsPerPage);
  useEffect(() => {
    if (displayAllData?.Services) {
      setTableData(displayAllData?.Services);
    }
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, displayAllData]);

  async function handleSubmit() {
    const payload = {
      name: name,
      price: cost,
    };

    const response = await toast.promise(API.post("/services", payload), {
      pending: "Cadastrando serviço...",
      success: "Serviço cadastrado com sucesso!",
      error: "Erro ao cadastrar o serviço, tente novamente!",
    });
    close();
  }

  async function deleteHandler(id: any) {
    await API.patch(`/services/${id}`);
    setTableData((prev) => prev.filter((item) => item.id !== id));
  }
  async function handleEdit(id: number) {
    try {
      const payload = {
        id: id,
        name: editData.name,
        price: editData.price,
      };

      setTableData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );

      await toast.promise(API.patch("/services", payload), {
        pending: "Atualizando serviço...",
        success: "Serviço atualizado com sucesso!",
        error: "Erro ao atualizar o serviço, tente novamente!",
      });
    } catch (error) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                name: item.name,
                price: item.price,
              }
            : item
        )
      );
      toast.error("Erro ao atualizar o serviço");
    } finally {
      setEditingId(null);
    }
  }

  return (
    <div className="flex flex-col w-full h-full servicesWrapper">
      <p className="flex items-center p-[16] w-full h-[56] font-bold text-2xl text-[var(--primary-color)] border-b border-[var(--separator-color)]">
        Serviços
      </p>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-full h-full px-[16]">
          <p className="font-bold text-2xl py-[16] text-[var(--color-text1)]">
            Lista de serviços
          </p>
          <div className="flex flex-col border-b border-[var(--separator-color)] pb-[32] w-full gap-y-[18]">
            <div className="flex flex-row items-end gap-x-[32] w-full">
              <TextInput
                label="Pesquisar"
                description="Digite o nome do serviço"
                placeholder="Nome do serviço"
                className="pesquisarTextInput"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
              <Modal
                opened={opened}
                onClose={close}
                title="Cadastrar um serviço"
                centered
                size="md"
                className="modalServico"
              >
                <div className="flex flex-col border-[var(--separator-color)] pb-[32] w-full gap-y-[18]">
                  <p className="font-medium text-sm text-[var(--small-text)]">
                    Preencha os dados para cadastrar um serviço.
                  </p>
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
                <Button
                  className="confirmButton"
                  id="confirmServico"
                  onClick={handleSubmit}
                >
                  Cadastrar Serviço
                </Button>
              </Modal>
              <Button
                className="addButton"
                id="serviceAddButton"
                onClick={open}
              >
                Cadastrar serviço
              </Button>
            </div>
          </div>
          <div className="py-[16]">
            <Table
              striped
              highlightOnHover
              withTableBorder
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                borderRadius: "10px",
                overflow: "hidden",
              }}
              className="produtosTable"
              verticalSpacing="sm"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="theadStart">Nome</Table.Th>
                  <Table.Th className="thead">Valor</Table.Th>
                  <Table.Th className="theadEnd">Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedData
                  .filter((item) => item.id !== 0)
                  .map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        {editingId === item.id ? (
                          <TextInput
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                name: e.target.value,
                              })
                            }
                            className="edit-input"
                          />
                        ) : (
                          item.name
                        )}
                      </Table.Td>
                      <Table.Td className="flex flex-row items-center">
                        R$
                        {editingId === item.id ? (
                          <TextInput
                            value={editData.price / 100}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                price: Number(e.target.value) * 100,
                              })
                            }
                            className="edit-input"
                          />
                        ) : (
                          (item.price / 100).toFixed(2)
                        )}
                      </Table.Td>
                      <Table.Td>
                        <div className="flex flex-row gap-x-[16]">
                          {editingId === item.id ? (
                            <>
                              <FaCheck
                                className="cursor-pointer text-green-500"
                                onClick={() => handleEdit(item.id)}
                              />
                              <FaTimes
                                className="cursor-pointer text-red-500"
                                onClick={() => setEditingId(null)}
                              />
                            </>
                          ) : (
                            <>
                              <FaRegTrashAlt
                                className="trashIcon cursor-pointer"
                                onClick={() => deleteHandler(item.id)}
                              />
                              <FaEdit
                                className="cursor-pointer"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditData({
                                    name: item.name || "",
                                    price: item.price,
                                  });
                                }}
                              />
                            </>
                          )}
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
            <Pagination
              color="#0A265C"
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              mt="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
