import React from "react";
import { Provider, ReactReduxContext } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./store/productSlice";
import cartReducer from "./store/cartSlice";
import ProductListView from "./components/ProductList";

const mfeStore = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
  },
});

export const RootComponent: React.FC = () => {
  return (
    <ReactReduxContext.Consumer>
      {(contextValue) => {
        // If container passed down a store context, render directly
        if (contextValue) {
          return <ProductListView />;
        }

        // Standalone mode fallback
        return (
          <Provider store={mfeStore}>
            <ProductListView />
          </Provider>
        );
      }}
    </ReactReduxContext.Consumer>
  );
};

export default RootComponent;
