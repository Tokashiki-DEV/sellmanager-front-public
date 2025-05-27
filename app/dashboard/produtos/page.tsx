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
import { FaCheck, FaEdit, FaRegTrashAlt, FaTimes } from "react-icons/fa";
import "./produtos.css";

import "dayjs/locale/pt";
import fetcher from "@/app/fetcher";
import useSWR from "swr";
import { IproductsData, Istock_movementsData } from "../../interfaces";
import API from "@/app/api";
import { useDisclosure } from "@mantine/hooks";
import "../../dashboard/pedidos/pedidos.css";
import { toast } from "react-toastify";

const mockdata = [
  {
    id: 0,
    created_at: "Carregando...",
    type: "Carregando...",
    product_id: 0,
    reason: "Carregando...",
    quantity: 0,
    products: { name: "Carregando.." },
  },
];

const produtosMock = [
  {
    id: 1,
    name: "Carregando...",
    brand: "Carregando...",
    quantity: 0,
    price: 0,
  },
];

export default function Produtos() {
  const { data: products }: { data: IproductsData[] } = useSWR(
    "/products",
    fetcher
  );
  const { data: stock_movements }: { data: Istock_movementsData[] } = useSWR(
    "/stock",
    fetcher
  );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState(produtosMock);
  const [stockData, setStockData] = useState(mockdata);
  const [filteredStockData, setFilteredStockData] = useState(stockData);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    brand: "",
    quantity: 0,
    price: 0,
  });

  const itemsPerPage = 10;

  const filteredData = tableData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase())
  );
  const dataToShow = search === "" ? tableData : filteredData;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataToShow.slice(startIndex, endIndex);
  const totalPages = Math.ceil(dataToShow.length / itemsPerPage);
  const handlersRef = useRef<NumberInputHandlers>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    if (products) {
      setTableData(products);
    }
    if (stock_movements) {
      setStockData(stock_movements);
      setFilteredStockData(stock_movements);
    }

    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, products, stock_movements]);

  function dateRangeHandler(e: any) {
    const startDate = new Date(e[0]);
    const endDate = new Date(e[1]);
    if (!e[0] && !e[1]) {
      setFilteredStockData(stockData);
    }

    if (e[0] && e[1]) {
      setFilteredStockData((prev) =>
        prev.filter(
          (item) =>
            item.created_at.slice(0, 10) >=
              startDate.toISOString().slice(0, 10) &&
            item.created_at.slice(0, 10) <= endDate.toISOString().slice(0, 10)
        )
      );
    }
  }

  async function handleSubmit() {
    const payload = {
      name: name,
      price: cost,
      category: category,
      brand: brand,
      quantity: quantity,
    };

    const response = await toast.promise(API.post("/products", payload), {
      pending: "Cadastrando produto...",
      success: "Produto cadastrado com sucesso!",
      error: "Erro ao cadastrar o produto, tente novamente!",
    });
    close();
  }

  async function deleteHandler(id: any) {
    const productsDelete = await API.patch(`/products/${id}`);
    setTableData((prev) => prev.filter((item) => item.id !== id));
  }
  async function handleEdit(id: number) {
    try {
      const payload = {
        id: id,
        name: editData.name,
        brand: editData.brand,
        quantity: editData.quantity,
        price: editData.price,
      };

      setTableData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );

      await toast.promise(API.patch("/products", payload), {
        pending: "Atualizando produto...",
        success: "Produto atualizado com sucesso!",
        error: "Erro ao atualizar o produto, tente novamente!",
      });
    } catch (error) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                name: item.name,
                quantity: item.quantity,
                brand: item.brand,
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
    <div className="flex flex-col w-full h-full">
      <p className="flex items-center p-[16] w-full h-[56] font-bold text-2xl text-[var(--primary-color)] border-b border-[var(--separator-color)]">
        Produtos
      </p>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col overflow-y-auto w-[350] max-h-svh border border-[var(--separator-color)] p-[16] mb-12 h-full">
          <div className=" border-b pb-[16] border-[var(--separator-color)]">
            <DatePickerInput
              locale="pt"
              label="Filtrar por data"
              placeholder="Hoje"
              className="produtosDatepicker"
              type="range"
              allowSingleDateInRange
              clearable
              onChange={(daterange) => {
                dateRangeHandler(daterange);
              }}
            />
          </div>
          <p className="font-bold text-lg text-[var(--color-text1)] mb-4 mt-4">
            Movimentação de estoque
          </p>
          <div className="flex flex-col overflow-y-auto max-h-svh gap-2 ">
            {filteredStockData
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .map((item) => {
                return (
                  <div
                    className="flex flex-col py-[8] border-b border-[var(--separator-color)] gap-0.5"
                    key={item.id}
                  >
                    <p className="font-bold text-sm text-[var(--color-text1)]">
                      {item.products?.name || "N/A"}
                    </p>
                    <p className="font-medium text-sm text-[var(--color-text1)]">
                      {item.type == "Saida" ? "(-)" : "(+)"}{" "}
                      {Math.abs(item.quantity)} - {item.reason}
                    </p>
                    <p className="font-regular text-sm text-[var(--color-text1)]">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex flex-col w-full h-full p-[16] gap-4">
          <p className="font-bold text-2xl text-[var(--color-text1)]">
            Lista de produtos
          </p>
          <div className="flex flex-row items-end justify-between">
            <TextInput
              label="Pesquisar"
              description="Digite o nome do produto"
              placeholder="Nome do produto"
              className="produtoTextInput w-2/3"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Modal
              opened={opened}
              onClose={close}
              title="Cadastrar um produto"
              centered
              size="auto"
              className="modalProduto"
            >
              <div className="flex flex-col border-[var(--separator-color)] pb-[32] w-full gap-y-[18]">
                <p className="font-medium text-sm text-[var(--small-text)]">
                  Preencha os dados para cadastrar um produto.
                </p>
                <div className="flex flex-col gap-4">
                  <TextInput
                    label="Nome"
                    description="Digite o nome do produto"
                    placeholder="Nome do produto"
                    className="produtoTextInput"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Marca"
                    description="Digite a marca do produto"
                    placeholder="Marca do produto"
                    className="produtoTextInput "
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-row w-full gap-x-[32] ">
                  <TextInput
                    label="Valor"
                    description="Digite o valor do produto"
                    placeholder="R$"
                    className="valorTextInput"
                    onChange={(e) => setCost(Number(e.target.value) * 100)}
                  />
                  <NumberInput
                    label="Quantidade"
                    description="Selecione a quantidade inicial de estoque"
                    handlersRef={handlersRef}
                    min={0}
                    defaultValue={1}
                    className="numberInput"
                    onChange={(e) => setQuantity(Number(e))}
                    rightSection={
                      <div className="flex flex-row gap-x-[2]">
                        <Button
                          onClick={() => handlersRef.current?.increment()}
                          variant="filled"
                          className="numberButtons"
                          style={{ backgroundColor: "#33CC5A" }}
                        >
                          +
                        </Button>
                        <Button
                          onClick={() => handlersRef.current?.decrement()}
                          variant="filled"
                          className="numberButtons"
                          style={{ backgroundColor: "#EB4766" }}
                        >
                          -
                        </Button>
                      </div>
                    }
                    required
                  />
                </div>
              </div>
              <Button
                className="confirmButton"
                id="confirmProduto"
                onClick={handleSubmit}
              >
                Cadastrar Produto
              </Button>
            </Modal>
            <Button className="addButton" onClick={open}>
              Cadastrar produto
            </Button>
          </div>
          <div className="produtosTableWrapper">
            <Table
              striped
              highlightOnHover
              withTableBorder
              style={{
                borderCollapse: "collapse",
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
                  <Table.Th className="thead">Marca</Table.Th>
                  <Table.Th className="thead">Qtd. Estoque</Table.Th>
                  <Table.Th className="thead">Valor (R$)</Table.Th>
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
                            value={editData.brand}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                brand: e.target.value,
                              })
                            }
                            className="edit-input"
                          />
                        ) : (
                          item.brand
                        )}
                      </Table.Td>
                      <Table.Td>
                        {editingId === item.id ? (
                          <NumberInput
                            handlersRef={handlersRef}
                            min={0}
                            defaultValue={item.quantity}
                            className="numberInput"
                            value={editData.quantity}
                            rightSection={
                              <div className="flex flex-row gap-x-[2]">
                                <Button
                                  onClick={() =>
                                    handlersRef.current?.increment()
                                  }
                                  variant="filled"
                                  className="numberButtons"
                                  style={{ backgroundColor: "#33CC5A" }}
                                >
                                  +
                                </Button>
                                <Button
                                  onClick={() =>
                                    handlersRef.current?.decrement()
                                  }
                                  variant="filled"
                                  className="numberButtons"
                                  style={{ backgroundColor: "#EB4766" }}
                                >
                                  -
                                </Button>
                              </div>
                            }
                            required
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                quantity: Number(e),
                              })
                            }
                          />
                        ) : (
                          item.quantity
                        )}
                      </Table.Td>
                      <Table.Td className="flex flex-row items-center gap-x-[5]">
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
                                    name: item.name,
                                    brand: item.brand,
                                    quantity: item.quantity,
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
