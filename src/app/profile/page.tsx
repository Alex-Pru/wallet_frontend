"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import RemoveUserModal from "@/components/RemoveUserModal/RemoveUserModal";
import styles from "./UserProfile.module.scss";
import { User } from "@/types/User";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading/Loading";
import ErrorPage from "@/components/error/ErrorPage";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);

  const router = useRouter();

  const toggleExclusionModal = () => {
    setIsExclusionModalOpen(!isExclusionModalOpen);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
        {
          credentials: "include",
          method: "GET",
        }
      );

      if (response.status === 403) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.message);
      }

      const userData = await response.json();
      setUser(userData);
      setFormData({ name: userData.name, email: userData.email });
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
      {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateFields: formData }),
      }
    );

    if (response.ok) {
      alert("Informações atualizadas com sucesso!");
      const updatedUser = await response.json();
      setUser(updatedUser);
    } else {
      alert("Erro ao atualizar informações.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (errorMessage) return <ErrorPage message={errorMessage}></ErrorPage>;

  if (!user) return <Loading></Loading>;

  return (
    <main className={styles.mainContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <button onClick={toggleSidebar} className={styles.sidebarToggle}>
        ☰
      </button>
      <div className={styles.container}>
        <h1>Perfil do Usuário</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nome:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label>
            E-mail:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Criado em:
            <input
              type="text"
              value={user.created_at ? user.created_at.split("T")[0] : ""}
              disabled
            />
          </label>

          <label>
            Atualizado em:
            <input
              type="text"
              value={user.updated_at ? user.updated_at.split("T")[0] : ""}
              disabled
            ></input>
          </label>

          <button type="submit">Salvar</button>
          <button
            className={styles.exclusionButton}
            onClick={toggleExclusionModal}
            type="button"
          >
            Excluir Conta
          </button>
        </form>
      </div>
      <RemoveUserModal
        title="Exclusão de Conta"
        isOpen={isExclusionModalOpen}
        onClose={toggleExclusionModal}
      ></RemoveUserModal>
    </main>
  );
}
