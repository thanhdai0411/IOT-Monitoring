import React from 'react';
import SensorsIcon from '@mui/icons-material/Sensors';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import './CardValueSensor.scss';
import MyChart from '../MyChart/SubChart';

export default function CardValueSensor({ label, value, unit, state, fillColor = '#0E5E6F' }) {
    return (
        <div className={`sensor_item sensor_state-${state}`}>
            <div className="sensor_item-wrap">
                <div>
                    <div className="sensor_item-name">{label}</div>
                    <div className="sensor_item-value">
                        {value} {unit}
                    </div>
                </div>
                <div>
                    {state === 'off' ? (
                        <SensorsOffIcon sx={{ fontSize: 60 }} />
                    ) : (
                        <SensorsIcon sx={{ fontSize: 60 }} />
                    )}
                </div>
            </div>
            <div className="sensor_item-chart">
                <MyChart color={'white'} fill={fillColor} />
            </div>
        </div>
    );
}
