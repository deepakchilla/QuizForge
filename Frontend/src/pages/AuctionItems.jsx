
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  ImagePlus,
  Package,
  X,
} from "lucide-react";

const STORAGE_KEY = "quizforge_auction_items";

function AuctionItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setBasePrice("");
    setImage("");
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !basePrice || Number(basePrice) < 0) {
      alert("Enter a valid item name and base price.");
      return;
    }

    const itemData = {
      id: editingId || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      basePrice: Number(basePrice),
      image,
    };

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? itemData : item
        )
      );
    } else {
      setItems((prev) => [...prev, itemData]);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setBasePrice(String(item.basePrice));
    setImage(item.image || "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this auction item?")) return;

    setItems((prev) => prev.filter((item) => item.id !== id));

    if (editingId === id) resetForm();
  };

  return (
    <main className="auction-items-page">
      <div className="auction-items-container">

        <button
          className="back-link"
          onClick={() => navigate("/auction")}
        >
          <ArrowLeft size={17} />
          Back to Auction Setup
        </button>

        <div className="auction-items-header">
          <div>
            <span className="badge-pill">
              <Package size={14} />
              AUCTION MANAGEMENT
            </span>

            <h1>Manage Auction Items</h1>

            <p>
              Add anything you want to auction. Upload images,
              set base prices and manage your item pool.
            </p>
          </div>

          <div className="auction-item-count">
            <strong>{items.length}</strong>
            <span>Total Items</span>
          </div>
        </div>

        <div className="auction-items-layout">

          <form
            className="studio-card auction-item-form"
            onSubmit={handleSubmit}
          >
            <h2>{editingId ? "Edit Item" : "Add New Item"}</h2>

            <p className="subtitle">
              Enter the details of your auction item.
            </p>

            <div className="form-group">
              <label>Item Image</label>

              <label className="auction-image-upload">
                {image ? (
                  <img src={image} alt="Auction item preview" />
                ) : (
                  <>
                    <ImagePlus size={32} />
                    <strong>Upload Item Image</strong>
                    <span>PNG, JPG or WebP · Maximum 2 MB</span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              {image && (
                <button
                  type="button"
                  className="button button-secondary btn-sm"
                  onClick={() => setImage("")}
                >
                  <X size={14} /> Remove Image
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                className="text-input"
                placeholder="e.g. Premium Gaming Laptop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="text-input auction-description-input"
                placeholder="Enter item details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Base Price (₹) *</label>
              <input
                className="text-input"
                type="number"
                min="0"
                placeholder="Enter base price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
            </div>

            <div className="auction-item-form-actions">
              <button
                type="submit"
                className="button button-primary"
              >
                {editingId ? <Pencil size={17} /> : <Plus size={17} />}
                {editingId ? "Update Item" : "Add Item"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="auction-item-list">
            <div className="section-head">
              <h2>Item Pool</h2>
              <span className="badge-pill">{items.length} Items</span>
            </div>

            {items.length === 0 ? (
              <div className="auction-empty-state">
                <Package size={42} />
                <h3>No items added yet</h3>
                <p>
                  Add your first auction item using the form.
                </p>
              </div>
            ) : (
              <div className="auction-items-grid">
                {items.map((item) => (
                  <article className="auction-item-card" key={item.id}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="auction-item-thumbnail"
                      />
                    ) : (
                      <div className="auction-item-thumbnail auction-no-image">
                        <ImagePlus size={32} />
                      </div>
                    )}

                    <div className="auction-item-card-content">
                      <h3>{item.name}</h3>

                      <p>
                        {item.description || "No description provided."}
                      </p>

                      <strong>
                        Base Price: ₹{item.basePrice.toLocaleString("en-IN")}
                      </strong>

                      <div className="auction-item-card-actions">
                        <button
                          className="button button-secondary btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil size={14} /> Edit
                        </button>

                        <button
                          className="button button-secondary btn-sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default AuctionItems;
