import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";
import "../styles/AddProductForm.css";

interface ProductFormData {
  designation: string;
  user_id: number;
  type_id: number;
  genre_id: number;
  quantite: number;
}

interface ProductExistsResponse {
  error: string;
  productId: number;
  currentQuantity: number;
  action: string;
}

interface AddProductFormProps {
  onProductAdded: () => void;
  onClose: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onProductAdded,
  onClose,
  initialData,
  isEditing = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProductFormData>({
    designation: initialData?.name || "",
    user_id: user?.id || 0,
    type_id: 5,
    genre_id: 5,
    quantite: initialData?.quantity || 1,
  });

  // Mettre à jour l'ID utilisateur lorsque l'utilisateur change
  useEffect(() => {
    if (user && user.id) {
      console.log(
        "Mise à jour de l'ID utilisateur dans le formulaire:",
        user.id
      );
      setFormData((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }, [user]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [existingProduct, setExistingProduct] = useState<{
    id: number;
    currentQuantity: number;
    action: string;
  } | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un produit");
      return;
    }

    // S'assurer que l'ID utilisateur est correct
    if (formData.user_id !== user.id) {
      console.log(
        "Correction de l'ID utilisateur:",
        formData.user_id,
        "->",
        user.id
      );
      formData.user_id = user.id;
    }

    try {
      console.log("Envoi des données du formulaire:", formData);
      const response = await axiosInstance.post(
        `http://localhost:3315/api/shopping-list`,
        formData
      );
      if (response.data) {
        console.log("Réponse du serveur:", response.data);
        // Réinitialiser le formulaire
        setFormData({
          designation: "",
          user_id: user.id,
          type_id: 5,
          genre_id: 5,
          quantite: 1,
        });
        toast.success("Produit ajouté avec succès");
        // Appeler le callback pour mettre à jour la liste
        onProductAdded();
      }
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du produit :", error);

      // Vérifier si l'erreur est due à l'existence du produit
      if (error.response && error.response.status === 409) {
        const errorData = error.response.data as ProductExistsResponse;
        console.log("Produit existant détecté:", errorData);
        setExistingProduct({
          id: errorData.productId,
          currentQuantity: errorData.currentQuantity,
          action: errorData.action,
        });
        setIsUpdating(true);
        setNewQuantity(errorData.currentQuantity + formData.quantite);
        toast.info(errorData.error);
      } else {
        toast.error("Erreur lors de l'ajout du produit");
      }
    }
  };

  const handleUpdateQuantity = async () => {
    if (!existingProduct) return;

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast.error("Vous devez être connecté pour mettre à jour un produit");
      return;
    }

    try {
      console.log("Mise à jour de la quantité du produit:", {
        productId: existingProduct.id,
        newQuantity,
        formData,
      });

      // Utiliser la nouvelle route pour mettre à jour la quantité
      const response = await axiosInstance.put(
        `http://localhost:3315/api/modifi/produit/${existingProduct.id}`,
        {
          quantite: newQuantity,
          // Conserver les autres propriétés du produit existant
          designation: formData.designation,
          user_id: user.id,
          type_id: formData.type_id,
          genre_id: formData.genre_id,
        }
      );

      console.log("Réponse de la mise à jour:", response.data);
      toast.success("Quantité mise à jour avec succès");
      setIsUpdating(false);
      setExistingProduct(null);
      onProductAdded();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité :", error);
      toast.error("Erreur lors de la mise à jour de la quantité");
    }
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setExistingProduct(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantite" ? parseInt(value) : value,
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewQuantity(parseInt(e.target.value));
  };

  return (
    <div>
      {!isUpdating ? (
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="designation">Désignation</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type_id">Type</label>
            <select
              id="type_id"
              name="type_id"
              value={formData.type_id}
              onChange={handleChange}
              required
            >
              <option value="5">Frais</option>
              <option value="6">Conserve</option>
              <option value="7">Surgelé</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="genre_id">Genre</label>
            <select
              id="genre_id"
              name="genre_id"
              value={formData.genre_id}
              onChange={handleChange}
              required
            >
              <option value="5">F & L</option>
              <option value="6">NAL</option>
              <option value="7">Viandes</option>
              <option value="8">Produits Laitiers</option>
              <option value="9">Épicerie</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantite">Quantité</label>
            <input
              type="number"
              id="quantite"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button type="submit" className="submit-button">
              {isEditing ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      ) : (
        <div className="update-quantity-form">
          <h3>Produit déjà existant</h3>
          <p>Ce produit existe déjà. Voulez-vous mettre à jour sa quantité ?</p>

          <div className="form-group">
            <label htmlFor="newQuantity">Nouvelle quantité</label>
            <input
              type="number"
              id="newQuantity"
              name="newQuantity"
              value={newQuantity}
              onChange={handleQuantityChange}
              min="1"
              required
            />
          </div>

          <div className="button-group">
            <button
              type="button"
              className="update-button"
              onClick={handleUpdateQuantity}
            >
              Mettre à jour
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancelUpdate}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
