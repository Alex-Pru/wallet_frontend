import style from "./Loading.module.scss";

const Loading = () => {
  return (
    <div className={style.loadingContainer}>
      <div className={style.spinner}></div>
      <p>Carregando...</p>
    </div>
  );
};

export default Loading;
