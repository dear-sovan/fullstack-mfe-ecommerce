
declare module 'productsMfe/productSlice' {
  import { Reducer } from '@reduxjs/toolkit';
  const productReducer: Reducer;
  export default productReducer;
}

declare module 'productsMfe/cartSlice' {
  import { Reducer } from '@reduxjs/toolkit';
  const cartReducer: Reducer;
  export const addToCart: any;
  export const toggleCart: any;
  export const removeFromCart: any;
  export const updateQuantity: any;
  export default cartReducer;
}
