"use client";
import ErrorPage from "@/components/error/ErrorPage";
import Loading from "@/components/loading/Loading";
import { WalletDetails } from "@/types/WalletDetails";
import { Transaction } from "@/types/Transaction";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Wallet.module.scss";
import Sidebar from "@/components/sidebar/Sidebar";
import TransactionManipulationModal from "@/components/TransactionManipulationModal/TransactionManipulationModal";

const Wallets = () => {
  const params = useParams();
  const { walletId } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const addTransactionToList = (newTransaction: Transaction) => {
    setTransactions((prevTransactions) => [
      ...prevTransactions,
      newTransaction,
    ]);
  };

  const toggleTransactionModal = () => {
    setIsTransactionModalOpen(!isTransactionModalOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (!walletId) {
      setError("Selecione uma carteira para prosseguir");
      setLoading(false);
      return;
    }

    const fetchWalletDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/wallets/${walletId}`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        if (res.status === 403) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const error = await res.json();
          setError(error.message || "An unexpected error occurred.");
          return;
        }

        const data: WalletDetails = await res.json();
        setWalletDetails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/transactions/${walletId}`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data: Transaction[] = await res.json();
        setTransactions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
    };

    fetchWalletDetails();
    fetchTransactions();
  }, [walletId, router]);

  const toggleMenu = (id: number) => {
    const menu = document.getElementById(`menu-${id}`);
    if (menu) {
      menu.classList.toggle(styles.show);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorPage message={error} />;

  return (
    <main className={styles.walletContainer}>
      <button className={styles.btnSidebar} onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      {walletDetails && (
        <header className={styles.walletDetails}>
          <h1>{walletDetails.name}</h1>
          <div className={styles.incomesAndExpensesContainer}>
            <p className={styles.incomes}>
              <i className="bi bi-arrow-up"></i>Recebimentos:
              {walletDetails.totalIncomes}
            </p>
            <p className={styles.expenses}>
              <i className="bi bi-arrow-down"></i>Gastos:
              {walletDetails.totalExpenses}
            </p>
          </div>
        </header>
      )}

      <section className={styles.walletActions}>
        <button onClick={toggleTransactionModal} className={styles.btnAdd}>
          <i className="bi bi-plus-circle"></i> Adicionar Transação
        </button>
        <button className={styles.btnParticipants}>
          <i className="bi bi-people"></i> Participantes
        </button>
        <button className={styles.btnCategories}>
          <i className="bi bi-tag"></i> Categorias
        </button>
      </section>

      <section className={styles.transactions}>
        <h2>Transações deste mês</h2>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
                  <strong>{transaction.title}</strong> - {transaction.amount} (
                  {transaction.type})<p>{transaction.description}</p>
                  <small>
                    {new Date(transaction.date).toLocaleDateString()}
                  </small>
                </div>
                <button
                  className={styles.btnMenu}
                  onClick={() => toggleMenu(transaction.id)}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </button>
                <div
                  id={`menu-${transaction.id}`}
                  className={`${styles.transactionMenu}`}
                >
                  <button>
                    <i className="bi bi-pencil"></i> Editar
                  </button>
                  <button>
                    <i className="bi bi-trash"></i> Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma transação encontrada.</p>
        )}
      </section>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></Sidebar>
      <TransactionManipulationModal
        title="Criar Transação"
        isOpen={isTransactionModalOpen}
        onClose={toggleTransactionModal}
        onTransactionCreated={addTransactionToList}
        walletId={Number(walletId)}
      ></TransactionManipulationModal>
    </main>
  );
};

export default Wallets;
