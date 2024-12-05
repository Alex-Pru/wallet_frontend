import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import style from "./TransactionManipulationModal.module.scss";
import { Transaction } from "@/types/Transaction";
import { Category } from "@/types/Category";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTransactionCreated: (newTransaction: Transaction) => void;
  categories?: Category[];
  transaction?: Transaction;
  walletId: number;
}

const TransactionManipulationModal = ({
  isOpen,
  onClose,
  title,
  onTransactionCreated,
  categories,
  transaction,
  walletId,
}: ModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [titleField, setTitleField] = useState(transaction?.title || "");
  const [description, setDescription] = useState(
    transaction?.description || ""
  );
  const [date, setDate] = useState(transaction?.date || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    transaction?.category_id
  );
  const [type, setType] = useState(transaction?.type || "income");
  const [errors, setErrors] = useState<string[]>([]);

  const router = useRouter();

  const resetFields = () => {
    setTitleField(""); // Reseta o título
    setDescription(""); // Reseta a descrição
    setAmount(""); // Reseta o valor
    setDate(""); // Reseta a data
    setCategoryId(undefined); // Reseta a categoria
    setType("income"); // Reseta para o tipo padrão (income)
    setErrors([]);
  };

  useEffect(() => {
    if (transaction) {
      setAmount(formatCurrency(transaction.amount));
      setTitleField(transaction.title);
      setDescription(transaction.description || "");
      setDate(transaction.date);
      setCategoryId(transaction.category_id);
      setType(transaction.type);
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, ""); // Remove tudo que não for número
    const numericValue = parseInt(rawValue, 10) || 0; // Converte para número ou 0 se vazio

    // Formata o valor como dinheiro em BRL
    const formattedValue = (numericValue / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setAmount(formattedValue); // Atualiza o estado com o valor formatado
  };

  const validateFields = () => {
    const validationErrors: string[] = [];

    if (titleField.trim() === "") {
      validationErrors.push("O título é obrigatório.");
    }

    if (!amount || parseFloat(amount.replace(/[^\d.-]/g, "")) <= 0) {
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

    const newTransaction: Partial<Transaction> = {
      amount: parseFloat(amount.replace(/[^\d.-]/g, "")),
      title: titleField,
      description,
      date,
      category_id: categoryId,
      type,
    };

    try {
      const res = await fetch(
        transaction
          ? `http://localhost:4000/api/transactions/${transaction.id}`
          : `http://localhost:4000/api/transactions/${walletId}`,
        {
          method: transaction ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newTransaction }),
        }
      );

      if (res.status === 403) {
        return router.push("/login?event=error");
      }

      if (!res.ok) {
        throw new Error("Erro ao salvar a transação");
      }

      const savedTransaction = await res.json();
      onTransactionCreated(savedTransaction);
      handleModalClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalClose = () => {
    resetFields();
    onClose();
  };

  return (
    <div className={style.modalOverlay} onClick={handleOverlayClick}>
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <h2>{title}</h2>
          <button onClick={handleModalClose} className={style.closeButton}>
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
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value) || undefined)}
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
