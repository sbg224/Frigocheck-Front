import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import axiosInstance from "../utils/axios";
import "../styles/Stock.css";
import { useAuth } from "../contexts/AuthContext";

interface StockItem {
  id: number;
  designation: string;
  quantite: number;
  type_id: number;
  genre_id: number;
}

interface LoaderData {
  stockItems: StockItem[];
}

const Stock = () => {
  const navigate = useNavigate();
  const { stockItems: initialStockItems } = useLoaderData() as LoaderData;
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editedItem, setEditedItem] = useState<StockItem | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour stockItems quand initialStockItems change
  useEffect(() => {
    setStockItems(initialStockItems);
  }, [initialStockItems]);

  const getTypeLabel = (typeId: number) => {
    const types: { [key: number]: string } = {
      5: "Frais",
      6: "Conserve",
      7: "Surgelé",
    };
    return types[typeId] || "Inconnu";
  };

  const getGenreLabel = (genreId: number) => {
    const genres: { [key: number]: string } = {
      5: "F & L",
      6: "NAL",
      7: "Viandes",
      8: "Produits Laitiers",
      9: "Épicerie",
    };
    return genres[genreId] || "Inconnu";
  };

  const handleItemClick = (item: StockItem) => {
    setSelectedItem(item);
    setEditedItem({ ...item });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setEditedItem(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (editedItem) {
      setEditedItem({
        ...editedItem,
        [e.target.name]:
          e.target.type === "number" ? Number(e.target.value) : e.target.value,
      });
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Vous devez être connecté pour modifier un article");
      return;
    }

    if (!editedItem) return;

    setIsLoading(true);
    try {
      await axiosInstance.put(
        `http://localhost:3315/api/modifi/produit/${editedItem.id}`,
        {
          ...editedItem,
          user_id: user.id,
        }
      );

      // Mettre à jour l'état local
      setStockItems((prevItems) =>
        prevItems.map((item) => (item.id === editedItem.id ? editedItem : item))
      );

      toast.success("Article modifié avec succès");
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification de l'article");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Vous devez être connecté pour supprimer un article");
      return;
    }

    if (!selectedItem) return;

    setIsLoading(true);
    try {
      await axiosInstance.delete(
        `http://localhost:3315/api/supprime/produit/${selectedItem.id}`,
        {
          data: { user_id: user.id },
        }
      );

      // Mettre à jour l'état local
      setStockItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItem.id)
      );

      toast.success("Article supprimé avec succès");
      setIsDeleteConfirmOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'article");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = stockItems.filter((item) =>
    item.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsByType = filteredItems.reduce((acc, item) => {
    const type = getTypeLabel(item.type_id);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as { [key: string]: StockItem[] });

  return (
    <div className="stock-page">
      <header className="stock-header">
        <h1>Mon Frigo</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {Object.entries(itemsByType).map(([type, items]) => (
        <section key={type} className="stock-section">
          <h2>
            {type} {items.length > 0 && `(${items.length})`}
          </h2>
          <div className="items-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className="item-card"
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleItemClick(item);
                  }
                }}
              >
                <h3>{item.designation}</h3>
                <p>Quantité: {item.quantite}</p>
                <p>Catégorie: {getGenreLabel(item.genre_id)}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {filteredItems.length === 0 && (
        <p className="empty-message">
          {searchQuery
            ? "Aucun article ne correspond à votre recherche"
            : "Aucun article en stock"}
        </p>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title="Modifier l'article"
          onClose={handleCloseModal}
        >
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="designation">Désignation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={editedItem?.designation || ""}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantite">Quantité</label>
              <input
                type="number"
                id="quantite"
                name="quantite"
                value={editedItem?.quantite || 0}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type_id">Type</label>
              <select
                id="type_id"
                name="type_id"
                value={editedItem?.type_id || 5}
                onChange={handleInputChange}
                required
              >
                <option value="5">Frais</option>
                <option value="6">Conserve</option>
                <option value="7">Surgelé</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="genre_id">Catégorie</label>
              <select
                id="genre_id"
                name="genre_id"
                value={editedItem?.genre_id || 5}
                onChange={handleInputChange}
                required
              >
                <option value="5">F & L</option>
                <option value="6">NAL</option>
                <option value="7">Viandes</option>
                <option value="8">Produits Laitiers</option>
                <option value="9">Épicerie</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="save-button"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Enregistrement..." : "Valider"}
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={isLoading}
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isDeleteConfirmOpen && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          title="Confirmer la suppression"
          onClose={() => setIsDeleteConfirmOpen(false)}
        >
          <div className="confirm-delete">
            <p>
              Êtes-vous sûr de vouloir supprimer l'article{" "}
              <strong>{selectedItem?.designation}</strong> ?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Suppression..." : "Confirmer"}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Stock;
