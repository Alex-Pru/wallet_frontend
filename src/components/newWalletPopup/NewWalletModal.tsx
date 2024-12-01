import { Wallet } from "@/types/Wallet";
import style from "./NewWallet.module.scss";
import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onWalletCreated: (newWallet: Wallet) => void;
}

const NewWalletModal = ({ isOpen, onClose, title }: ModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleWalletCreation = async () => {
    try {
      // Lógica pra mandar a nova carteira
    } catch (err) {
      console.log(err);
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
          <label htmlFor="wallet_name">Nome:</label>
          <input
            name="wallet_name"
            type="text"
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="wallet_description">Descrição:</label>
          <textarea
            name="wallet_description"
            id="description"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button
            type="button"
            className={style.saveButton}
            onClick={() => console.log("funcionando")}
          >
            Criar carteira
          </button>
        </div>
        <div className={style.modalFooter}></div>
      </div>
    </div>
  );
};

export default NewWalletModal;
