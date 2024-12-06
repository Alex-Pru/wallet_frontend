import { Wallet } from "@/types/Wallet";
import style from "./WalletEraseModal.module.scss";
import { useRouter } from "next/navigation";

interface ModalProps {
  isOpen: boolean;
  wallet: Wallet | null; // Torne `wallet` opcional, mas exija que seja verificado
  onWalletErased: (walletId: number) => void;
  onClose: () => void;
  title: string;
}

const WalletEraseModal = ({
  title,
  isOpen,
  wallet,
  onWalletErased,
  onClose,
}: ModalProps) => {
  const router = useRouter();

  // Garantir que só renderize se estiver aberto e houver uma carteira
  if (!isOpen || !wallet) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleWalletExclusion = async () => {
    if (wallet) {
      const req = {
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/wallets/${wallet.id}`,
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

        onWalletErased(wallet.id);
        onClose();
      } catch (err) {
        console.error("Erro ao excluir carteira", err);
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
          <p>Deseja excluir a carteira {wallet?.name}?</p>
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
            onClick={handleWalletExclusion}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletEraseModal;
