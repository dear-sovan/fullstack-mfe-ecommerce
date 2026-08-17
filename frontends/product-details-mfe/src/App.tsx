import React, { useEffect, useState } from "react";
import {
  Provider,
  ReactReduxContext,
  useDispatch,
  useSelector,
} from "react-redux";

// Import cart/product actions and reducers directly from the remote productsMfe
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
} from "productsMfe/cartSlice";
import productReducer from "productsMfe/productSlice";
import { configureStore } from "@reduxjs/toolkit";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  inStock?: boolean;
  stock?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface RootState {
  cart?: {
    items: CartItem[];
  };
}

interface ProductDetailsProps {
  productId?: string;
  onBack?: () => void;
  apiBaseUrl?: string;
}

// Singleton store instance for standalone fallback
const sharedStandaloneStore = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
  },
});

const ProductDetailsContent: React.FC<ProductDetailsProps> = ({
  productId,
  onBack,
  apiBaseUrl = "http://localhost:4001",
}) => {
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Safely select from the shared cart state with proper typing
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  const id = productId || window.location.pathname.split("/").pop();

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${apiBaseUrl}/api/v1/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data.data || data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load product details");
        setLoading(false);
      });
  }, [id, apiBaseUrl]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading Product Details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: "2rem", color: "#dc2626" }}>
        <h3>Error Loading Product</h3>
        <p>{error || "Product unavailable"}</p>
        <button
          onClick={onBack || (() => window.history.back())}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const rawPrice = Number(product?.price);
  const formattedPrice = !isNaN(rawPrice) ? rawPrice.toFixed(2) : "0.00";

  const isInStock =
    product?.inStock !== undefined
      ? Boolean(product.inStock)
      : Number(product?.stock) > 0;

  const matchingCartItem = cartItems.find((item) => item?.id === product?.id);

  const handleUpdateCart = (sign: "i" | "d") => {
    if (!matchingCartItem) return;
    const quantity =
      sign === "d"
        ? matchingCartItem.quantity - 1
        : matchingCartItem.quantity + 1;
    if (quantity > 0) {
      dispatch(updateQuantity({ id: product.id, quantity }));
    } else {
      dispatch(removeFromCart(product.id));
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <button
        onClick={onBack || (() => window.history.back())}
        style={{
          marginBottom: "1rem",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          background: "#fff",
        }}
      >
        ← Back
      </button>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "2rem",
          backgroundColor: "#fff",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {product.category || "General"}
          </span>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "bold",
              backgroundColor: isInStock ? "#d1fae5" : "#ffe4e6",
              color: isInStock ? "#065f46" : "#9f1239",
            }}
          >
            {isInStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        <h1 style={{ margin: "0.75rem 0", fontSize: "2rem", color: "#111827" }}>
          {product.name}
        </h1>
        <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#2563eb" }}>
          ${formattedPrice}
        </p>

        <p style={{ marginTop: "1.5rem", lineHeight: "1.6", color: "#374151" }}>
          {product.description ||
            "No detailed description available for this item."}
        </p>

        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {matchingCartItem?.id ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <button
                onClick={() => handleUpdateCart("d")}
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                -
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                {matchingCartItem.quantity}
              </span>
              <button
                onClick={() => handleUpdateCart("i")}
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                +
              </button>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#059669",
                  fontWeight: 600,
                  marginLeft: "0.5rem",
                }}
              >
                ✓ Added to Cart
              </span>
            </div>
          ) : (
            <button
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: isInStock ? "#4f46e5" : "#d1d5db",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: isInStock ? "pointer" : "not-allowed",
              }}
              disabled={!isInStock}
              onClick={() => dispatch(addToCart(product))}
            >
              {isInStock ? "Add to Cart" : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const App: React.FC<ProductDetailsProps> = (props) => {
  return (
    <ReactReduxContext.Consumer>
      {(contextValue) => {
        if (contextValue) {
          return <ProductDetailsContent {...props} />;
        }
        return (
          <Provider store={sharedStandaloneStore}>
            <ProductDetailsContent {...props} />
          </Provider>
        );
      }}
    </ReactReduxContext.Consumer>
  );
};

export default App;
