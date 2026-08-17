import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  setSearchTerm,
  setSelectedCategory,
  Product,
} from "../store/productSlice";
import cartReducer, {
  toggleCart,
  removeFromCart,
  updateQuantity,
  addToCart,
} from "../store/cartSlice";

export const ProductList: React.FC = () => {
  const dispatch = useDispatch<any>();
  const {
    filteredItems = [],
    searchTerm = "",
    selectedCategory = "All",
    items = [],
    loading = false,
    error = null,
  } = useSelector((state: any) => state.products || {});

  const { items: cartItems } = useSelector(
    (state: any) => state.cart || { items: [], isOpen: false },
  );

  // const [cartItemIds, setCartItemIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const updateCart = (id: string, sign: string) => {
    const item = cartItems.filter((i: any) => i.id === id);
    const quantity =
      sign === "d" ? item[0]?.quantity - 1 : item[0]?.quantity + 1;
    if (quantity > 0) {
      dispatch(
        updateQuantity({
          id: id,
          quantity,
        }),
      );
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const safeFilteredItems = Array.isArray(filteredItems) ? filteredItems : [];

  const categories = [
    "All",
    ...Array.from(
      new Set(safeItems.map((i: Product) => i?.category).filter(Boolean)),
    ),
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Loading catalog...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md m-6">{error}</div>
    );
  }

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "1.5rem",
      }}
    >
      {/* Search & Filter Controls */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-gray-200"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h2
            className="text-2xl font-bold text-gray-900 tracking-tight"
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}
          >
            Featured Products
          </h2>
          <p
            className="text-sm text-gray-500 mt-1"
            style={{ fontSize: "0.875rem", color: "#6b7280" }}
          >
            Explore gear and add items to your cart
          </p>
        </div>

        <div
          className="flex flex-row items-center gap-3"
          style={{ display: "flex", gap: "0.75rem" }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              width: "220px",
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              backgroundColor: "#ffffff",
            }}
          >
            {categories.map((cat: any) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {safeFilteredItems.length === 0 ? (
        <div
          className="text-center py-12 text-gray-500"
          style={{ textAlign: "center", padding: "3rem 0", color: "#6b7280" }}
        >
          No products found matching filters.
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            width: "100%",
          }}
        >
          {safeFilteredItems.map((product: Product) => {
            const rawPrice = Number(product?.price);
            const formattedPrice = !isNaN(rawPrice)
              ? rawPrice.toFixed(2)
              : "0.00";

            // FIX: Check both 'inStock' boolean and 'stock' number (since API sends stock: 15)
            // Replace line 182 with this:
            const isInStock =
              product?.inStock !== undefined
                ? Boolean(product.inStock)
                : Number((product as any)?.stock) > 0;

            // Find the matching cart item for the current product
            const matchingCartItem = (cartItems || []).find(
              (item: any) => item?.id === product?.id,
            );

            return (
              <article
                key={product?.id || Math.random()}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
                style={{
                  flex: "1 1 calc(33.333% - 24px)",
                  minWidth: "280px",
                  maxWidth: "calc(33.333% - 16px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "#ffffff",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {/* 1. Status Bar */}
                <div
                  className="px-4 py-2 bg-slate-50 border-b border-gray-100 flex items-center justify-between"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    className="text-xs font-semibold tracking-wider text-indigo-600 uppercase"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#4f46e5",
                      textTransform: "uppercase",
                    }}
                  >
                    {product?.category || "General"}
                  </span>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isInStock
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                    style={{
                      padding: "0.125rem 0.625rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      backgroundColor: isInStock ? "#d1fae5" : "#ffe4e6",
                      color: isInStock ? "#065f46" : "#9f1239",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        marginRight: "6px",
                        backgroundColor: isInStock ? "#10b981" : "#f43f5e",
                      }}
                    />
                    {isInStock ? "In Stock" : "Sold Out"}
                  </span>
                </div>

                {/* 2. Image Area */}
                <div
                  className="w-full h-44 bg-slate-100 flex items-center justify-center p-4"
                  style={{
                    width: "100%",
                    height: "176px",
                    backgroundColor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="56"
                    height="56"
                    style={{ color: "#cbd5e1" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>

                {/* 3. Details & Price Section */}
                <div
                  className="p-6 flex-1 flex flex-col justify-between"
                  style={{
                    padding: "1.5rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3
                      onClick={() => {
                        // Navigates cleanly within the host container shell without breaking router context
                        window.history.pushState(
                          {},
                          "",
                          `/product/${product.id}`,
                        );
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                      className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors"
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {product?.name || "Unnamed Product"}
                    </h3>
                  </div>

                  <div
                    className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-2"
                    style={{
                      paddingTop: "1.5rem",
                      marginTop: "1.5rem",
                      borderTop: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span
                        className="text-xs text-gray-400 block"
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          display: "block",
                        }}
                      >
                        Price
                      </span>
                      <span
                        className="text-2xl font-extrabold text-gray-900"
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        ${formattedPrice}
                      </span>
                    </div>

                    {matchingCartItem?.id ? (
                      <div
                        className="flex items-center gap-2"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          onClick={() => updateCart(product.id, "d")}
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "#e5e7eb",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{ fontSize: "0.875rem", fontWeight: "bold" }}
                        >
                          {matchingCartItem?.quantity}
                        </span>
                        <button
                          onClick={() => updateCart(product.id, "i")}
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "#e5e7eb",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => dispatch(addToCart(product))}
                        disabled={!isInStock}
                        style={{
                          padding: "0.625rem 1rem",
                          borderRadius: "0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#ffffff",
                          backgroundColor: isInStock ? "#4f46e5" : "#d1d5db",
                          border: "none",
                          cursor: isInStock ? "pointer" : "not-allowed",
                        }}
                      >
                        {isInStock ? "Add to Cart" : "Unavailable"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProductList;
