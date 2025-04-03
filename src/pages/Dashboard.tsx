import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AddProductForm from "../components/AddProductForm";
import Modal from "../components/Modal";
import "../styles/Dashboard.css";

interface ShoppingListItem {
  id: number;
  designation: string;
  quantite: number;
  type_id: number;
  genre_id: number;
  user_id?: number;
}

interface StockItem {
  id: number;
  designation: string;
  quantite: number;
  type_id: number;
  genre_id: number;
}

interface LoaderData {
  shoppingList: ShoppingListItem[];
  stockItems: StockItem[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData() as LoaderData;

  console.log("Données reçues du loader:", loaderData);

  const [searchQuery, setSearchQuery] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("UseEffect - Données du loader:", loaderData);
    if (loaderData) {
      setShoppingList(loaderData.shoppingList || []);
      setStockItems(loaderData.stockItems || []);
      setIsLoading(false);
    }
  }, [loaderData]);

  // Fonction pour valider un article de la liste de courses
  const validateShoppingItem = async (itemId: number) => {
    try {
      await axios.post(
        `http://localhost:3315/api/shopping-list/validate/${itemId}`
      );
      navigate(".", { replace: true });
      toast.success("Article validé avec succès");
    } catch (error) {
      console.error("Erreur lors de la validation de l'article:", error);
      toast.error("Erreur lors de la validation de l'article");
      setError("Erreur lors de la validation de l'article");
    }
  };

  // Fonction pour supprimer un article de la liste de courses
  const deleteShoppingItem = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3315/api/delete/shoppingList/${id}`);
      navigate(".", { replace: true });
      toast.success("Article supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article:", error);
      toast.error("Erreur lors de la suppression de l'article");
    }
  };

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

  console.log("État actuel - Liste de courses:", shoppingList);
  console.log("État actuel - Stock:", stockItems);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (isLoading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  // Filtrer les articles en fonction de la recherche
  const filteredShoppingList = shoppingList.filter((item) =>
    item.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStockItems = stockItems.filter((item) =>
    item.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="actions">
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          Ajouter un article à la liste
        </button>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un article à la liste de courses"
      >
        <AddProductForm
          onProductAdded={() => {
            navigate(".", { replace: true });
            setIsModalOpen(false);
            toast.success("Article ajouté avec succès");
          }}
        />
      </Modal>

      <section className="shopping-list">
        <h2>
          Liste de courses{" "}
          {filteredShoppingList.length > 0 &&
            `(${filteredShoppingList.length})`}
        </h2>
        <div className="items-grid">
          {filteredShoppingList.length === 0 ? (
            <p className="empty-message">
              {searchQuery
                ? "Aucun article ne correspond à votre recherche"
                : "Aucun article dans la liste de courses"}
            </p>
          ) : (
            filteredShoppingList.map((item) => (
              <div key={item.id} className="item-card shopping-item">
                <h3>{item.designation}</h3>
                <p>Quantité: {item.quantite}</p>
                <p>Type: {getTypeLabel(item.type_id)}</p>
                <p>Catégorie: {getGenreLabel(item.genre_id)}</p>
                <div className="button-group">
                  <button
                    className="validate-button"
                    onClick={() => validateShoppingItem(item.id)}
                  >
                    Valider l'achat
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteShoppingItem(item.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="stock-list">
        <h2>
          Stock actuel{" "}
          {filteredStockItems.length > 0 && `(${filteredStockItems.length})`}
        </h2>
        <div className="items-grid">
          {filteredStockItems.length === 0 ? (
            <p className="empty-message">
              {searchQuery
                ? "Aucun article ne correspond à votre recherche"
                : "Aucun article en stock"}
            </p>
          ) : (
            filteredStockItems.map((item) => (
              <div key={item.id} className="item-card stock-item">
                <h3>{item.designation}</h3>
                <p>Quantité: {item.quantite}</p>
                <p>Type: {getTypeLabel(item.type_id)}</p>
                <p>Catégorie: {getGenreLabel(item.genre_id)}</p>
              </div>
            ))
          )}
        </div>
        <button
          className="stock-button"
          type="button"
          onClick={() => navigate("/stock")}
        >
          Voir le stock
        </button>
      </section>
    </div>
  );
};

export default Dashboard;
