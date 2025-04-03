import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import axios from "axios";
import "../styles/Stock.css";

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
  const { stockItems } = useLoaderData() as LoaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editedItem, setEditedItem] = useState<StockItem | null>(null);

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
    if (editedItem) {
      try {
        await axios.put(
          `http://localhost:3315/api/modifi/produit/${editedItem.id}`,
          editedItem
        );
        toast.success("Article modifié avec succès");
        handleCloseModal();
        window.location.reload(); // Recharger la page pour mettre à jour les données
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error("Erreur lors de la mise à jour de l'article");
      }
    }
  };

  const handleDelete = async () => {
    if (selectedItem) {
      try {
        await axios.delete(
          `http://localhost:3315/api/supprime/produit/${selectedItem.id}`
        );
        toast.success("Article supprimé avec succès");
        setIsDeleteConfirmOpen(false);
        handleCloseModal();
        window.location.reload(); // Recharger la page pour mettre à jour les données
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression de l'article");
      }
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

      {/* Modal de modification */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Modifier l'article"
      >
        {editedItem && (
          <div className="edit-form">
            <div className="form-group">
              <label>Désignation:</label>
              <input
                type="text"
                name="designation"
                value={editedItem.designation}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Quantité:</label>
              <input
                type="number"
                name="quantite"
                value={editedItem.quantite}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                name="type_id"
                value={editedItem.type_id}
                onChange={handleInputChange}
              >
                <option value={5}>Frais</option>
                <option value={6}>Conserve</option>
                <option value={7}>Surgelé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Genre:</label>
              <select
                name="genre_id"
                value={editedItem.genre_id}
                onChange={handleInputChange}
              >
                <option value={5}>F & L</option>
                <option value={6}>NAL</option>
                <option value={7}>Viandes</option>
                <option value={8}>Produits Laitiers</option>
                <option value={9}>Épicerie</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="save-button" onClick={handleSave}>
                Valider
              </button>
              <button
                className="delete-button"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="confirm-delete">
          <p>Êtes-vous sûr de vouloir supprimer cet article ?</p>
          <div className="modal-actions">
            <button className="delete-button" onClick={handleDelete}>
              Confirmer
            </button>
            <button
              className="cancel-button"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stock;
