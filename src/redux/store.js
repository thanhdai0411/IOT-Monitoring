import { configureStore } from '@reduxjs/toolkit';
import dataSensorSliceReducer from './reducer/dataSensorSlice';

export const store = configureStore({
    reducer: { dataSensorSliceReducer },
});
