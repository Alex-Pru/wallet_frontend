import { useState } from "react";
import style from "./WalletUsersModal.module.scss";
import { User } from "@/types/User";
import { useRouter } from "next/navigation";

interface WalletUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: number;
  users: User[];
  onUserUpdated: (updatedUser: User) => void;
  onUserRemoved: (userId: number) => void;
  onUserAdded: (newUser: User) => void;
}

const WalletUsersModal = ({
  isOpen,
  onClose,
  walletId,
  users,
  onUserUpdated,
  onUserRemoved,
  onUserAdded,
}: WalletUsersModalProps) => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  if (!isOpen) return null;
  const handleRoleChange = async (userId: number, role: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/wallets/${walletId}/changeUser?id=${userId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      );

      if (res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao atualizar a role");

      const updatedUser: User = await res.json();
      onUserUpdated(updatedUser);
    } catch (err) {
      alert(err);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/wallets/${walletId}/removeUser?id=${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao remover o usuário");

      onUserRemoved(userId);
    } catch (err) {
      alert(err);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      setError("O e-mail é obrigatório.");
      return;
    }

    try {
      const newUserObject = {
        email: newUserEmail,
        role: "viewer",
      };
      const res = await fetch(`http://localhost:4000/api/wallets/${walletId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUser: newUserObject }),
      });

      if (res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao adicionar o usuário");

      const newUser: User = await res.json();

      onUserAdded(newUser);
      setNewUserEmail("");
      setError("");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div
      className={style.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <h2>Gerenciar Usuários</h2>
          <button onClick={onClose} className={style.closeButton}>
            &times;
          </button>
        </div>
        <div className={style.modalBody}>
          <h3>Usuários da Carteira</h3>
          <ul className={style.userList}>
            {users.map((user) => (
              <li key={user.id} className={style.userItem}>
                <span>
                  {user.name} ({user.email})
                </span>
                <select
                  value={user.role || "viewer"}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="participant">Participant</option>
                  <option value="owner">Owner</option>
                </select>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className={style.removeButton}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
          <div className={style.addUser}>
            <h3>Adicionar Usuário</h3>
            {error && <p className={style.error}>{error}</p>}
            <input
              type="email"
              placeholder="Digite o e-mail do usuário"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
            <button onClick={handleAddUser} className={style.addButton}>
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletUsersModal;
