import style from "./ErrorPage.module.scss";

interface ErrorProps {
  message: string;
}

const ErrorPage = ({ message }: ErrorProps) => {
  return (
    <div className={style.errorContainer}>
      <p className={style.errorMessage}>{message}</p>
    </div>
  );
};

export default ErrorPage;
