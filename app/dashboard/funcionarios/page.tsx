"use client";
import {
  Button,
  Checkbox,
  Modal,
  Pagination,
  Table,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "./funcionarios.css";
import {
  Employee,
  Employeedatum,
  EmployeeSales_data,
  Feedatum,
} from "@/app/interfaces";
import { JSX, useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import API from "@/app/api";
import "dayjs/locale/pt";
import useSWR from "swr";
import fetcher from "@/app/fetcher";
import { useDisclosure } from "@mantine/hooks";

import { toast } from "react-toastify";

const formatDate = (date: Date | null) =>
  date ? date.toISOString().split("T")[0] : "";

export default function Funcionarios() {
  const getStartOfDayLocal = (date: Date = new Date()) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    getStartOfDayLocal(),
    getStartOfDayLocal(),
  ]);
  const {
    data: employeeSales_data,
    isLoading,
    mutate,
  } = useSWR<EmployeeSales_data[]>(() => {
    const [start, end] = dateRange;
    if (!start || !end) return "/employee/sales";

    const startDate = formatDate(start);
    const endDate = formatDate(end);

    return `/employee/sales?start_date=${startDate}&end_date=${endDate}`;
  }, fetcher);
  const { data: fee_data }: { data: Feedatum[] } = useSWR("/fee", fetcher);

  const [currentDisplayEmployee, setCurrentDisplayEmployee] = useState<
    EmployeeSales_data[]
  >([]);

  const [feeData, setFeeData] = useState<Feedatum[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [name, setName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState({
    valor: true,
    data: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const totalItems = currentDisplayEmployee
    .flatMap((emp) => emp.orders || [])
    .reduce((acc, order) => acc + (order?.items?.length || 0), 0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPaginatedItems = () => {
    const allItems = currentDisplayEmployee
      .flatMap((emp) =>
        (emp.orders || []).flatMap((order) =>
          (order.items || []).map((item) => ({
            ...item,
            order,
          }))
        )
      )
      .sort((a, b) => (b.id || 0) - (a.id || 0));

    const startIndex = (currentPage - 1) * itemsPerPage;
    return allItems.slice(startIndex, startIndex + itemsPerPage);
  };

  function displayHandler(id: number) {
    setSelectedEmployeeId(id);
    if (!employeeSales_data) return;

    const found = employeeSales_data.find((emp) => emp.employee_id === id);

    const safeFound = found
      ? {
          ...found,
          orders: (found.orders || []).map((order) => ({
            ...order,
            items: order.items || [],
          })),
        }
      : null;

    setCurrentDisplayEmployee(safeFound ? [safeFound] : []);
  }

  async function handleSubmit() {
    const payload = {
      name: name,
    };

    const response = await toast.promise(API.post("/employee", payload), {
      pending: "Cadastrando pedido...",
      success: "Pedido cadastrado com sucesso!",
      error: "Erro ao cadastrar o pedido, tente novamente!",
    });
    close();
  }

  const handleDateChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  async function deleteHandler(id: any) {
    await API.patch(`/sales/deleteorderitem`, { id: id });
    setCurrentDisplayEmployee((prev) =>
      prev.map((emp) => ({
        ...emp,
        orders: emp.orders
          .map((order) => ({
            ...order,
            items: order.items.filter((it) => it.id !== id),
          }))
          .filter((order) => order.items.length > 0),
      }))
    );
  }

  async function deleteEmployeHandler(id: number) {
    toast.promise(
      API.patch(`/employee/${id}`).then(() => {
        mutate();
        setCurrentDisplayEmployee([]);
      }),
      {
        pending: "Excluindo funcionario...",
        success: "Funcionario excluido com sucesso!",
        error: "Erro ao excluir o funcionario, tente novamente!",
      }
    );
  }

  useEffect(() => {
    if (employeeSales_data) {
      const safeData = employeeSales_data
        .filter((emp) => emp.employee_id !== undefined)
        .map((emp) => ({
          ...emp,
          orders: (emp.orders || []).map((order) => ({
            ...order,
            items: order.items || [],
          })),
        }));

      if (safeData.length > 0) {
        setCurrentDisplayEmployee([safeData[0]]);
        setSelectedEmployeeId(safeData[0].employee_id);
      } else {
        setCurrentDisplayEmployee([]);
        setSelectedEmployeeId(0);
      }
    }
  }, [employeeSales_data]);

  useEffect(() => {
    if (fee_data) {
      setFeeData(fee_data.filter((f) => f.is_used));
    }
  }, [fee_data]);

  return (
    <div className="flex flex-col w-full h-full">
      <p className="flex items-center p-[16] w-full h-[56] font-bold text-2xl text-[var(--primary-color)] border-b border-[var(--separator-color)]">
        Funcionarios
      </p>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-[350] h-full border border-[var(--separator-color)] p-[16] gap-y-[16]">
          <div className=" border-b pb-[16] border-[var(--separator-color)]">
            <DatePickerInput
              locale="pt"
              label="Filtrar por data"
              placeholder="Hoje"
              className="funcionariosDatepicker"
              type="range"
              allowSingleDateInRange
              clearable
              value={dateRange}
              onChange={handleDateChange}
            />
          </div>
          <div className="flex flex-col w-full">
            <p className="font-bold text-lg text-[var(--color-text1)] py-[16]">
              Funcionarios cadastrados
            </p>
            <Modal
              opened={opened}
              onClose={close}
              title="Cadastrar um funcionario"
              centered
              size="md"
              className="modalFuncionarios"
            >
              <div className="flex flex-col  w-full h-full gap-y-[32]">
                <p className="font-medium text-sm text-[var(--small-text)]">
                  Preencha os dados para cadastrar um funcionario.
                </p>
                <div className="flex flex-col gap-y-[16]">
                  <TextInput
                    label="Nome"
                    required
                    placeholder="Nome do Funcionario"
                    className="addEmployeInput"
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                </div>
                <Button className="addButton" onClick={handleSubmit}>
                  Cadastrar Funcionario
                </Button>
              </div>
            </Modal>
            <Button
              className="addButton w-full"
              id="funcionariosAddButton"
              onClick={open}
            >
              Cadastrar funcionario
            </Button>
          </div>
          <div className="flex flex-col w-full gap-y-[8] employeeCardWrapper">
            {employeeSales_data?.map((item) => {
              return (
                <button
                  type="button"
                  className={`flex flex-col w-full p-[8] border border-[var(--separator-color)] rounded-lg gap-y-[2] cursor-pointer employeCard ${
                    selectedEmployeeId === item.employee_id
                      ? "selected-employee"
                      : ""
                  }`}
                  key={item.employee_id}
                  onClick={() => {
                    displayHandler(item.employee_id);
                  }}
                >
                  <p className="font-bold text-lg flex justify-start">
                    {item.employee_name}
                  </p>
                  <div className="flex flex-row gap-x-[4]">
                    <p className="font-medium text-sm ">Vendas:</p>
                    <p className="font-bold text-sm ">{item.order_count}</p>
                  </div>
                  <div className="flex flex-row gap-x-[4]">
                    <p className="font-medium text-sm ">Comissão:</p>
                    <p className="font-bold text-sm ">
                      {feeData
                        .filter((fee) => fee.is_used)
                        .reduce((total, fee) => {
                          let commission = 0;

                          if (fee.name === "service_comission_percent") {
                            commission =
                              (item.total_service_amount * Number(fee.value)) /
                              100 /
                              100;
                          }

                          if (fee.name === "product_comission_percent") {
                            commission =
                              (item.total_product_amount * Number(fee.value)) /
                              100 /
                              100;
                          }

                          return total + commission;
                        }, 0)
                        .toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col w-full h-full p-[16]">
            <p className="text-center text-gray-500 py-8">Carregando...</p>
          </div>
        ) : currentDisplayEmployee.length > 0 ? (
          <div className="flex flex-col w-full h-full p-[16]">
            <div className="flex flex-row font-bold text-2xl text-[var(--color-text1)] gap-x-[16]">
              <div>
                Informações detalhadas de{" "}
                {currentDisplayEmployee[0]?.employee_name}
              </div>
              <div>
                <Modal
                  opened={deleteOpened}
                  onClose={closeDelete}
                  title="Confirmar exclusão"
                  centered
                  size="md"
                  className="modalFuncionarios"
                >
                  <div className="flex flex-col gap-y-6">
                    <p className="text-lg font-bold">
                      Tem certeza que deseja excluir este funcionário?
                    </p>
                    <div className="flex justify-end gap-x-4">
                      <Button
                        variant="outline"
                        color="gray"
                        onClick={closeDelete}
                      >
                        Cancelar
                      </Button>
                      <Button
                        color="red"
                        onClick={() =>
                          deleteEmployeHandler(
                            Number(currentDisplayEmployee[0].employee_id)
                          )
                        }
                      >
                        Confirmar Exclusão
                      </Button>
                    </div>
                  </div>
                </Modal>
                <Button color="rgba(212, 0, 0, 1)" onClick={openDelete}>
                  <FaRegTrashAlt />
                </Button>
              </div>
            </div>
            <div className="flex flex-row items-end justify-between py-[16]">
              <div className="flex flex-row gap-x-[16]">
                <div className="flex flex-row gap-x-[8]">
                  <p className="font-medium text-base text-[var(--color-text1)]">
                    Comissão:
                  </p>
                  <p className="font-bold text-base text-[var(--color-text1)]">
                    {feeData
                      .filter((fee) => fee.is_used)
                      .reduce((total, fee) => {
                        let commission = 0;

                        if (fee.name === "service_comission_percent") {
                          commission =
                            ((currentDisplayEmployee[0]?.total_service_amount ||
                              0) *
                              Number(fee.value)) /
                            100 /
                            100;
                        }

                        if (fee.name === "product_comission_percent") {
                          commission =
                            ((currentDisplayEmployee[0]?.total_product_amount ||
                              0) *
                              Number(fee.value)) /
                            100 /
                            100;
                        }

                        return total + commission;
                      }, 0)
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  </p>
                </div>
                <div className="flex flex-row gap-x-[8]">
                  <p className="font-medium text-base text-[var(--color-text1)]">
                    Vendas:
                  </p>
                  <p className="font-bold text-base text-[var(--color-text1)]">
                    {currentDisplayEmployee[0]?.order_count}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-lg text-[var(--color-text1)]">
                  Exibir dados
                </p>
                <div className="flex flex-row gap-x-[10]">
                  <Checkbox
                    label="Valor"
                    color="#0A265C"
                    className="funcionariosCheckbox"
                    checked={visibleColumns.valor}
                    onChange={(e) =>
                      setVisibleColumns({
                        ...visibleColumns,
                        valor: e.currentTarget.checked,
                      })
                    }
                  />
                  <Checkbox
                    label="Data"
                    color="#0A265C"
                    className="funcionariosCheckbox"
                    checked={visibleColumns.data}
                    onChange={(e) =>
                      setVisibleColumns({
                        ...visibleColumns,
                        data: e.currentTarget.checked,
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
                className="produtosTable"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="theadStart">Item</Table.Th>
                    <Table.Th className="thead">Nome do cliente</Table.Th>
                    <Table.Th className="thead">Produto/Serviço</Table.Th>
                    {visibleColumns.valor && (
                      <Table.Th className="thead">Valor</Table.Th>
                    )}
                    {visibleColumns.data && (
                      <Table.Th className="thead">Data</Table.Th>
                    )}
                    <Table.Th className="theadEnd">Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {getPaginatedItems().map(({ order, ...item }) => {
                    if (!order || !item) return null;
                    if (item.product_id !== 0 && item.product_name) {
                      return (
                        <Table.Tr
                          key={`${order?.order_id || 0}-product-${
                            item?.id || 0
                          }`}
                        >
                          <Table.Td>{order?.order_id || "N/A"}</Table.Td>
                          <Table.Td>
                            {order?.customer_name || "Cliente não identificado"}
                          </Table.Td>
                          <Table.Td>
                            Produto - {item?.product_name || "N/A"}
                          </Table.Td>
                          {visibleColumns.valor && (
                            <Table.Td>
                              R$ {item?.product_price! / 100 || 0}
                            </Table.Td>
                          )}
                          {visibleColumns.data && (
                            <Table.Td>
                              {new Date(
                                order?.created_at || "N/A"
                              ).toLocaleString("pt-BR")}
                            </Table.Td>
                          )}
                          <Table.Td>
                            <FaRegTrashAlt
                              className="trashIcon"
                              onClick={() => deleteHandler(item.id)}
                            />
                          </Table.Td>
                        </Table.Tr>
                      );
                    }

                    if (item.service_id !== 0 && item.service_name) {
                      return (
                        <Table.Tr key={`${order?.order_id}-service-${item.id}`}>
                          <Table.Td>{order?.order_id || "N/A"}</Table.Td>
                          <Table.Td>
                            {order?.customer_name || "Cliente não identificado"}
                          </Table.Td>
                          <Table.Td>
                            Serviço - {item?.service_name || "N/A"}{" "}
                          </Table.Td>
                          {visibleColumns.valor && (
                            <Table.Td>
                              R$ {item?.service_price! / 100 || 0}
                            </Table.Td>
                          )}
                          {visibleColumns.data && (
                            <Table.Td>
                              {new Date(
                                order?.created_at || "N/A"
                              ).toLocaleString("pt-BR")}
                            </Table.Td>
                          )}
                          <Table.Td>
                            <FaRegTrashAlt
                              className="trashIcon"
                              onClick={() => deleteHandler(item.id)}
                            />
                          </Table.Td>
                        </Table.Tr>
                      );
                    }

                    return null;
                  })}
                </Table.Tbody>
              </Table>
              {totalPages > 1 && (
                <Pagination
                  color="#0A265C"
                  total={totalPages}
                  value={currentPage}
                  onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo(0, 0);
                  }}
                  mt="md"
                  className="pagination"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full p-[16]">
            <p className="text-center text-gray-500 py-8">
              Selecione um funcionário para visualizar os detalhes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
