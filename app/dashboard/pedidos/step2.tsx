import {
  Button,
  Checkbox,
  Modal,
  MultiSelect,
  NumberInput,
  NumberInputHandlers,
  Select,
  Table,
} from "@mantine/core";
import {
  PedidoFormValues,
  Product,
  productOrdemItem,
  Service,
} from "@/app/interfaces";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useRef, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import "./pedidos.css";

type Props = {
  prevStep: () => void;
  services_data: Service[];
  product_data: Product[];
  pedidoForm: ReturnType<typeof useForm<PedidoFormValues>>;
  handleSubmitPedidoForm: () => void;
  isSubmitting: boolean;
};

export default function PedidosStep2({
  prevStep,
  services_data,
  product_data,
  pedidoForm,
  handleSubmitPedidoForm,
  isSubmitting,
}: Props) {
  const produtosMock = {
    id: 0,
    name: "Nenhum produto selecionado",
    quantity: 0,
    price: 0,
    select_quantity: 0,
  };
  const [opened, { open, close }] = useDisclosure(false);
  const handlersRef = useRef<NumberInputHandlers>(null);
  const produtosForm = useForm({
    initialValues: {
      product_id: "",
      product_name: "",
      select_quantity: 1,
    },
  });

  const [productItems, setProductItems] = useState<productOrdemItem[]>([
    produtosMock,
  ]);

  function addProductItem(id: number) {
    if (productItems.length !== 0 && productItems[0].id === produtosMock.id) {
      setProductItems([]);
    }

    const productExists = productItems.some((item) => item.id === id);

    if (productExists) {
      alert("Este produto já foi adicionado à lista!");
      return;
    }

    const selectedProduct = product_data.find((product) => product.id === id);

    if (selectedProduct) {
      const productWithQuantity = {
        ...selectedProduct,
        select_quantity: produtosForm.values.select_quantity,
      };
      setProductItems((prev) => [...prev, productWithQuantity]);

      pedidoForm.setFieldValue("products", [
        ...pedidoForm.values.products,
        {
          product_id: id,
          quantity: produtosForm.values.select_quantity,
        },
      ]);
    }
  }

  function removeProductItem(product_id: number) {
    setProductItems((prev) => prev.filter((item) => item.id !== product_id));
    pedidoForm.setFieldValue(
      "products",
      pedidoForm.values.products.filter(
        (item) => item.product_id !== product_id
      )
    );
  }

  function productsCancelButton() {
    close();
    setProductItems([produtosMock]);
    pedidoForm.setFieldValue("products", []);
  }

  function productsSaveButton() {
    close();
  }

  return (
    <div className="flex flex-col justify-center items-start w-[600] bg-[var(--sidebar-bg-color)] border border-solid border-[#0a265c25] rounded-lg ">
      <div className="flex flex-col p-[32] w-full h-full gap-y-[32]">
        <div>
          <p className="font-bold text-2xl text-[var(--primary-color)]">
            Adicionar pedido
          </p>
          <p className="font-medium text-sm text-[var(--small-text)]">
            Selecione o(s) pedido(s) e ou produto(s)
          </p>
        </div>
        <div className="flex flex-row gap-x-[16] font-medium text-sm text-[var(--small-text)]">
          <div className="flex flex-row gap-x-[4]">
            Cliente:{" "}
            <p className="font-bold">
              {pedidoForm.getValues().isClientEmpty
                ? "Sem cadastro"
                : pedidoForm.getValues().customer_name}
            </p>
          </div>
          <div className="flex flex-row gap-x-[4]">
            Funcionario:{" "}
            <p className="font-bold">{pedidoForm.getValues().employee_name}</p>
          </div>
        </div>
        <div className="gap-4 flex flex-col">
          <MultiSelect
            label="Serviço"
            description="Selecione o serviço que será prestado nesse pedido"
            placeholder="Nome do serviço"
            className="ordersSelect"
            onChange={(selectedServiceIds) => {
              pedidoForm.setFieldValue("service_id", selectedServiceIds);
            }}
            value={pedidoForm.values.service_id}
            data={services_data.map((item) => ({
              value: String(item.id),
              label: `${item.name} - R$ ${(item.price / 100).toFixed(2)}`,
            }))}
            searchable
            clearable
          />
          <div className="flex flex-row gap-x-[4]">
            <p className="text-sm text-[var(--small-text)]">
              Valor total dos serviços:
            </p>
            <p className="font-bold text-sm text-[var(--small-text)]">
              {(
                services_data.reduce((sum, service) => {
                  return pedidoForm
                    .getValues()
                    .service_id.includes(String(service.id))
                    ? sum + service.price
                    : sum;
                }, 0) / 100
              ).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-y-[16]">
          <div className="flex flex-col ">
            <p className="font-bold text-lg text-[var(--color-text1)]">
              Produto
            </p>
            <p className="text-sm text-[var(--small-text)]">
              Selecione o produto que será vendido nesse pedido
            </p>
          </div>
          <div className="flex flex-row justify-between">
            <Button variant="default" className="confirmButton" onClick={open}>
              Adicionar produto
            </Button>
            <Modal
              opened={opened}
              onClose={close}
              centered
              className="modal"
              size="auto"
              title="Selecionar produtos"
            >
              <div className="flex gap-4 flex-col">
                <div className="w-full">
                  <p className="font-medium text-sm text-[var(--small-text)]">
                    Selecione o(s) produto(s).
                  </p>
                </div>
                <div className="w-full flex flex-row gap-4 items-end justify-between overflow-visible">
                  <Select
                    label="Produto"
                    required
                    description="Selecione o produto que será vendido nesse pedido"
                    placeholder="Nome do produto"
                    className="addClientInput"
                    onChange={(e) => produtosForm.setValues({ product_id: e! })}
                    data={product_data
                      .filter((a) => a.id != 0)
                      .map((item) => ({
                        value: String(item.id),
                        label: `${item.name} - R$ ${(item.price / 100).toFixed(
                          2
                        )} - ${item.quantity}`,
                      }))}
                  />

                  <NumberInput
                    label="Quantidade"
                    description="Selecione a quantidade de estoque"
                    handlersRef={handlersRef}
                    min={1}
                    defaultValue={1}
                    className="numberInput overflow-hidden"
                    onChange={(val) =>
                      produtosForm.setValues({ select_quantity: Number(val) })
                    }
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
                  <Button
                    className="addButton"
                    onClick={() =>
                      addProductItem(Number(produtosForm.values.product_id))
                    }
                  >
                    Adicionar produto
                  </Button>
                </div>

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
                      <Table.Th className="thead">Quantidade</Table.Th>
                      <Table.Th className="thead">Qtd. Estoque</Table.Th>
                      <Table.Th className="thead">Valor</Table.Th>
                      <Table.Th className="theadEnd">Ações</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {productItems.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.name}</Table.Td>
                        <Table.Td>{item.select_quantity}</Table.Td>
                        <Table.Td>{item.quantity}</Table.Td>
                        <Table.Td>
                          {((item.price * item.select_quantity!) / 100).toFixed(
                            2
                          )}
                        </Table.Td>
                        <Table.Td>
                          <FaRegTrashAlt
                            className="trashIcon"
                            onClick={() => removeProductItem(item.id)}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                <div className="flex flex-row gap-x-[4]">
                  <p className="text-lg font-bold text-[var(--color-text1)]">
                    Valor total dos produtos:
                  </p>
                  <p className="text-lg font-bold text-[var(--primary-color)]">
                    R${" "}
                    {(
                      productItems.reduce(
                        (acc, item) => acc + item.price * item.select_quantity!,
                        0
                      ) / 100
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-row gap-4">
                  <Button
                    className="confirmButton"
                    onClick={productsSaveButton}
                  >
                    Confirmar produtos
                  </Button>
                  <Button
                    className="cancelButton"
                    onClick={productsCancelButton}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Modal>
            <Checkbox
              label="Continuar sem produtos"
              checked={pedidoForm.getValues().isProductEmpty}
              onChange={(e) =>
                pedidoForm.setFieldValue("isProductEmpty", e.target.checked)
              }
              color="#0A265C"
            />
          </div>
          {!pedidoForm.getValues().isProductEmpty ? (
            <div className="flex flex-row gap-x-[4]">
              <p className="text-sm text-[var(--small-text)]">
                Produtos selecionados:
              </p>
              <p className="font-bold text-sm text-[var(--small-text)]">
                {productItems.map((item) => {
                  return <span key={item.id}> {item.name};</span>;
                })}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-[16]">
          <div className="flex flex-row gap-x-[4]">
            <p className="text-lg font-bold text-[var(--color-text1)]">
              Valor total do pedido:
            </p>
            <p className="text-lg font-bold text-[var(--primary-color)]">
              R${" "}
              {(
                productItems.reduce(
                  (acc, item) => acc + item.price * item.select_quantity!,
                  0
                ) /
                  100 +
                services_data.reduce((sum, service) => {
                  return pedidoForm
                    .getValues()
                    .service_id.includes(String(service.id))
                    ? sum + service.price
                    : sum;
                }, 0) /
                  100
              ).toFixed(2)}
            </p>
          </div>
          <div className="flex flex-row gap-x-[10] w-full">
            <Button
              className="backButton"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button
              className="finishButton"
              onClick={handleSubmitPedidoForm}
              disabled={
                isSubmitting ||
                (pedidoForm.values.service_id.length === 0 &&
                  pedidoForm.values.products.length === 0 &&
                  !pedidoForm.values.isProductEmpty)
              }
              loading={isSubmitting}
            >
              Finalizar pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
