import { Wallet } from "@/types/Wallet";
import style from "./RemoveUserFromWalletModal.module.scss";
import { useRouter } from "next/navigation";
import { User } from "@/types/User";

interface ModalProps {
  isOpen: boolean;
  title: string;
  wallet: Wallet | null;
  userToRemove?: User;
  onClose: () => void;
  onUserRemoved: (walletId: number) => void;
}

const RemoveUserFromWalletModal = ({
  isOpen,
  wallet,
  title,
  userToRemove,
  onClose,
  onUserRemoved,
}: ModalProps) => {
  const router = useRouter();

  // Garantir que só renderize se estiver aberto e houver uma carteira
  if (!isOpen || !wallet) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUserRemovedFromWallet = async () => {
    let req = {
      url: `http://localhost:4000/api/wallets/${wallet.id}/leaveWallet`,
      method: "DELETE",
    };

    if (userToRemove) {
      req.url += `http://localhost:4000/api/wallets/${wallet.id}/removeUser?id=${userToRemove.id}`;
    }

    try {
      const res = await fetch(req.url, {
        credentials: "include",
        method: req.method,
      });

      if (res.status === 403) {
        router.push("/login?event=error");
        return;
      }

      if (!res.ok) {
        throw new Error("Erro ao remover usuário da carteira");
      }

      onUserRemoved(wallet.id);
      onClose();
    } catch (err) {
      console.log(err);
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
          <p>
            {userToRemove
              ? `Deseja remover o usuário ${userToRemove.name} da carteira ${wallet.name}?`
              : `Deseja sair da carteira ${wallet.name}?`}
          </p>
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
            onClick={handleUserRemovedFromWallet}
          >
            {userToRemove ? `Remover Usuário` : `Sair`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveUserFromWalletModal;
