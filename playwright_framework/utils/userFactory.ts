// utils/userFactory.ts
import { faker } from '@faker-js/faker';

export type UserDataAPI = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export function generateFakeUser(): UserDataAPI {
  return {
    name: faker.person.firstName(),
    email: faker.internet.email(),
    password: "TestPassword123!" ,
    role: "CUSTOMER"
};
}