import * as React from 'react';
import { Marker } from '@goongmaps/goong-map-react';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SIZE = 20;

// Important for perf: the markers never change, avoid rerender when the map viewport changes
function Pins({ data, onClick }) {
    return data.map((city, index) => {
        const { state } = city;
        let styleMark =
            state === 'ERROR'
                ? 'red'
                : state === 'NORMAL'
                ? '#11cc67'
                : state === 'CALIB'
                ? 'orange'
                : state === 'OFF'
                ? 'gray'
                : 'red';
        if (city.longitude && city.latitude) {
            console.log({ long: city.longitude, lat: city.latitude, name: city.name });
            return (
                <Marker key={`marker-${index}`} longitude={city.longitude} latitude={city.latitude}>
                    <LocationOnIcon
                        onClick={() => onClick(city)}
                        style={{
                            cursor: 'pointer',
                            fill: styleMark,
                            stroke: 'none',
                            transform: `translate(${-SIZE / 2}px,${-SIZE}px)`,
                        }}
                    />
                </Marker>
            );
        }
    });
}

export default React.memo(Pins);
