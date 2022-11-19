import moment from 'moment';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardValueSensor from '../../components/CardValueSensor';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import MapD from '../../components/MapD';
import MainChart from '../../components/MyChart/MainChart';

import { getDatabase, onValue, ref } from 'firebase/database';

import MySelect from '../../components/MySelect';
import SubHeader from '../../components/SubHeader';
import './Home.scss';

import { Skeleton } from '@mui/material';
import compareDate from '../../utils/compare_date';
import { getUniqueListBy } from '../../utils/function';

import { getSensorName } from '../../redux/reducer/dataSensorSlice';

import AsyncLocalStorage from '../../utils/async_localstorage';

import { useNavigate } from 'react-router-dom';

// const MainChart = lazy(() => import('../../components/MyChart/MainChart'));
// const MapD = lazy(() => import('../../components/MapD'));

const TIME_DEVICE_OFF = 30;

function Home() {
    const [dataChange, setDataChange] = useState(false);
    const [valueSelect, setValueSelect] = useState('');

    const [endDate, setEndDate] = useState(moment(new Date()).format('HH:mm MM/DD/YYYY'));
    const [startDate, setStartDate] = useState(
        moment(new Date()).subtract(2, 'h').format('HH:mm MM/DD/YYYY')
    );

    const [inputValue, setInputValue] = useState('');
    console.log({ inputValue });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // handle data chart
    const db = getDatabase();
    const dataRealTime = useRef([]);

    const deviceUser = localStorage.getItem('device_user');
    let listDevice;
    if (deviceUser !== 'undefined') {
        listDevice = JSON.parse(deviceUser);
    } else {
        navigate('/nothing');
    }

    let devices = [];
    useEffect(() => {
        if (listDevice) {
            const id = Object.keys(listDevice);
            id.map((v) => {
                devices.push({
                    id: v,
                    label: listDevice[v]['FullName'],
                });
            });
        }
        setMenuSelect(devices);
    }, []);
    const [menuValue, setMenuSelect] = useState(devices[0]);

    useEffect(() => {
        AsyncLocalStorage.getItem('home_station').then((station) => {
            if (station) {
                setValueSelect(JSON.parse(station));
            }
        });
    }, []);

    // get data from firebase
    useEffect(() => {
        if (valueSelect)
            return onValue(ref(db, `Devices/DAIVIET-RS485/${valueSelect.id}`), (snapshot) => {
                // console.log(snapshot.val());
                let { RS485Data, Location, LastTime } = snapshot.val();
                // console.log(snapshot.val());
                let lastTime = moment(LastTime.slice(0, -1)).format('HH:mm DD/MM/YYYY');
                let timeC = moment(LastTime.slice(0, -1)).format('HH:mm');
                let timeP = moment(Date()).subtract(TIME_DEVICE_OFF, 'minutes').format('HH:mm');

                let dateC = moment(LastTime.slice(0, -1)).format('MM/DD/YYYY');
                let dateP = moment(Date()).format('MM/DD/YYYY');

                let compare = compareDate(dateC, dateP);

                let s = [];
                RS485Data.map((v) => {
                    s.push(v.Name);
                });
                // AsyncLocalStorage.setItem('sensor', s);
                // dispatch(getSensorName(s));

                dataRealTime.current = [
                    {
                        id_station: valueSelect.id,
                        data_sensor: RS485Data,
                        location: Location,
                        last_time: lastTime,
                        full_name: listDevice[valueSelect.id]['FullName'],
                        status_station:
                            timeC < timeP || compare === 1 ? `OFF*${'NOOK'}` : `ON*${'0'}`,
                    },
                ];

                setDataChange({
                    last_time: LastTime,
                });
            });
    }, [valueSelect]);

    // handle data get from firebase
    let arr = useRef();
    let dataSensor = [];

    if (dataChange) {
        arr.current = getUniqueListBy(dataRealTime.current, 'location');
        dataSensor = arr.current.map((v, index) => {
            let s = v.status_station.split('*')[1];
            let c = v.data_sensor.map((v2) => {
                // console.log(s);
                let b;
                if (s === 'NOOK') {
                    b = `${v2.Value}*${v2.StateNum}*STATION_OFF`;
                } else {
                    b = `${v2.Value}*${v2.StateNum}`;
                }
                let a = v2.Name;
                let obj = { sensor: a, value: b, unit: v2.Unit };
                return obj;
            });

            return c;
        });
    }

    // add value for field input
    const dataCoordinates = [];
    if (listDevice && valueSelect) {
        if (listDevice[valueSelect.id]['latitude'] && listDevice[valueSelect.id]['longitude'])
            dataCoordinates.push({
                name: listDevice[valueSelect.id]['FullName'],
                latitude: listDevice[valueSelect.id]['latitude'],
                longitude: listDevice[valueSelect.id]['longitude'],
            });
    }

    // handle onchange select station

    const handleOnChangeSelectStation = (e, v) => {
        console.log(v);
        if (v !== null) {
            AsyncLocalStorage.setItem('home_station', JSON.stringify(v)).then(() => {
                setValueSelect(v);
            });
        }
    };

    //style for card
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

    // console.log({ valueSelect });
    return (
        <>
            <div className="home_page">
                {menuValue ? (
                    <>
                        <SubHeader
                            text={
                                valueSelect
                                    ? `BẢNG GIÁM SÁT DỮ LIỆU ${valueSelect.label}`
                                    : 'BẠN HÃY CHỌN TRẠM ĐỂ GIÁM SÁT'
                            }
                        />
                        <div
                            style={{
                                border: '1.5px solid #ccc',
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: 'white',
                                fontWeight: '600',
                                borderRadius: '3px',
                            }}>
                            <Grid
                                container
                                spacing={2}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {/* <Grid item xs={3}>
                                    <MySelect
                                        label="Chọn trạm giám sát"
                                        menuValue={menuValue}
                                        value={valueSelect}
                                        onChange={handleOnChangeSelectStation}
                                    />
                                </Grid> */}
                                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                    <Autocomplete
                                        id="controllable-states-demo"
                                        size="small"
                                        color="success"
                                        onChange={handleOnChangeSelectStation}
                                        options={menuValue}
                                        value={valueSelect.label}
                                        inputValue={inputValue}
                                        onInputChange={(event, newInputValue) => {
                                            setInputValue(newInputValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Chọn trạm giám sát" />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </div>
                        <Box sx={{ flexGrow: 1 }}>
                            <div style={{ margin: '10px 0' }}>
                                <Grid container spacing={2}>
                                    {/* <Grid item xs={4}>
                            <Item>xs=4</Item>
                        </Grid> */}
                                    <Grid item xs={12}>
                                        {/* <Item>xs=8</Item> */}
                                        <Grid container spacing={1.5}>
                                            {dataSensor && dataSensor.length > 0 ? (
                                                dataSensor[0].map((v, index) => {
                                                    return (
                                                        <Grid
                                                            key={index}
                                                            item
                                                            xl={3}
                                                            lg={4}
                                                            md={6}
                                                            sm={12}
                                                            xs={12}>
                                                            <CardValueSensor
                                                                label={v.sensor}
                                                                value={v.value.split('*')[0]}
                                                                unit={` ${' '} ${v.unit}`}
                                                                state={styleForCard(v.value)}
                                                                fillColor={'#C3F8FF'}
                                                            />
                                                        </Grid>
                                                    );
                                                })
                                            ) : (
                                                <>
                                                    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rounded"
                                                            height={170}></Skeleton>
                                                    </Grid>
                                                    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rounded"
                                                            height={170}></Skeleton>
                                                    </Grid>
                                                    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rounded"
                                                            height={170}></Skeleton>
                                                    </Grid>
                                                    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rounded"
                                                            height={170}></Skeleton>
                                                    </Grid>
                                                    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rounded"
                                                            height={170}></Skeleton>
                                                    </Grid>
                                                    <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                                                        <Skeleton
                                                            animation="wave"
                                                            variant="rounded"
                                                            height={170}></Skeleton>
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </div>
                            <div style={{ margin: '10px 0' }}>
                                <Grid container spacing={1.5}>
                                    <Grid item xl={5} lg={5} md={12} sm={12} xs={12}>
                                        {valueSelect ? (
                                            <div className="home_map">
                                                <MapD
                                                    height="500px"
                                                    data={dataCoordinates}
                                                    showTabState={false}
                                                    showBtnAll={false}
                                                    longitudeDefault={
                                                        listDevice[valueSelect.id]['longitude']
                                                    }
                                                    latitudeDefault={
                                                        listDevice[valueSelect.id]['latitude']
                                                    }
                                                    showMarkerInfo={true}
                                                />
                                            </div>
                                        ) : (
                                            <Skeleton
                                                animation="wave"
                                                variant="rounded"
                                                height={500}></Skeleton>
                                        )}
                                    </Grid>

                                    <Grid item xl={7} lg={7} md={12} sm={12} xs={12}>
                                        <Grid container spacing={1}>
                                            {valueSelect ? (
                                                <Grid
                                                    item
                                                    xl={12}
                                                    lg={12}
                                                    md={12}
                                                    sm={12}
                                                    xs={12}
                                                    style={{}}>
                                                    <div className="home_chart">
                                                        <MainChart
                                                            endDate={endDate}
                                                            startDate={startDate}
                                                            deviceUser={valueSelect.id}
                                                        />
                                                    </div>
                                                </Grid>
                                            ) : (
                                                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                    <Skeleton
                                                        animation="wave"
                                                        variant="rounded"
                                                        height={500}></Skeleton>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </div>
                        </Box>
                    </>
                ) : (
                    <p>Loading</p>
                )}
            </div>
        </>
    );
}

export default Home;

{
    /* <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={4}>
                                                            <MyDateRange
                                                                label={'Bắt đầu'}
                                                                onChange={handleChangeStartDate}
                                                                value={startDate}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <MyDateRange
                                                                label={'Kết thúc'}
                                                                onChange={handleChangeEndDate}
                                                                value={endDate}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <MyButton
                                                                icon={null}
                                                                name={'Áp dụng'}
                                                                onClick={handleApplyDate}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid> */
}
