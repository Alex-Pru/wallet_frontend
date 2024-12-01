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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
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
            {wallets.map((wallet, index) => (
              <li
                id={wallet.id.toString()}
                key={index}
                className={style.walletItem}
              >
                <b>{wallet.name}</b>
                <p>{wallet.description}</p>
                <p>{wallet.created_at}</p>
                {wallet.updated_at && <p>{wallet.updated_at}</p>}
                <div className={style.transactionButtons}>
                  <button onClick={() => handleAddTransaction(wallet.id)}>
                    Adicionar Gasto
                  </button>
                  <button onClick={() => handleAddTransaction(wallet.id)}>
                    Adicionar Recebimento
                  </button>
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
      <button className={style.addWalletButton} onClick={() => toggleModal()}>
        <i className="bi bi-plus-circle" style={{ fontSize: "24px" }}></i>
      </button>
    </main>
  );
}
