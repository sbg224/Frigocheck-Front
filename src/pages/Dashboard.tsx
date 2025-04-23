import type React from "react";
import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AddProductForm from "../components/AddProductForm";
import axiosInstance, { getUserFromToken } from "../utils/axios";
import { toast } from "react-toastify";
import "../styles/Dashboard.css";

interface LoaderData {
  shoppingList: { id: number; designation: string; type_id: number; genre_id: number; quantite: number }[];
  stockItems: { id: number; designation: string; type_id: number; genre_id: number; quantite: number }[];
}

const Dashboard: React.FC = () => {
  const { shoppingList: initialShoppingList, stockItems: initialStockItems } =
    useLoaderData() as LoaderData;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [shoppingList, setShoppingList] = useState(initialShoppingList);
  const [stockItems, setStockItems] = useState(initialStockItems);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Mettre à jour les états locaux lorsque les données du loader changent
  useEffect(() => {
    console.log("Données du loader mises à jour:", {
      shoppingList: initialShoppingList,
      stockItems: initialStockItems,
    });
    setShoppingList(initialShoppingList);
    setStockItems(initialStockItems);
  }, [initialShoppingList, initialStockItems]);

  const handleProductAdded = () => {
    console.log("Produit ajouté, rechargement des données...");
    setIsAddProductModalOpen(false);
    // Recharger les données
    navigate(".", { replace: true });
  };

  const handleValidateShoppingItem = async (itemId: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour valider un produit");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Validation du produit:", itemId);
      await axiosInstance.post(
        `http://localhost:3315/api/shopping-list/validate/${itemId}`
      );
      toast.success("Produit validé avec succès");
      console.log("Produit validé avec succès, rechargement des données...");
      // Recharger les données
      navigate(".", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la validation du produit:", error);
      toast.error("Une erreur est survenue lors de la validation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShoppingItem = async (itemId: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour supprimer un produit");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Suppression du produit:", itemId);
      await axiosInstance.delete(
        `http://localhost:3315/api/delete/shoppingList/${itemId}`
      );
      toast.success("Produit supprimé avec succès");
      console.log("Produit supprimé avec succès, rechargement des données...");
      // Recharger les données
      navigate(".", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsLoading(false);
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


  // Filtrer les produits en fonction de la recherche et des filtres
  const filteredShoppingList = shoppingList.filter((item) => {
    const matchesSearch = item.designation
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || item.type_id.toString() === selectedType;

    const matchesGenre =
      selectedGenre === "all" || item.genre_id.toString() === selectedGenre;

    return matchesSearch && matchesType && matchesGenre;
  });

  const filteredStockItems = stockItems.filter((item) => {
    const matchesSearch = item.designation
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || item.type_id.toString() === selectedType;

    const matchesGenre =
      selectedGenre === "all" || item.genre_id.toString() === selectedGenre;

    return matchesSearch && matchesType && matchesGenre;
  });

  // Gérer le changement de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Gérer le changement de filtre de type
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  // Gérer le changement de filtre de genre
  const handleGenreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedGenre("all");
  };

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>

      {/* Filtres et recherche */}
      <div className="filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label htmlFor="type-filter">Type:</label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={handleTypeFilterChange}
            >
              <option value="all">Tous les types</option>
              <option value="5">Frais</option>
              <option value="6">Conserve</option>
              <option value="7">Surgelé</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="genre-filter">Genre:</label>
            <select
              id="genre-filter"
              value={selectedGenre}
              onChange={handleGenreFilterChange}
            >
              <option value="all">Tous les genres</option>
              <option value="5">Fruits & Légumes</option>
              <option value="6">Viandes & Poissons</option>
              <option value="7">Produits Laitiers</option>
              <option value="8">Épicerie</option>
            </select>
          </div>

          <button type="button" className="reset-filters" onClick={resetFilters}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Section Liste de courses */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Liste de courses</h2>
          <button
          type="button"
            className="add-button"
            onClick={() => setIsAddProductModalOpen(true)}
            disabled={isLoading}
          >
            Ajouter un produit
          </button>
        </div>

        {shoppingList.length === 0 ? (
          <div className="empty-state">
            <p>Votre liste de courses est vide.</p>
            <p>
              Cliquez sur "Ajouter un produit" pour commencer à remplir votre
              liste.
            </p>
          </div>
        ) : filteredShoppingList.length === 0 ? (
          <div className="empty-state">
            <p>Aucun produit ne correspond à vos critères de recherche.</p>
            <p>Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredShoppingList.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <h3>{item.designation}</h3>
                  <p>
                    <span className="label">Type:</span>{" "}
                    {getTypeLabel(item.type_id)}
                  </p>
                  <p>
                    <span className="label">Genre:</span>{" "}
                    {getGenreLabel(item.genre_id)}
                  </p>
                  <p>
                    <span className="label">Quantité:</span> {item.quantite}
                  </p>
                </div>
                <div className="item-actions">
                  <button
                  type="button"
                    className="validate-button"
                    onClick={() => handleValidateShoppingItem(item.id)}
                    disabled={isLoading}
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDeleteShoppingItem(item.id)}
                    disabled={isLoading}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Stock */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Stock</h2>
        </div>

        {stockItems.length === 0 ? (
          <div className="empty-state">
            <p>Votre stock est vide.</p>
            <p>
              Validez des produits de votre liste de courses pour les ajouter à
              votre stock.
            </p>
          </div>
        ) : filteredStockItems.length === 0 ? (
          <div className="empty-state">
            <p>Aucun produit ne correspond à vos critères de recherche.</p>
            <p>Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredStockItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <h3>{item.designation}</h3>
                  <p>
                    <span className="label">Type:</span>{" "}
                    {getTypeLabel(item.type_id)}
                  </p>
                  <p>
                    <span className="label">Genre:</span>{" "}
                    {getGenreLabel(item.genre_id)}
                  </p>
                  <p>
                    <span className="label">Quantité:</span> {item.quantite}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="button" className="view-more-button" onClick={() => navigate("/stock")}>
          Voir plus de produits
        </button>
      </div>

      {/* Modal d'ajout de produit */}
      {isAddProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ajouter un produit</h2>
            <AddProductForm
              onProductAdded={handleProductAdded}
              onClose={() => setIsAddProductModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
