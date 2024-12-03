import { Wallet } from "@/types/Wallet";
import style from "./WalletManipulationModal.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onWalletCreated: (newWallet: Wallet) => void;
  currentName?: string;
  currentDescription?: string;
  walletId?: number;
}

const WalletManipulationModal = ({
  isOpen,
  onClose,
  title,
  currentName,
  onWalletCreated,
  currentDescription,
  walletId,
}: ModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (currentName) setName(currentName);
    if (currentDescription) setDescription(currentDescription);
  }, [currentName, currentDescription]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetFields = () => {
    setDescription("");
    setName("");
  };

  const handleWalletManipulation = async () => {
    let req = {
      url: "http://localhost:4000/api/wallets",
      method: "POST",
      body: { name, description },
    };

    if (walletId) {
      req = {
        url: `http://localhost:4000/api/wallets/${walletId}`,
        method: "PUT",
        body: { name, description },
      };
    }

    try {
      const res = await fetch(req.url, {
        method: req.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          walletId ? { updatedFields: req.body } : { newWallet: req.body }
        ),
      });

      if (res.status === 403) {
        return router.push("/login?event=error");
      }

      if (!res.ok) {
        throw new Error(
          "Um erro inesperado ocorreu ao criar ou atualizar carteira"
        );
      }

      if (res.ok) {
        const wallet = await res.json();
        onWalletCreated(wallet); // Passa a nova carteira para o componente pai
        resetFields();
        onClose(); // Fecha o modal
      } else {
        console.log("Erro ao criar ou atualizar a carteira");
      }
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
            value={name}
          />
          <label htmlFor="wallet_description">Descrição:</label>
          <textarea
            name="wallet_description"
            id="description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          ></textarea>
          <button
            type="button"
            className={style.saveButton}
            onClick={handleWalletManipulation}
          >
            {walletId ? "Atualizar" : "Criar"} carteira
          </button>
        </div>
        <div className={style.modalFooter}></div>
      </div>
    </div>
  );
};

export default WalletManipulationModal;
