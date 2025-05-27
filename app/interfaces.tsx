import { NapiMiddleware } from "next/dist/build/swc/generated-native";

export type dashboardItems =
  | "Produtos"
  | "Servicos"
  | "Clientes"
  | "Historico"
  | "Funcionarios"
  | "Configurações"
  | "Pedidos"
  | "";

export type loginInputs = {
  username: string;
  password: string;
};

export interface loginSucessData {
  token: string;
  name: string;
  role: string;
}

export interface IproductsData {
  id: number;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  price: number;
}

export interface Istock_movementsData {
  id: number;
  created_at: string;
  product_id: number;
  type: string;
  quantity: number;
  reason: string;
  products: Istock_movementsDataProduct;
}
export interface Istock_movementsDataProduct {
  name: string;
}

export interface IDisplayData {
  Employee: Employee;
  Customers: Customer[];
  Products: Product[];
  Services: Service[];
}

export interface Service {
  id: number;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  category: null | string;
  brand: null | string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  last_purchase: string;
  total_spend: number;
  total_orders: number;
}

export interface Employee {
  employee_data: Employeedatum[];
  fee_data: Feedatum[];
}

export interface Feedatum {
  id: number;
  name: string;
  value: number;
  is_used: boolean;
}

export interface Employeedatum {
  id: number;
  created_at: string;
  name: string;
  is_deleted: boolean;
}

export interface EmployeeSales_data {
  employee_id: number;
  employee_name: string;
  total_service_amount: number;
  total_product_amount: number;
  order_count: number;
  orders: Order[];
}

export interface Order {
  items: Item[];
  order_id: number;
  created_at: string;
  customer_id: number;
  customer_name: string;
}

export interface Item {
  id: number;
  quantity: null | number;
  product_id: null | number;
  service_id: null | number;
  product_price: null | number;
  service_price: null | number;
  product_name: null | string;
  service_name: null | string;
}

export type PedidoFormValues = {
  customer_name: string;
  customer_id: string;
  employee_id: string;
  employee_name: string;
  service_name: string;
  isClientEmpty: boolean;
  service_id: string[];
  products: {
    product_id: number;
    quantity: number;
  }[];
  isProductEmpty: boolean;
};

export type ProductFormItem = {
  product_id: number;
  selected_quantity: number;
};

export type ProdutosFormValues = {
  products: ProductFormItem[];
};

export type CustomerFormValues = {
  name: string;
  email: string | null;
  phone: string | null;
};

export interface SalesData {
  data: SalesDatuum[];
  count: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalPrice: number;
}

export interface SalesDatuum {
  id: number;
  created_at: string;
  total_service_price: number;
  total_product_price: number;
  employee: IdNameSaleData;
  customers: IdNameSaleData;
  order_items: Orderitem[];
}

export interface Orderitem {
  id: number;
  products: IdNameSaleData | null;
  quantity: null | number;
  services: IdNameSaleData | null;
  product_price: null | number;
  service_price: null | number;
}

export interface IdNameSaleData {
  id: number;
  name: string;
}

export interface productOrdemItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  select_quantity?: number;
}
