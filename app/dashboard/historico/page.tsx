"use client";
import { Checkbox, Pagination, Table, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "./historico.css";
import { useEffect, useState } from "react";
import { SalesData, SalesDatuum } from "@/app/interfaces";
import { FaRegTrashAlt } from "react-icons/fa";
import "dayjs/locale/pt";
import API from "@/app/api";
import useSWR from "swr";
import fetcher from "@/app/fetcher";
import { useAuth } from "@/app/loginService";
import { toast } from "react-toastify";

export default function Historico() {
  const { loggedRole } = useAuth();
  const getStartOfDayLocal = (date: Date = new Date()) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    getStartOfDayLocal(),
    null,
  ]);

  const [tableData, setTableData] = useState<SalesDatuum[]>([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [visibleColumns, setVisibleColumns] = useState({
    clientname: true,
    data: true,
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (dateRange?.[0]) params.append("start_date", dateRange[0].toString());
    if (dateRange?.[1]) params.append("end_date", dateRange[1].toString());
    if (search) params.append("search_name", search);
    if (currentPage) params.append("page", currentPage.toString());

    return params.toString();
  };

  const { data: HistoryFetchData } = useSWR(
    `/sales?${buildQueryParams()}`,
    fetcher
  );

  async function deleteHandler(id: any) {
    const response = await toast.promise(
      API.patch("/sales/deleteorder", { id: id }),
      {
        pending: "Excluindo venda...",
        success: "Venda excluida com sucesso!",
        error: "Erro ao excluir a venda, tente novamente!",
      }
    );
    setTableData((prev) => prev.filter((item) => item.id !== id));
  }

  useEffect(() => {
    if (HistoryFetchData?.data) {
      setTableData(HistoryFetchData.data);
    }
  }, [HistoryFetchData, dateRange, search]);

  return (
    <div className="flex flex-col w-full h-full">
      <p className="flex items-center p-[16] w-full h-[56] font-bold text-2xl text-[var(--primary-color)] border-b border-[var(--separator-color)]">
        Historico
      </p>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-[350] h-full border border-[var(--separator-color)] p-[16] gap-y-[16]">
          <div className=" border-b pb-[16] border-[var(--separator-color)]">
            <DatePickerInput
              locale="pt"
              label="Filtrar por data"
              placeholder="Hoje"
              type="range"
              clearable
              allowSingleDateInRange
              onChange={(dates) => {
                if (
                  dates[0] &&
                  dates[1] &&
                  dates[0].getTime() === dates[1].getTime()
                ) {
                  const nextDay = new Date(dates[1]);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setDateRange([dates[0], nextDay]);
                } else {
                  setDateRange(dates);
                }
              }}
            />
          </div>
          <div className="flex flex-col w-full">
            <p className="font-bold text-lg text-[var(--color-text1)] p-[8]">
              Resumo de vendas
            </p>
          </div>
          <div className="flex flex-col p-[8] border-b border-[var(--separator-color)] gap-y-[2]">
            <p className="font-bold text-sm text-[var(--color-text1)]">
              Valor total
            </p>
            <div className="flex flex-row gap-x-[4]">
              <p className="font-medium text-lg text-[var(--color-text1)]">
                R$
              </p>
              <p className="font-bold text-lg text-[var(--color-text1)]">
                {loggedRole === "admin"
                  ? (HistoryFetchData?.totalPrice / 100).toFixed(2)
                  : "Valor indisponivel como vendedor"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-x-[4] gap-y-[2] p-[8] border-b border-[var(--separator-color)] ">
            <p className="font-bold text-sm text-[var(--color-text1)]">
              Total de Vendas
            </p>
            <p className="font-bold text-lg text-[var(--color-text1)]">
              {HistoryFetchData?.count}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-full h-full p-[16]">
          <p className="font-bold text-2xl text-[var(--color-text1)]">
            Historico de vendas
          </p>

          <div className="flex flex-row items-end justify-between py-[16]">
            <TextInput
              label="Pesquisar"
              description="Digite o nome do cliente ou nome do funcionario"
              placeholder="Nome do cliente ou funcionario"
              className="historicoTextInput w-1/3"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <div className="px-[8]">
              <p className="font-semibold text-lg text-[var(--color-text1)]">
                Exibir dados
              </p>
              <div className="flex flex-row gap-x-[10]">
                <Checkbox
                  label="Nome do cliente"
                  color="#0A265C"
                  className="historicoCheckbox"
                  checked={visibleColumns.clientname}
                  onChange={(e) =>
                    setVisibleColumns({
                      ...visibleColumns,
                      clientname: e.currentTarget.checked,
                    })
                  }
                />
                <Checkbox
                  label="Data"
                  color="#0A265C"
                  className="historicoCheckbox"
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
          <div className="tableWrapper w-full">
            <Table
              striped
              highlightOnHover
              withTableBorder
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                borderRadius: "10px",
              }}
              className="historicoTable"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="theadStart">Venda ID</Table.Th>
                  <Table.Th className="thead">Funcionario</Table.Th>
                  <Table.Th className="thead">Produto/Serviço</Table.Th>
                  <Table.Th className="thead">Qtd.</Table.Th>
                  <Table.Th className="thead">Valor</Table.Th>
                  {visibleColumns.data && (
                    <Table.Th className="thead">Data</Table.Th>
                  )}
                  {visibleColumns.clientname && (
                    <Table.Th className="thead">N. Cliente</Table.Th>
                  )}
                  <Table.Th className="theadEnd">Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tableData
                  .filter((item) => {
                    return (
                      item.id !== 0 &&
                      (item.order_items[0].id > 0 ||
                        item.order_items[0].id! > 0)
                    );
                  })
                  .map((item) => (
                    <Table.Tr key={`${item.id}`}>
                      <Table.Td>{item.id}</Table.Td>
                      <Table.Td>{item.employee.name}</Table.Td>
                      <Table.Td>
                        {item.order_items[0]?.services?.name
                          ? `${item.order_items[0].services.name} - Serviço`
                          : item.order_items[0]?.products?.name
                          ? `${item.order_items[0].products.name} - Produto`
                          : "N/A"}
                      </Table.Td>
                      <Table.Td>
                        {item.order_items[0].quantity ?? "N/A"}
                      </Table.Td>
                      <Table.Td>
                        R$
                        {(
                          (item.order_items[0].product_price ||
                            item.order_items[0].service_price ||
                            0) / 100
                        ).toFixed(2)}
                      </Table.Td>
                      {visibleColumns.data && (
                        <Table.Td>
                          {new Date(item.created_at).toLocaleString("pt-BR")}
                        </Table.Td>
                      )}
                      {visibleColumns.clientname && (
                        <Table.Td>{item.customers.name}</Table.Td>
                      )}
                      <Table.Td>
                        <FaRegTrashAlt
                          className="trashIcon"
                          onClick={() => deleteHandler(item.id)}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </div>
          <Pagination
            color="#0A265C"
            total={HistoryFetchData?.totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            mt="md"
          />
        </div>
      </div>
    </div>
  );
}
