import * as React from 'react';
import { Marker } from '@goongmaps/goong-map-react';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SIZE = 20;

// Important for perf: the markers never change, avoid rerender when the map viewport changes
function Pins({ data, onClick }) {
    return data.map((city, index) => (
        <Marker key={`marker-${index}`} longitude={city.longitude} latitude={city.latitude}>
            <LocationOnIcon
                onClick={() => onClick(city)}
                style={{
                    color: 'red',
                    cursor: 'pointer',
                    fill: '#d00',
                    stroke: 'none',
                    transform: `translate(${-SIZE / 2}px,${-SIZE}px)`,
                }}
            />
        </Marker>
    ));
}

export default React.memo(Pins);
