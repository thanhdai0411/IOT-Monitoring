/* global document */
import MapGL, {
    FlyToInterpolator,
    FullscreenControl,
    Marker,
    NavigationControl,
    Popup,
} from '@goongmaps/goong-map-react';
import { easeCubic } from 'd3-ease';
import { useCallback } from 'react';
import { memo, useMemo, useState } from 'react';
import Pins from './Pins';
import StationInfo from './StationInfo';
import map_style from '../../utils/map_style.json';

import ControlPanelMap from '../ControlPanelMap';
import TabStateStation from '../TabStateStation';

const GOONG_MAPTILES_KEY = process.env.REACT_APP_GOONG_MAPTILES_KEY;

const navControlStyle = {
    right: 10,
    top: 45,
};
const fullscreenControlStyle = {
    right: 10,
    top: 10,
};

function MapD({
    height = '100vh',
    data = [
        {
            name: 'Ho Chi Minh',
            latitude: 10.8231,
            longitude: 106.6297,
        },
        {
            name: 'Ha Noi',
            latitude: 21.0278,
            longitude: 105.8342,
        },
        {
            name: 'Da Nang',
            latitude: 16.0545,
            longitude: 108.0717,
        },
    ],
    latitudeDefault = 10.5231,
    longitudeDefault = 105.6297,
    zoomDefault = 6,
    showMarkerInfo = false,
    showTabState = true,
    showBtnAll = true,
}) {
    const [viewport, setViewport] = useState({
        latitude: latitudeDefault,
        longitude: longitudeDefault,
        zoom: zoomDefault,
        transitionDuration: 'auto',
        transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
    });

    const onSelectCity = useCallback((longitude, latitude) => {
        if (longitude && latitude)
            setViewport({
                longitude,
                latitude,
                zoom: 15,
                transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
                transitionDuration: 'auto',
            });
    }, []);

    const [popupInfo, setPopupInfo] = useState(null);
    return (
        <MapGL
            {...viewport}
            width="100%"
            height={height}
            mapStyle={map_style}
            onViewportChange={setViewport}
            showCompass={true}
            goongApiAccessToken={GOONG_MAPTILES_KEY}>
            {showTabState && <TabStateStation top="2%" left="2%" />}
            {showBtnAll && <ControlPanelMap data={data} onSelectCity={onSelectCity} />}

            <Pins data={data} onClick={setPopupInfo} showMarkerInfo={showMarkerInfo} />

            {showMarkerInfo ? (
                <Popup
                    tipSize={10}
                    anchor="top"
                    longitude={longitudeDefault}
                    latitude={latitudeDefault}>
                    <StationInfo info={data} showMarkerInfo={showMarkerInfo} />
                </Popup>
            ) : (
                popupInfo && (
                    <Popup
                        tipSize={5}
                        anchor="top"
                        longitude={popupInfo.longitude}
                        latitude={popupInfo.latitude}
                        closeOnClick={true}
                        closeButton={true}
                        onClose={setPopupInfo}>
                        <StationInfo info={popupInfo} showMarkerInfo={showMarkerInfo} />
                    </Popup>
                )
            )}

            <NavigationControl style={navControlStyle} />
            <FullscreenControl style={fullscreenControlStyle} />
        </MapGL>
    );
}
export default memo(MapD);
