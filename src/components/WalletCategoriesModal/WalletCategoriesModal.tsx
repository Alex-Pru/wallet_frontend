import { useState } from "react";
import style from "./WalletCategoriesModal.module.scss";
import { Category } from "@/types/Category";
import { useRouter } from "next/navigation";

interface WalletCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: number;
  categories: Category[];
  onCategoryUpdated: (updatedCategory: Category) => void;
  onCategoryRemoved: (categoryId: number) => void;
  onCategoryAdded: (newCategory: Category) => void;
}

const WalletCategoriesModal = ({
  isOpen,
  onClose,
  walletId,
  categories = [], // Garantir que categories é um array vazio por padrão
  onCategoryUpdated,
  onCategoryRemoved,
  onCategoryAdded,
}: WalletCategoriesModalProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); // Estado para controlar a categoria sendo editada

  const router = useRouter();

  const handleCategoryUpdate = async (updatedCategory: Category) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/updateCategory/${walletId}?categoryId=${updatedCategory.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updatedFields: {
              name: updatedCategory.name,
              description: updatedCategory.description,
            },
          }),
        }
      );

      if (res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao atualizar a categoria");

      const changedCategory: Category = await res.json();

      onCategoryUpdated(changedCategory);
      setEditingCategory(null); // Limpar o estado após a atualização
    } catch (err) {
      alert(err);
    }
  };

  const handleCategoryRemove = async (categoryId: number) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/transactions/deleteCategory/${walletId}?categoryId=${categoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao remover a categoria");

      onCategoryRemoved(categoryId);
    } catch (err) {
      alert(err);
    }
  };

  const handleCategoryAdd = async () => {
    if (!newCategoryName.trim()) {
      setError("O nome da categoria é obrigatório.");
      return;
    }

    try {
      const newCategoryObject = {
        name: newCategoryName,
        description: newCategoryDescription,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/category/${walletId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newCategory: newCategoryObject }),
        }
      );

      if (res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Erro ao adicionar a categoria");

      const newCategory: Category = await res.json();
      onCategoryAdded(newCategory);
      setNewCategoryName("");
      setNewCategoryDescription("");
      setError("");
    } catch (err) {
      alert(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={style.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <h2>Gerenciar Categorias</h2>
          <button onClick={onClose} className={style.closeButton}>
            &times;
          </button>
        </div>
        <div className={style.modalBody}>
          <div className={style.addCategory}>
            <h3>Adicionar Categoria</h3>
            {error && <p className={style.error}>{error}</p>}
            <input
              type="text"
              placeholder="Nome da Categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <textarea
              placeholder="Descrição da Categoria"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
            <button onClick={handleCategoryAdd} className={style.addButton}>
              Adicionar
            </button>
          </div>

          <h3>Categorias Existentes</h3>
          <div className={style.categoryListContainer}>
            <ul className={style.categoryList}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id} className={style.categoryItem}>
                    <input
                      type="text"
                      value={
                        editingCategory?.id === category.id
                          ? editingCategory.name
                          : category.name
                      }
                      onChange={(e) =>
                        setEditingCategory((prevCategory) =>
                          prevCategory && prevCategory.id === category.id
                            ? { ...prevCategory, name: e.target.value }
                            : category
                        )
                      }
                    />
                    <textarea
                      value={
                        editingCategory?.id === category.id
                          ? editingCategory.description
                          : category.description || ""
                      }
                      onChange={(e) =>
                        setEditingCategory((prevCategory) =>
                          prevCategory && prevCategory.id === category.id
                            ? { ...prevCategory, description: e.target.value }
                            : category
                        )
                      }
                    />
                    {editingCategory?.id === category.id ? (
                      <button
                        onClick={() => handleCategoryUpdate(editingCategory)}
                        className={style.saveButton}
                      >
                        Salvar
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingCategory(category)}
                        className={style.editButton}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleCategoryRemove(category.id)}
                      className={style.removeButton}
                    >
                      Remover
                    </button>
                  </li>
                ))
              ) : (
                <p>Não há categorias nesta carteira</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCategoriesModal;
