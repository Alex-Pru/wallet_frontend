"use client";
import Image from "next/image";
import style from "./login.module.scss";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showError, setShowError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const logWithGoogle = () => {
    if (process.env.NEXT_PUBLIC_GOOGLE_AUTH_LINK) {
      window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_LINK;
    } else {
      console.error(
        "A variável de ambiente NEXT_PUBLIC_GOOGLE_AUTH_LINK não está definida."
      );
    }
    return;
  };

  const goBackToHome = () => {
    router.push("/"); // Volta para a página inicial
  };

  useEffect(() => {
    const event = searchParams.get("event");

    if (event) {
      setShowError(true); // Mostra o erro
      const timer = setTimeout(() => setShowError(false), 5000); // Esconde o erro após 5 segundos

      // Limpa o timeout se o componente for desmontado
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // Reexecuta quando searchParams mudar

  return (
    <main className={style.mainContent}>
      {showError && (
        <section className={style.errorMessage}>
          <p>Falha ao conectar, tente novamente</p>
        </section>
      )}
      <section className={style.loginOptions}>
        <header>
          <div className={style.imgContainer}>
            <Image
              fill
              sizes="50$"
              priority
              alt="Foto do projeto WalletIO"
              src="/walletIoLogo.png"
            ></Image>
          </div>
        </header>
        <div className={style.loginContainer}>
          <section className={style.defaultLogin}>
            <p>
            Neste momento, só é possível fazer login com a conta Google. Agradecemos pela compreensão.
            </p>
          </section>
          <section className={style.loginStrategies}>
            <button onClick={logWithGoogle} className={style.googleStrategy}>
              Entre com Google
              <i className="bi bi-google"></i>
            </button>
            {/* Botão de retorno à página inicial */}
            <button onClick={goBackToHome} className={style.backToHome}>
              Voltar ao Início
            </button>
          </section>
        </div>
      </section>
      <footer></footer>
    </main>
  );
}
