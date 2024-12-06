import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import style from "./TransactionManipulationModal.module.scss";
import { Transaction } from "@/types/Transaction";
import { Category } from "@/types/Category";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTransactionManipulated: (newTransaction: Transaction) => void;
  categories?: Category[];
  transaction?: Transaction;
  walletId: number;
}

const TransactionManipulationModal = ({
  isOpen,
  onClose,
  title,
  onTransactionManipulated,
  categories,
  transaction,
  walletId,
}: ModalProps) => {
  if (transaction) {
    transaction.date = transaction.date.split("T")[0];
  }
  const [amount, setAmount] = useState<string>("");
  const [titleField, setTitleField] = useState("");
  const [description, setDescription] = useState(
    transaction?.description || ""
  );
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [type, setType] = useState(transaction?.type || "income");
  const [errors, setErrors] = useState<string[]>([]);

  const router = useRouter();

  const resetFields = () => {
    setTitleField(""); // Reseta o título
    setDescription(""); // Reseta a descrição
    setAmount(""); // Reseta o valor
    setDate(""); // Reseta a data
    setCategoryId(null); // Reseta a categoria
    setType("income"); // Reseta para o tipo padrão (income)
    setErrors([]);
  };

  const formatCurrency = (value: number | string): string => {
    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, ""))
        : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue || 0);
  };

  useEffect(() => {
    if (transaction) {
      setAmount(formatCurrency(transaction.amount));
      setTitleField(transaction.title);
      setDescription(transaction.description || "");
      setDate(transaction.date);
      setCategoryId(transaction.category_id ? transaction.category_id : null);
      setType(transaction.type);
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pega o valor bruto digitado
    const rawValue = e.target.value.replace(/[^\d]/g, ""); // Apenas números

    // Formata para exibição sem perder o controle do cursor
    const numericValue = parseInt(rawValue, 10) || 0; // Valor numérico

    // Divide por 100 para representar centavos
    const formattedValue = (numericValue / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2, // Sempre mostra 2 casas decimais
      maximumFractionDigits: 2,
    });

    setAmount(formattedValue); // Atualiza o estado com o valor formatado
  };

  const validateFields = () => {
    const validationErrors: string[] = [];

    if (titleField.trim() === "") {
      validationErrors.push("O título é obrigatório.");
    }

    // Extração correta do valor numérico de `amount`
    const numericAmount = parseFloat(
      amount.replace(/[^\d,-]/g, "").replace(",", ".")
    );

    if (!numericAmount || numericAmount <= 0) {
      validationErrors.push("O valor deve ser maior que zero.");
    }

    if (!date) {
      validationErrors.push("A data é obrigatória.");
    }

    if (description && description.length < 5) {
      validationErrors.push("A descrição deve ter pelo menos 5 caracteres.");
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleTransactionManipulation = async () => {
    if (!validateFields()) return;

    const numericAmount = parseFloat(
      amount.replace(/[^\d,-]/g, "").replace(",", ".")
    );

    const fields: Partial<Transaction> = {
      amount: numericAmount.toString(),
      title: titleField,
      description,
      date,
      category_id: categoryId,
      type,
    };

    try {
      const res = await fetch(
        transaction
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${walletId}?transactionId=${transaction.id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${walletId}`,
        {
          method: transaction ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            transaction ? { updatedFields: fields } : { newTransaction: fields }
          ),
        }
      );

      if (res.status === 403) {
        return router.push("/login?event=error");
      }

      if (!res.ok) {
        throw new Error("Erro ao salvar a transação");
      }

      const savedTransaction = await res.json();
      onTransactionManipulated(savedTransaction);
      if (!transaction) resetFields();
      onClose();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className={style.modalOverlay} onClick={handleOverlayClick}>
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} className={style.closeButton}>
            &times;
          </button>
        </div>
        <div className={style.modalBody}>
          {errors.length > 0 && (
            <ul className={style.errorList}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          <label htmlFor="title">Título:</label>
          <input
            id="title"
            type="text"
            value={titleField}
            onChange={(e) => setTitleField(e.target.value)}
          />
          <label htmlFor="amount">Valor:</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            inputMode="decimal"
          />
          <label htmlFor="type">Tipo:</label>
          <div>
            <label>
              <input
                type="radio"
                name="type"
                value="income"
                checked={type === "income"}
                onChange={(e) => setType(e.target.value)}
              />
              Entrada
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={type === "expense"}
                onChange={(e) => setType(e.target.value)}
              />
              Saída
            </label>
          </div>
          <label htmlFor="date">Data:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            value={categoryId ? categoryId : ""}
            onChange={(e) =>
              e.target.value
                ? setCategoryId(Number(e.target.value))
                : setCategoryId(null)
            }
          >
            <option value="">Selecione uma categoria</option>
            {categories
              ? categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              : ""}
          </select>
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={handleTransactionManipulation}
            className={style.saveButton}
          >
            {transaction ? "Atualizar" : "Criar"} Transação
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionManipulationModal;
