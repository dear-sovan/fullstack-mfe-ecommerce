import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface ProductState {
  items: Product[];
  filteredItems: Product[];
  searchTerm: string;
  selectedCategory: string;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  filteredItems: [],
  searchTerm: '',
  selectedCategory: 'All',
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await fetch('http://localhost:4001/api/v1/products');
  if (!response.ok) {
    throw new Error('Failed to fetch product catalog');
  }
  const json = await response.json();
  return json.data as Product[];
});

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredItems = filterHelper(state.items, state.searchTerm, state.selectedCategory);
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = filterHelper(state.items, state.searchTerm, state.selectedCategory);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.filteredItems = filterHelper(action.payload, state.searchTerm, state.selectedCategory);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading products';
      });
  },
});

function filterHelper(items: Product[], search: string, category: string): Product[] {
  return items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });
}

export const { setSearchTerm, setSelectedCategory } = productSlice.actions;
export default productSlice.reducer;
