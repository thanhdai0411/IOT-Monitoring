import { useEffect } from 'react';
import MapD from '../../components/MapD';
import Toast from '../../utils/toasts';

function MyMap() {
    const deviceUser = localStorage.getItem('device_user');
    const listDevice = JSON.parse(deviceUser);
    useEffect(() => {
        Toast('success', 'Nhấp vào vị trí trạm để xem thêm thông tin');
    }, []);
    const dataCoordinates = [];
    if (listDevice) {
        const id = Object.keys(listDevice);
        id.map((v) => {
            if (listDevice[v]['latitude'] && listDevice[v]['longitude'])
                dataCoordinates.push({
                    name: listDevice[v]['FullName'],
                    latitude: listDevice[v]['latitude'],
                    longitude: listDevice[v]['longitude'],
                });
        });
    }

    return <MapD data={dataCoordinates} />;
}
export default MyMap;
