import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './store/productSlice';
import cartReducer from './store/cartSlice';
import ProductList from './components/ProductList';

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
  },
});

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-slate-800 text-white p-4 shadow-sm">
          <h1 className="text-lg font-semibold">Product MFE (Standalone Dev Mode)</h1>
        </header>
        <ProductList />
      </div>
    </Provider>
  );
};

export default App;
