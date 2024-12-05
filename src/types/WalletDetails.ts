import { Category } from "./Category";
import { User } from "./User";
export type WalletDetails = {
  id: number;
  name: string;
  users: User[];
  categories: Category[];
};
