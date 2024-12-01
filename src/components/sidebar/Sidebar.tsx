import Link from "next/link";
import style from "./Sidebar.module.scss";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <div
      className={`${style.sidebar} ${
        isOpen ? style.sidebarVisible : style.sidebarHidden
      }`}
    >
      <button className={style.sidebarToggle} onClick={() => toggleSidebar()}>
        <i className="bi bi-x"></i>
      </button>
      <ul className={style.menuItems}>
        <li>
          <Link href="/home">Home</Link> {/* Apenas o Link é suficiente */}
        </li>
        <li>
          <Link href="/">About</Link>
        </li>
      </ul>
    </div>
  );
}
