import { Transaction } from "@/types/Transaction";
import style from "./TransactionExclusionModal.module.scss";
import { useRouter } from "next/navigation";

interface ModalProps {
  isOpen: boolean;
  walletId: number;
  transaction: Transaction | null; // Torne `wallet` opcional, mas exija que seja verificado
  onTransactionErased: (transactionId: number) => void;
  onClose: () => void;
  title: string;
}

const TransactionExclusionModal = ({
  title,
  isOpen,
  walletId,
  transaction,
  onTransactionErased,
  onClose,
}: ModalProps) => {
  const router = useRouter();

  // Garantir que só renderize se estiver aberto e houver uma carteira
  if (!isOpen || !transaction) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTransactionExclusion = async () => {
    if (transaction) {
      const req = {
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${walletId}?transactionId=${transaction.id}`,
        method: "DELETE",
      };

      try {
        const res = await fetch(req.url, {
          method: req.method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 403) {
          router.push("/login?event=error");
          return;
        }

        if (!res.ok) {
          throw new Error("Erro ao excluir carteira");
        }

        onTransactionErased(transaction.id);
        onClose();
      } catch (err) {
        alert("Erro ao excluir a transação");
      }
    }
  };

  return (
    <div className={style.modalOverlay} onClick={handleOverlayClick}>
      <div className={style.modal}>
        <header className={style.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} className={style.closeButton}>
            &times;
          </button>
        </header>
        <div className={style.modalBody}>
          <p>Deseja excluir a transação {transaction.title}?</p>
          <button
            title="Cancel"
            className={style.cancelButton}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            title="Confirm"
            className={style.confirmButton}
            onClick={handleTransactionExclusion}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionExclusionModal;
