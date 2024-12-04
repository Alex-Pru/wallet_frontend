"use client";
import ErrorPage from "@/components/error/ErrorPage";
import Loading from "@/components/loading/Loading";
import { WalletDetails } from "@/types/WalletDetails";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Wallets = () => {
  const params = useParams();
  const { walletId } = params; // Verifique se `walletId` realmente está disponível e é obrigatório.
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

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
            credentials: "include", // Envia cookies para autenticação
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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWalletDetails();
  }, [walletId, router]); // Adicione dependências apropriadas

  if (loading) return <Loading />;

  if (error) return <ErrorPage message={error} />;

  return (
    <main>
      {walletDetails ? (
        <div>
          <h1>{walletDetails.name}</h1>
          <b>Recebimentos: {walletDetails.totalIncomes}</b>
          <b>Gastos: {walletDetails.totalExpenses}</b>
        </div>
      ) : (
        <p>No details available.</p>
      )}
    </main>
  );
};

export default Wallets;
