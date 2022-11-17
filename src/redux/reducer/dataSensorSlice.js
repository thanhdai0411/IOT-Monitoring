import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data_sensor: [],
    sensor_name: [],
};

export const dataSensorSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        dataSensorRealTime: (state, action) => {
            // console.log({ state, action: action.payload });
            state.data_sensor = action.payload;
        },
        getSensorName: (state, action) => {
            console.log({ action: action.payload });
            state.sensor_name = action.payload;
        },
    },
});

//action
export const { dataSensorRealTime, getSensorName } = dataSensorSlice.actions;

//reducer
const dataSensorSliceReducer = dataSensorSlice.reducer;

//selector
export const dataSensorSelector = (state) => state.dataSensorSliceReducer.data_sensor;
export const sensorNameSelector = (state) => state.dataSensorSliceReducer.sensor_name;

export default dataSensorSliceReducer;
