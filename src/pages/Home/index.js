import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardValueSensor from '../../components/CardValueSensor';
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

const TIME_DEVICE_OFF = 30;

function Home() {
    const [dataChange, setDataChange] = useState(false);
    const [menuValue, setMenuSelect] = useState([]);
    const [valueSelect, setValueSelect] = useState('');

    const [endDate, setEndDate] = useState(moment(new Date()).format('HH:mm MM/DD/YYYY'));
    const [startDate, setStartDate] = useState(moment(new Date()).format('00:00 MM/DD/YYYY'));

    const [endDateTemp, setEndDateTemp] = useState(moment(new Date()).format('HH:mm MM/DD/YYYY'));
    const [startDateTemp, setStartDateTemp] = useState(
        moment(new Date()).subtract(1, 'days').format('7:00 MM/DD/YYYY')
    );
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // handle data chart
    const db = getDatabase();
    const dataRealTime = useRef([]);

    const deviceUser = localStorage.getItem('device_user');
    const listDevice = JSON.parse(deviceUser);

    useEffect(() => {
        let devices = [];

        if (listDevice) {
            const id = Object.keys(listDevice);
            id.map((v) => {
                devices.push({
                    id: v,
                    name: listDevice[v]['FullName'],
                });
            });
        }
        setMenuSelect(devices);
    }, []);

    useEffect(() => {
        AsyncLocalStorage.getItem('home_station').then((station) => {
            if (station) {
                setValueSelect(station);
            }
        });
    }, []);

    // get data from firebase
    useEffect(() => {
        return onValue(ref(db, `Devices/DAIVIET-RS485/${valueSelect}`), (snapshot) => {
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
                    id_station: valueSelect,
                    data_sensor: RS485Data,
                    location: Location,
                    last_time: lastTime,
                    full_name: listDevice[valueSelect]['FullName'],
                    status_station: timeC < timeP || compare === 1 ? `OFF*${'NOOK'}` : `ON*${'0'}`,
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
    let dataSensorChart = useRef([]);

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

        arr.current.map((v, index) => {
            let s = v.status_station.split('*')[1];
            let c = v.data_sensor.map((v2) => {
                // console.log(s);

                let b = v2.Value;
                let a = v2.Name;
                let obj = { [a]: b };

                // *********************************
                // getDataOfSensorRealtime(v.id_station, v2.Name);

                // *********************************
                return obj;
            });

            c.push({ time: v.last_time });

            let r = [];
            let o = {};
            c.map((v) => {
                let a = Object.keys(v)[0];
                let b = String(Object.values(v)[0]);
                r.push({ a, b });
            });
            // console.log({ r });
            r.map((v) => {
                o[v.a] = v.b;
            });
            dataSensorChart.current.push(o);
            // return o;
        });
    }

    //**************************************************************************** */
    //**************************************************************************** */

    // add value for field input
    const dataCoordinates = [];
    if (listDevice && valueSelect) {
        if (listDevice[valueSelect]['latitude'] && listDevice[valueSelect]['longitude'])
            dataCoordinates.push({
                name: listDevice[valueSelect]['FullName'],
                latitude: listDevice[valueSelect]['latitude'],
                longitude: listDevice[valueSelect]['longitude'],
            });
    }

    // handle onchange select station

    const handleOnChangeSelectStation = (e) => {
        AsyncLocalStorage.setItem('home_station', e.target.value).then(() => {
            // navigate(0);
            setValueSelect(e.target.value);
        });
    };

    // start date
    const handleChangeStartDate = (e) => {
        const startTime = moment(e.$d).format('HH:mm MM-DD-YYYY');
        setStartDateTemp(startTime);
    };

    // end date
    const handleChangeEndDate = (e) => {
        const endTime = moment(e.$d).format('HH:mm MM-DD-YYYY');
        setEndDateTemp(endTime);
    };

    // apply date
    const handleApplyDate = (e) => {
        console.log({ endDateTemp, startDateTemp });
        setStartDate(startDateTemp);
        setEndDate(endDateTemp);
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
        <div className="home_page">
            {menuValue ? (
                <>
                    <SubHeader
                        text={
                            valueSelect
                                ? 'BẢNG GIÁM SÁT DỮ LIỆU TỪNG TRẠM'
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
                            <Grid item xs={12}>
                                <MySelect
                                    label="Chọn trạm giám sát"
                                    menuValue={menuValue}
                                    value={valueSelect}
                                    onChange={handleOnChangeSelectStation}
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
                                                longitudeDefault={
                                                    listDevice[valueSelect]['longitude']
                                                }
                                                latitudeDefault={
                                                    listDevice[valueSelect]['latitude']
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
                                            <>
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
                                                            deviceUser={valueSelect}
                                                        />
                                                    </div>
                                                </Grid>
                                                {/* <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
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
                                                </Grid> */}
                                            </>
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
    );
}

export default Home;
