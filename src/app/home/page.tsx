"use client";
import { Wallet } from "@/types/Wallet";
import style from "./home.module.scss";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorPage from "@/components/error/ErrorPage";
import Loading from "@/components/loading/Loading";

import Sidebar from "@/components/sidebar/Sidebar"; // Componente do menu lateral
import WalletManipulationModal from "@/components/walletManipulationModal/WalletManipulationModal";
import WalletEraseModal from "@/components/WalletEraseModal/WalletEraseModal";
import RemoveUserFromWalletModal from "@/components/RemoveUserFromWalletModal/RemoveUserFromWalletModal";
import Link from "next/link";

export default function Home() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoveUserModalOpen, setIsRemoveUserModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para controlar o menu lateral
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExclusionModalOpen, setIsOpenExclusionModal] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleExclusionModal = () => {
    setIsOpenExclusionModal(!isExclusionModalOpen);
  };

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const toggleUserRemoveModal = () => {
    setIsRemoveUserModalOpen(!isRemoveUserModalOpen);
  };

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/wallets/", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 403) {
          return router.push("/login?event=error");
        }

        if (!res.ok) {
          const errorResponse = await res.json();
          setError(errorResponse.message);
        }

        const data = await res.json();
        setWallets(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error(err);
        } else {
          setError("Erro desconhecido");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTransaction = (walletId: number) => {
    console.log(`Adicionando transação na carteira com ID: ${walletId}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Alterna o estado de visibilidade do Sidebar
  };

  const modifyWallet = (changedWallet: Wallet) => {
    setWallets((prevWallets) =>
      prevWallets.map((wallet) =>
        wallet.id === changedWallet.id
          ? { ...wallet, ...changedWallet }
          : wallet
      )
    );
  };

  const removeWallet = (walletId: number) => {
    setWallets((prevWallets) =>
      prevWallets.filter((wallet) => wallet.id !== walletId)
    );
  };

  const handleSubmenuClick = (wallet: Wallet) => {
    setSelectedWallet(selectedWallet?.id === wallet.id ? null : wallet);
  };

  const addWallet = (newWallet: Wallet) => {
    setWallets((prevWallets) => [...prevWallets, newWallet]);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  return (
    <main className={style.mainContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => toggleSidebar()} />
      <header className={style.header}>
        <button
          type="button"
          onClick={() => toggleSidebar()}
          className={style.menuButton}
        >
          ☰
        </button>
        <h1 className={style.title}>Carteiras</h1>
      </header>
      <section className={style.walletsContainer}>
        {wallets.length === 0 ? (
          <div>Não há carteiras cadastradas.</div>
        ) : (
          <ul>
            {wallets.map((wallet) => (
              <li key={wallet.id} className={style.walletItem}>
                <Link
                  href={`/details/${wallet.id}`}
                  className={style.walletTitle}
                >
                  {wallet.name}
                </Link>
                <p className={style.walletDescription}>{wallet.description}</p>
                <p>{wallet.created_at.split("T")[0]}</p>
                {wallet.updated_at && <p>{wallet.updated_at.split("T")[0]}</p>}
                <div className={style.transactionButtons}>
                  <button
                    onClick={() =>
                      console.log(`Adicionar gasto na carteira ${wallet.id}`)
                    }
                  >
                    Adicionar Gasto
                  </button>
                  <button
                    onClick={() =>
                      console.log(
                        `Adicionar recebimento na carteira ${wallet.id}`
                      )
                    }
                  >
                    Adicionar Recebimento
                  </button>
                </div>
                {/* Botão de 3 pontos */}
                <div className={style.threeDotsMenu}>
                  <button
                    className={style.toggleSubmenu}
                    onClick={() => handleSubmenuClick(wallet)}
                  >
                    &#x2022;&#x2022;&#x2022; {/* Representa os três pontos */}
                  </button>
                  {/* Menu de opções */}
                  {selectedWallet?.id === wallet.id && (
                    <div className={style.subMenu}>
                      <button
                        className={style.editButton}
                        onClick={() => toggleEditModal()}
                      >
                        Editar
                      </button>
                      <button
                        className={style.eraseButton}
                        onClick={() => toggleExclusionModal()}
                      >
                        Apagar
                      </button>
                      <button
                        className={style.exitButton}
                        onClick={() => toggleUserRemoveModal()}
                      >
                        Sair da Carteira
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <RemoveUserFromWalletModal
        title="Sair da carteira"
        isOpen={isRemoveUserModalOpen && selectedWallet !== null}
        wallet={selectedWallet}
        onClose={toggleUserRemoveModal}
        onUserRemoved={removeWallet}
      ></RemoveUserFromWalletModal>
      <WalletEraseModal
        title="Excluir carteira?"
        isOpen={isExclusionModalOpen && selectedWallet !== null}
        wallet={selectedWallet}
        onWalletErased={removeWallet}
        onClose={toggleExclusionModal}
      ></WalletEraseModal>
      <WalletManipulationModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        title="Criar nova carteira"
        onWalletCreated={addWallet}
      ></WalletManipulationModal>
      <WalletManipulationModal
        isOpen={isEditModalOpen && selectedWallet !== null}
        onClose={toggleEditModal}
        title="Atualizar carteira"
        onWalletCreated={modifyWallet}
        walletId={selectedWallet?.id}
        currentDescription={selectedWallet?.description}
        currentName={selectedWallet?.name}
      ></WalletManipulationModal>
      <button
        title="Criar Nova Carteira"
        className={style.addWalletButton}
        onClick={() => toggleModal()}
      >
        <i className="bi bi-plus-circle" style={{ fontSize: "24px" }}></i>
      </button>
    </main>
  );
}
