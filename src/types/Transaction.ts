export type Transaction = {
  id: number;
  wallet_id: number;
  credit_card_id?: number;
  user_id?: number;
  category_id?: number | null;
  type: string;
  amount: string;
  title: string;
  description?: string;
  date: string;
  installments?: number;
  current_installment?: number;
  created_at: string;
  updated_at: string;
};
