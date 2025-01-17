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
import TransactionExclusionModal from "@/components/TransactionExclusionModal/TransactionExclusionModal";
import { Category } from "@/types/Category";
import { User } from "@/types/User";
import WalletUsersModal from "@/components/WalletUsersModal/WalletUsersModal";
import WalletCategoriesModal from "@/components/WalletCategoriesModal/WalletCategoriesModal";

const Wallets = () => {
  const params = useParams();
  const { walletId } = params;
  const router = useRouter();

  if (!walletId || isNaN(Number(walletId)) || walletId === "") {
    router.push("/home");
    return;
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] =
    useState(false);
  const [isTransactionExclusionModalOpen, setIsTransactionExclusionModalOpen] =
    useState(false);
  const [isWalletUserModalOpen, setIsWalletUserModalOpen] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const toggleExclusionModal = () => {
    setIsTransactionExclusionModalOpen(!isTransactionExclusionModalOpen);
  };

  const addTransactionToList = (newTransaction: Transaction) => {
    setTransactions((prevTransactions) => [
      ...prevTransactions,
      newTransaction,
    ]);
  };

  const toggleWalletUserModal = () => {
    setIsWalletUserModalOpen(!isWalletUserModalOpen);
  };
  const toggleCategoriesModal = () => {
    setIsCategoriesModalOpen(!isCategoriesModalOpen);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
  };

  const handleUserRemoved = (userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const handleUserAdded = (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleAddCategory = (newCategory: Category) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  const handleRemoveCategory = (categoryId: number) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== categoryId)
    );
  };

  const toggleEditTransactionModal = () => {
    setIsEditTransactionModalOpen(!isEditTransactionModalOpen);
  };

  const toggleTransactionModal = () => {
    setIsTransactionModalOpen(!isTransactionModalOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const removeTransaction = (transactionId: number) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== transactionId)
    );
  };

  const modifyTransaction = (changedTransaction: Transaction) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === changedTransaction.id
          ? { ...transaction, ...changedTransaction }
          : transaction
      )
    );
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/wallets/${walletId}`,
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
        if (data.name !== walletName) setWalletName(data.name);
        setCategories(data.categories);
        setUsers(data.users);
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${walletId}`,
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

  const handleSubmenuClick = (newTransaction: Transaction) => {
    setSelectedTransaction(
      newTransaction?.id === selectedTransaction?.id ? null : newTransaction
    );

    if (selectedTransaction === null) setIsEditTransactionModalOpen(false);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorPage message={error} />;

  // Calcula os totais
  const totalIncomes = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  const currentBalance = transactions.reduce(
    (acc, transaction) =>
      transaction.type === "income"
        ? acc + parseFloat(transaction.amount)
        : acc - parseFloat(transaction.amount),
    0
  );

  return (
    <main className={styles.walletContainer}>
      <button className={styles.btnSidebar} onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      {walletName && (
        <header className={styles.walletDetails}>
          <h1>{walletName}</h1>
          <div className={styles.incomesAndExpensesContainer}>
            <p className={styles.incomes}>
              <i className="bi bi-arrow-up"></i>Recebimentos:{" "}
              {totalIncomes.toFixed(2)}
            </p>
            <p className={styles.expenses}>
              <i className="bi bi-arrow-down"></i>Gastos:{" "}
              {totalExpenses.toFixed(2)}
            </p>
            <p className={styles.balance}>
              <i className="bi bi-cash"></i> Saldo:{" "}
              {currentBalance ? currentBalance.toFixed(2) : "0,00"}
            </p>
          </div>
        </header>
      )}

      <section className={styles.walletActions}>
        <button onClick={toggleTransactionModal} className={styles.btnAdd}>
          <i className="bi bi-plus-circle"></i> Adicionar Transação
        </button>
        <button
          onClick={toggleWalletUserModal}
          className={styles.btnParticipants}
        >
          <i className="bi bi-people"></i> Participantes
        </button>
        <button
          onClick={toggleCategoriesModal}
          className={styles.btnCategories}
        >
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
                  onClick={() => handleSubmenuClick(transaction)}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </button>
                {selectedTransaction?.id === transaction.id && (
                  <div className={styles.transactionMenu}>
                    <button onClick={() => toggleEditTransactionModal()}>
                      <i className="bi bi-pencil"></i> Editar
                    </button>
                    <button onClick={() => toggleExclusionModal()}>
                      <i className="bi bi-trash"></i> Excluir
                    </button>
                  </div>
                )}
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
        onTransactionManipulated={addTransactionToList}
        categories={categories}
        walletId={Number(walletId)}
      ></TransactionManipulationModal>

      {selectedTransaction !== null && (
        <TransactionManipulationModal
          title="Editar Transação"
          isOpen={isEditTransactionModalOpen && selectedTransaction !== null}
          onTransactionManipulated={modifyTransaction}
          onClose={toggleEditTransactionModal}
          transaction={selectedTransaction}
          categories={categories}
          walletId={Number(walletId)}
        ></TransactionManipulationModal>
      )}
      {selectedTransaction !== null && (
        <TransactionExclusionModal
          isOpen={
            isTransactionExclusionModalOpen && selectedTransaction !== null
          }
          onClose={toggleExclusionModal}
          title="Exclusão de Transação"
          onTransactionErased={removeTransaction}
          walletId={Number(walletId)}
          transaction={selectedTransaction}
        ></TransactionExclusionModal>
      )}
      <WalletUsersModal
        isOpen={isWalletUserModalOpen}
        onClose={toggleWalletUserModal}
        users={users}
        walletId={Number(walletId)}
        onUserAdded={handleUserAdded}
        onUserRemoved={handleUserRemoved}
        onUserUpdated={handleUserUpdated}
      ></WalletUsersModal>
      <WalletCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={toggleCategoriesModal}
        categories={categories}
        walletId={Number(walletId)}
        onCategoryAdded={handleAddCategory}
        onCategoryRemoved={handleRemoveCategory}
        onCategoryUpdated={handleUpdateCategory}
      ></WalletCategoriesModal>
    </main>
  );
};

export default Wallets;
