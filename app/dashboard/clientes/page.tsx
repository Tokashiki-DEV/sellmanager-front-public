"use client";
import {
  Button,
  Checkbox,
  Pagination,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import "./clientes.css";
import { Customer } from "@/app/interfaces";
import { useEffect, useState } from "react";
import {
  FaRegTrashAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import API from "@/app/api";
import useSWR from "swr";
import fetcher from "@/app/fetcher";
import { toast } from "react-toastify";
import { useForm } from "@mantine/form";

export default function Clientes() {
  const { data: customersFetchData }: { data: Customer[] } = useSWR(
    "/customers",
    fetcher
  );
  const [bestSearch, setBestSearch] = useState("");
  const [bestSearchQuery, setBestSearchQuery] = useState("");
  const { data: bestCustomersFetchData }: { data: Customer[] } = useSWR(
    `/customers/best${bestSearchQuery ? `?name=${bestSearchQuery}` : ""}`,
    fetcher
  );
  const customersDataMock = [
    {
      id: 1,
      created_at: "Carregando...",
      name: "Carregando...",
      email: "Carregando...",
      phone: "Carregando...",
      last_purchase: "Carregando...",
      total_spend: 0,
      total_orders: 0,
    },
  ];

  const bestCustomersDataMock = [
    {
      id: 0,
      created_at: "Carregando...",
      name: "Carregando...",
      email: "Carregando...",
      phone: "Carregando...",
      last_purchase: "Carregando...",
      total_spend: 0,
      total_orders: 0,
    },
  ];

  const [tableData, setTableData] = useState(customersDataMock);
  const [bestCustomersData, setBestCustomersData] = useState(
    bestCustomersDataMock
  );
  const [search, setSearch] = useState("");
  const [customerCounter, setCustomerCounter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const newCustomerForm = useForm({
    initialValues: {
      name: "",
      phone: "",
      email: "",
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Nome muito curto" : null),

      email: (value) =>
        value.length > 0 && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          ? "Email inválido"
          : null,
    },
  });

  const itemsPerPage = 10;

  const filteredData = tableData.filter(
    (item) =>
      (item.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.phone?.toLowerCase() || "").includes(search.toLowerCase())
  );
  const dataToShow = search === "" ? tableData : filteredData;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataToShow.slice(startIndex, endIndex);
  const totalPages = Math.ceil(dataToShow.length / itemsPerPage);

  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    cadastro: true,
    ultimoCorte: true,
  });

  async function deleteHandler(id: any) {
    await API.patch(`/customers`, { id: id });
    setTableData((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSubmit() {
    const validation = newCustomerForm.validate();
    if (!validation.hasErrors) {
      const payload = {
        name: newCustomerForm.getValues().name,
        phone: newCustomerForm.getValues().phone,
        email: newCustomerForm.getValues().email || undefined,
      };

      const response = await toast.promise(API.post("/customers", payload), {
        pending: "Cadastrando cliente...",
        success: "Cliente cadastrado com sucesso!",
        error: "Erro ao cadastrar o cliente, tente novamente!",
      });
      newCustomerForm.reset();
    }
  }
  async function handleEdit(id: number) {
    try {
      const payload = {
        id: id,
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
      };

      setTableData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );

      await toast.promise(API.patch("/customers/update", payload), {
        pending: "Atualizando cliente...",
        success: "Cliente atualizado com sucesso!",
        error: "Erro ao atualizar o cliente, tente novamente!",
      });
    } catch (error) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                name: item.name,
                phone: item.phone,
                email: item.email,
              }
            : item
        )
      );
      toast.error("Erro ao atualizar o cliente");
    } finally {
      setEditingId(null);
    }
  }

  useEffect(() => {
    if (customersFetchData) {
      setTableData(customersFetchData);
      setCustomerCounter(customersFetchData.length);
    }
    if (bestCustomersFetchData) {
      setBestCustomersData(bestCustomersFetchData);
    }

    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, customersFetchData, bestCustomersFetchData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setBestSearchQuery(bestSearch);
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [bestSearch]);

  return (
    <div className="flex flex-col w-full h-full">
      <p className="flex items-center p-[16] w-full h-[56] font-bold text-2xl text-[var(--primary-color)] border-b border-[var(--separator-color)]">
        Clientes
      </p>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-[350] h-full border border-[var(--separator-color)] p-[16] bestCustomersWrapper">
          <p className="font-bold text-lg text-[var(--color-text1)] border-b border-[var(--separator-color)]">
            Melhores Clientes
          </p>
          <div className="flex flex-row items-end gap-x-[8] border-b border-[var(--separator-color)] py-[8]">
            <TextInput
              label="Pesquisar"
              description="Digite o nome do cliente"
              placeholder="Nome do cliente"
              className="clienteTextInput w-full"
              value={bestSearch}
              onChange={(e) => setBestSearch(e.currentTarget.value)}
            />
          </div>
          {bestCustomersFetchData?.map((item) => {
            return (
              <div
                className="flex flex-col border-b border-[var(--separator-color)] py-[8]"
                key={item.id}
              >
                <p className="font-bold text-sm text-[var(--color-text1)]">
                  {item.name}
                </p>
                <div className="flex flex-row items-end gap-x-[4]">
                  <p className="font-medium text-sm text-[var(--color-text1)]">
                    Total gasto:
                  </p>
                  <p className="font-bold text-sm text-[var(--color-text1)]">
                    R$ {item.total_spend / 100}
                  </p>
                </div>
                <p className="font-medium text-sm text-[var(--color-text1)]">
                  Total de compras: {item.total_orders}
                </p>
              </div>
            );
          })}
        </div>
        <div className="w-full">
          <div className="flex flex-col px-[16] py-[6] w-full rightSideWrapper">
            <p className="font-bold text-2xl text-[var(--color-text1)]">
              Cadastrar cliente
            </p>
            <div className="flex flex-row items-end gap-x-[16] border-b border-[var(--separator-color)] py-[16]">
              <TextInput
                label="Nome"
                required
                placeholder="Nome do cliente"
                className="clienteTextInput"
                value={newCustomerForm.values.name}
                onChange={(e) =>
                  newCustomerForm.setFieldValue("name", e.currentTarget.value)
                }
                error={newCustomerForm.errors.name}
              />

              <TextInput
                label="Telefone"
                required
                placeholder="Telefone do cliente"
                className="clienteTextInput"
                value={newCustomerForm.values.phone}
                onChange={(e) =>
                  newCustomerForm.setFieldValue("phone", e.currentTarget.value)
                }
                error={newCustomerForm.errors.phone}
              />

              <TextInput
                label="Email"
                placeholder="Email do cliente"
                className="clienteTextInput"
                value={newCustomerForm.values.email}
                onChange={(e) =>
                  newCustomerForm.setFieldValue("email", e.currentTarget.value)
                }
                error={newCustomerForm.errors.email}
              />

              <Button className="addButton" onClick={handleSubmit}>
                Cadastrar Cliente
              </Button>
            </div>
            <div>
              <p className="font-bold text-2xl py-[8] text-[var(--color-text1)]">
                Lista de clientes
              </p>
              <p className="font-bold text-xl py-[8] text-[var(--color-text1)]">
                Total de clientes cadastrados: {customerCounter}
              </p>
              <div className="flex flex-row gap-x-[238] items-end py-[16]">
                <TextInput
                  label="Pesquisar"
                  description="Digite o nome do cliente"
                  placeholder="Nome do cliente"
                  className="clienteTextInput w-1/3"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
                <div>
                  <p className="font-semibold text-lg text-[var(--color-text1)]">
                    Exibir dados
                  </p>
                  <div className="flex flex-row gap-x-[10]">
                    <Checkbox
                      label="Email"
                      color="#0A265C"
                      className="clienteCheckbox"
                      checked={visibleColumns.email}
                      onChange={(e) =>
                        setVisibleColumns({
                          ...visibleColumns,
                          email: e.currentTarget.checked,
                        })
                      }
                    />
                    <Checkbox
                      label="Data de cadastro"
                      color="#0A265C"
                      className="clienteCheckbox"
                      checked={visibleColumns.cadastro}
                      onChange={(e) =>
                        setVisibleColumns({
                          ...visibleColumns,
                          cadastro: e.currentTarget.checked,
                        })
                      }
                    />
                    <Checkbox
                      label="Último corte"
                      color="#0A265C"
                      className="clienteCheckbox"
                      checked={visibleColumns.ultimoCorte}
                      onChange={(e) =>
                        setVisibleColumns({
                          ...visibleColumns,
                          ultimoCorte: e.currentTarget.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
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
                  className="clienteTable"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th className="theadStart">Nome</Table.Th>
                      <Table.Th className="thead">Telefone</Table.Th>
                      {visibleColumns.email && (
                        <Table.Th className="thead">Email</Table.Th>
                      )}
                      {visibleColumns.cadastro && (
                        <Table.Th className="thead">Data de cadastro</Table.Th>
                      )}
                      {visibleColumns.ultimoCorte && (
                        <Table.Th className="thead">Última compra</Table.Th>
                      )}
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

                          <Table.Td>
                            {editingId === item.id ? (
                              <TextInput
                                value={editData.phone}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    phone: e.target.value,
                                  })
                                }
                                className="edit-input"
                              />
                            ) : (
                              item.phone
                            )}
                          </Table.Td>

                          {visibleColumns.email && (
                            <Table.Td>
                              {editingId === item.id ? (
                                <TextInput
                                  value={editData.email}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="edit-input"
                                />
                              ) : (
                                item.email
                              )}
                            </Table.Td>
                          )}

                          {visibleColumns.cadastro && (
                            <Table.Td>
                              {new Date(item.created_at).toLocaleString(
                                "pt-BR"
                              )}
                            </Table.Td>
                          )}

                          {visibleColumns.ultimoCorte && (
                            <Table.Td>{item.last_purchase}</Table.Td>
                          )}

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
                                        phone: item.phone || "",
                                        email: item.email || "",
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
      </div>
    </div>
  );
}
