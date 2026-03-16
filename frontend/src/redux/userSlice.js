import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopInMyCity: null,
        itemsInMyCity: null,
        cartItems: [],
        totalAmount: 0,
        myOrders:null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload;
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload;
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload;
        },
        setShopInMyCity: (state, action) => {
            state.shopInMyCity = action.payload;
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload;
        },
        addToCart: (state, action) => {
            const cartItem= action.payload;
            const existingItem= state.cartItems.find(i=>i.id == cartItem.id);
            if(existingItem){
                existingItem.quantity += cartItem.quantity;
            } else {
                state.cartItems.push(cartItem);
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);     
        },
        updateQuantity: (state, action) => {
            const {id, quantity} = action.payload;
            const item=state.cartItems.find(i=>i.id == id);
            if(item){
                item.quantity = quantity;
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);     
        },
        removeCartItem: (state, action) => {
           state.cartItems = state.cartItems.filter(i=>i.id !== action.payload);
           state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);     
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
        },
    },
});

export const { setUserData,setCurrentCity,setCurrentState,setCurrentAddress,setShopInMyCity,setItemsInMyCity,addToCart,updateQuantity,removeCartItem,setMyOrders } = userSlice.actions;
export default userSlice.reducer;