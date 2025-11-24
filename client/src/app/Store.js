import {configureStore}  from '@reduxjs/toolkit';
import apiSlice from './ApiSlice';
import authSliceReducer from '../features/auth/authSlice';
import childManagementSliceReducer from '../features/admin/ChildManagement/ChildManagmentSlice';

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSliceReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
});

export default store;
