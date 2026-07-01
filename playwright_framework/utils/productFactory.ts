// utils/productFactory.ts
import { faker } from '@faker-js/faker';

export type ProductDataAPI = {
  product_title: string;
  description: string;
  unit_price: string;
  photo: string;
  stock_qty: string;
  supplier_id: string;
  product_status: string;
};

export function generateFakeProduct(): ProductDataAPI {
  return {
    product_title: faker.commerce.productName()+ Date.now(),
    description: faker.commerce.productDescription(),
    unit_price: faker.commerce.price({ min: 100, max: 1000 }),
    photo: "jacket.jpg",
    product_status: "APPROVED",
    stock_qty: "10",
    supplier_id: "2"
  };
}