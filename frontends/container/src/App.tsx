import React, { Suspense, useState, useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "productsMfe/productSlice";
import cartReducer, {
  toggleCart,
  removeFromCart,
  updateQuantity,
} from "productsMfe/cartSlice";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

const ProductListRemote = React.lazy(
  async () => await import("productsMfe/ProductList"),
);
const ProductDetailsApp = React.lazy(
  () => import("productDetailsMfe/ProductDetailsApp"),
);

const ProductDetailsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailsApp productId={id} />;
};

const store = configureStore({
  reducer: { products: productReducer, cart: cartReducer },
});

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ShellContent: React.FC = () => {
  const dispatch = useDispatch();
  const { items: cartItems, isOpen } = useSelector(
    (state: any) => state.cart || { items: [], isOpen: false },
  );
  const totalItemCount = cartItems.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0,
  );
  const totalPrice = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );

  // Initialize state directly from localStorage so reloads maintain login
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");

  // Save session to localStorage whenever user/token updates
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegisterMode ? "register" : "login";

    try {
      const res = await fetch(`http://localhost:4001/api/v1/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      setUser(data.user);
      setToken(data.token);
      setIsAuthOpen(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">
            Enterprise E-Commerce Host
          </h1>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
              Home
            </Link>
            <Link
              to="/products"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              Products
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  Hello, <strong>{user.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsRegisterMode(false);
                  setIsAuthOpen(true);
                }}
                className="bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Sign In
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              🛒 Cart
              {totalItemCount > 0 && (
                <span className="bg-amber-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="p-8 text-center text-gray-500">
              Loading Remote Catalog...
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={<h2>Enterprise E-Commerce Host Shell</h2>}
            />
            <Route path="/products" element={<ProductListRemote />} />
            <Route path="/product/:id" element={<ProductDetailsWrapper />} />
          </Routes>
        </Suspense>
      </main>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRegisterMode ? "Create an Account" : "Sign In"}
            </h2>

            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
              >
                {isRegisterMode ? "Register" : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError("");
                }}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                {isRegisterMode
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => dispatch(toggleCart())}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
              <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  Shopping Cart ({totalItemCount})
                </h2>
                <button
                  onClick={() => dispatch(toggleCart())}
                  className="text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    Your cart is empty.
                  </div>
                ) : (
                  cartItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-4"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                }),
                              )
                            }
                            className="px-2 py-1 bg-gray-200 rounded text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                }),
                              )
                            }
                            className="px-2 py-1 bg-gray-200 rounded text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-xs text-rose-600 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between text-base font-bold text-gray-900 mb-4">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  disabled={cartItems.length === 0}
                  className="w-full py-3 bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <Provider store={store}>
      <ShellContent />
    </Provider>
  </BrowserRouter>
);

export default App;
