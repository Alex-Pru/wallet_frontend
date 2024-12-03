"use client";
import { Wallet } from "@/types/Wallet";
import style from "./home.module.scss";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorPage from "@/components/error/ErrorPage";
import Loading from "@/components/loading/Loading";

import Sidebar from "@/components/sidebar/Sidebar"; // Componente do menu lateral
import NewWalletModal from "@/components/newWalletPopup/NewWalletModal";

export default function Home() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para controlar o menu lateral
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
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
              <li key={wallet.id} className="walletItem">
                <b>{wallet.name}</b>
                <p>{wallet.description}</p>
                <p>{wallet.created_at.split("T")[0]}</p>
                {wallet.updated_at && <p>{wallet.updated_at.split("T")[0]}</p>}
                <div className="transactionButtons">
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
                  <button onClick={() => handleSubmenuClick(wallet)}>
                    &#x2022;&#x2022;&#x2022; {/* Representa os três pontos */}
                  </button>
                  {/* Menu de opções */}
                  {selectedWallet?.id === wallet.id && (
                    <div className={style.menu}>
                      <button onClick={() => toggleEditModal()}>Editar</button>
                      <button onClick={() => console.log("apagar")}>
                        Apagar
                      </button>
                      <button onClick={() => console.log("sair")}>
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
      <NewWalletModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        title="Criar nova carteira"
        onWalletCreated={addWallet}
      ></NewWalletModal>
      <NewWalletModal
        isOpen={isEditModalOpen}
        onClose={toggleEditModal}
        title="Atualizar carteira"
        onWalletCreated={modifyWallet}
        walletId={selectedWallet?.id}
        currentDescription={selectedWallet?.description}
        currentName={selectedWallet?.name}
      ></NewWalletModal>
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
