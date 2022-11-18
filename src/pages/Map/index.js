import { child, get, getDatabase, onValue, ref } from 'firebase/database';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import MapD from '../../components/MapD';
import compareDate from '../../utils/compare_date';
import { getUniqueListBy } from '../../utils/function';
import Toast from '../../utils/toasts';
import ControlPanelMap from '../../components/ControlPanelMap';

import Loading from '../../components/Loading';

const TIME_DEVICE_OFF = 30;

function MyMap() {
    const dataRealTime = useRef([]);
    const [dataChange, setDataChange] = useState(false);

    const deviceUser = localStorage.getItem('device_user');
    const listDevice = JSON.parse(deviceUser);

    const db = ref(getDatabase());

    let devices = [];

    if (listDevice) {
        const id = Object.keys(listDevice);
        id.forEach((v) => {
            devices.push({
                id: v,
                full_name: listDevice[v]['FullName'],
            });
        });
    }

    // get data
    useEffect(() => {
        devices.map((v) => {
            get(child(db, `Devices/DAIVIET-RS485/${v.id}`)).then((snapshot) => {
                let { RS485Data, Location, LastTime } = snapshot.val();
                let lastTime = moment(LastTime.slice(0, -1)).format('HH:mm DD/MM/YYYY');
                let timeC = moment(LastTime.slice(0, -1)).format('HH:mm');
                let timeP = moment(Date()).subtract(TIME_DEVICE_OFF, 'minutes').format('HH:mm');

                let dateC = moment(LastTime.slice(0, -1)).format('MM/DD/YYYY');
                let dateP = moment(Date()).format('MM/DD/YYYY');

                let compare = compareDate(dateC, dateP);

                dataRealTime.current.push({
                    id_station: v.id,
                    data_sensor: RS485Data,
                    location: Location,
                    last_time: lastTime,
                    full_name: v.full_name,
                    status_station: timeC < timeP || compare === 1 ? `OFF*${'NOOK'}` : `ON*${'0'}`,
                });
                setDataChange({
                    last_time: LastTime,
                });
            });
        });
    }, []);

    //==============================================================================

    // handle data get
    let arr = useRef();
    let stateDevice = useRef();
    let rows;
    // get(child(db, `Devices/DAIVIET-RS485/${stationId}`));
    let dataSensor = [];

    if (dataChange) {
        arr.current = getUniqueListBy(dataRealTime.current, 'location');
        let data = [];
        arr.current.map((v, index) => {
            let s = v.status_station.split('*')[1];
            let c = v.data_sensor.forEach((v2) => {
                // console.log(s);
                let stateStation = v2.StateNum;

                let b = '';
                let a = v2.Name;

                if (s === 'NOOK') {
                    // b = 'STATION_OFF';
                    // b = {
                    //     status: 'OFF',
                    //     sensor: a,
                    // };
                    b = `OFF`;
                } else {
                    if (stateStation == 0) {
                        // b = {
                        //     status: 'NORMAL',
                        //     sensor: a,
                        // };
                        b = `NORMAL`;
                    } else if (stateStation == 1) {
                        // b = {
                        //     status: 'CALIB',
                        //     sensor: a,
                        // };
                        b = `CALIB`;
                    } else if (stateStation == 2) {
                        // b = {
                        //     status: 'ERROR',
                        //     sensor: a,
                        // };
                        b = `ERROR`;
                    }
                }
                // console.log({ b, a });
                let obj = { state: b, full_name: v.full_name, id: v.id_station };
                // console.log({ obj });
                // return obj;
                dataSensor.push(obj);
                // return obj;
            });
            // console.log({ c });
            // console.log({ data });
            // return c;
        });
    }

    //==============================================================================

    let output = [];
    if (dataSensor.length) {
        const handleObjectSameKeyInArr = (arr) => {
            console.log({ arr });
            arr.forEach(function (item) {
                var existing = output.filter(function (v, i) {
                    return v.full_name == item.full_name;
                });

                if (existing.length) {
                    var existingIndex = output.indexOf(existing[0]);
                    output[existingIndex].state = output[existingIndex].state.concat(item.state);
                } else {
                    let arr = [];
                    // let b = arr.push(item.state);
                    if (typeof item.state == 'string') {
                        item.state = [item.state];
                    }
                    output.push(item);
                }
            });
        };

        handleObjectSameKeyInArr(dataSensor);
    }
    // console.log({ output });
    // console.log({ dataSensor });
    let dataCoordinates = [];
    if (output.length) {
        output.map((v) => {
            let error = v.state.includes('ERROR');
            let calib = v.state.includes('CALIB');
            let normal = v.state.includes('NORMAL');
            let off = v.state.includes('STATION_OFF');
            let state = error ? 'ERROR' : calib ? 'CALIB' : normal ? 'NORMAL' : 'OFF';
            dataCoordinates.push({
                state: state,
                name: v.full_name,
                latitude: listDevice[v.id]['latitude'],
                longitude: listDevice[v.id]['longitude'],
            });
        });
    }
    // console.log({ dataCoordinates });

    const styleForCard = (value) => {
        let stateSensor = value.split('*')[1];
        let statusStation = value.split('*')[2];

        if (statusStation === 'STATION_OFF') {
            return 'off';
        } else if (stateSensor === '1') {
            return 'calib';
        } else if (stateSensor === '2') {
            return 'error';
        } else if (stateSensor === '0') {
            return 'normal';
        } else {
            return 'off';
        }
    };

    useEffect(() => {
        Toast('success', 'Nhấp vào vị trí trạm để xem thêm thông tin');
    }, []);

    return (
        <div>
            {dataCoordinates.length ? (
                <div>
                    <MapD data={dataCoordinates} />
                    {/* <ControlPanelMap data={dataCoordinates} /> */}
                    {/* <div style={{ position: 'absolute', left: '7%', top: '13%', display: 'flex' }}>
                        <div style={{ marginRight: '5px' }}>
                            <div
                                style={{
                                    // width: '50px',
                                    height: '10px',
                                    backgroundColor: '#11cc67',
                                }}></div>
                            <p style={{ fontSize: '10px' }}>Hoạt động tốt</p>
                        </div>
                        <div style={{ marginRight: '5px' }}>
                            <div
                                style={{
                                    // width: '50px',
                                    height: '10px',
                                    backgroundColor: 'red',
                                }}></div>
                            <p style={{ fontSize: '10px' }}>Cảm biến lỗi</p>
                        </div>
                        <div style={{ marginRight: '5px' }}>
                            <div
                                style={{
                                    // width: '50px',
                                    height: '10px',
                                    backgroundColor: 'orange',
                                }}></div>
                            <p style={{ fontSize: '10px' }}>Cảm biến calib</p>
                        </div>
                        <div style={{ marginRight: '5px' }}>
                            <div
                                style={{
                                    // width: '50px',
                                    height: '10px',
                                    backgroundColor: 'gray',
                                }}></div>
                            <p style={{ fontSize: '10px' }}>Không hoạt động</p>
                        </div>
                    </div> */}
                </div>
            ) : (
                // <p style={{ textAlign: 'center', marginTop: '50px' }}>Vui lòng chờ ...</p>
                <Loading />
            )}
        </div>
    );
}
export default MyMap;
