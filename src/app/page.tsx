import Image from "next/image";
import style from "./page.module.scss";
import Link from "next/link";

export default function Home() {
  return (
    <main className={style.mainContent}>
      <section className={style.mainInformationsSection}>
        <div className={style.imgContainer}>
          <Image
            fill
            sizes="50$"
            priority
            alt="Foto do projeto WalletIO"
            src="/walletIoLogo.png"
          ></Image>
        </div>
        <section className={style.subtitleSection}>
          <b>Precisa de organização financeira?</b>
          <article>
            Gerencie as suas finanças de forma simplificada, sem quebrar a
            cabeça com planilhas
          </article>
          <Link href="/login" className={style.linkLogin}>
            Experimentar
            <i className="bi bi-wallet2"></i>
          </Link>
        </section>
      </section>

      <section>
        <article></article>
      </section>

      <footer className={style.footerContainer}>
        <section>
          <p>Made by Alessandro Silva</p>
          <div>
            <a
              title="Link to linkedin"
              href="https://www.linkedin.com/in/ale-pru/"
            >
              <i className="bi bi-linkedin"></i>
            </a>
            <a title="Link to Github" href="https://github.com/Alex-Pru">
              <i className="bi bi-github"></i>
            </a>
            <a title="Link to Whatsapp" href="https://wa.me/5581999533234">
              <i className="bi bi-whatsapp"></i>
            </a>
          </div>
        </section>
      </footer>
    </main>
  );
}
