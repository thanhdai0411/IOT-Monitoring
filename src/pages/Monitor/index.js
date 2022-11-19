import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import '../../components/Layout/Header';
import './Monitor.scss';

import { getDatabase, onValue, ref } from 'firebase/database';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Autocomplete, Button, Grid, TextField } from '@mui/material';

import Loading from '../../components/Loading';
import MySelect from '../../components/MySelect';
import MyTable from '../../components/MyTable';
import SubHeader from '../../components/SubHeader';
import compareDate from '../../utils/compare_date';
import { getUniqueListBy } from '../../utils/function';

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { dataSensorRealTime } from '../../redux/reducer/dataSensorSlice';
import getDataOfSensorRealtime from '../../utils/getRangeData';

const columns = [
    { id: 'stt', label: '#', align: 'center', minWidth: 50 },
    { id: 'status', label: 'Status', align: 'center' },
    {
        id: 'station',
        label: 'Tên trạm',
        // minWidth: 200,
        align: 'center',
    },
    {
        id: 'time',
        label: 'Thời gian',
        // minWidth: 60,
        align: 'center',
        format: (value) => value.toLocaleString('en-US', { timeZone: 'UTC' }),
    },
    {
        id: 'TSS',
        label: 'TSS(mg/l)',
        // minWidth: 60,
        align: 'center',
        value: '-',
    },
    {
        id: 'Cl',
        label: 'Clo dư(mg/l)',
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'COD',
        label: 'COD(mg/l)',
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'pH',
        label: 'pH',
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'Temp_out',
        label: `Nhiệt độ ra(℃)`,
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'Temp_in',
        label: 'Nhiệt độ vào(℃)',
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'Amonia',
        label: 'Amonia(mg/l)',
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'Flow_in',
        label: 'Lưu lượng nước vào (m3/l)',
        // minWidth: 60,
        align: 'center',
    },
    {
        id: 'Flow_out',
        label: 'Lưu lượng nước ra (m3/l)',
        // minWidth: 60,
        align: 'center',
    },
];

const TIME_DEVICE_OFF = 30;

function Monitor() {
    const [dataChange, setDataChange] = useState(false);
    const dispatch = useDispatch();
    const [valueSelect, setValueSelect] = useState('');
    const [menuValue, setMenuSelect] = useState([]);
    const [detailMonitor, setDetailMonitor] = useState(null);

    // handle data realtime
    const db = getDatabase();
    const dataRealTime = useRef([]);

    const deviceUser = localStorage.getItem('device_user');
    const listDevice = JSON.parse(deviceUser);

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

    // get data
    useEffect(() => {
        devices.map((v) => {
            return onValue(ref(db, `Devices/DAIVIET-RS485/${v.id}`), (snapshot) => {
                // console.log(snapshot.val());
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
                    full_name: v.label,
                    status_station: timeC < timeP || compare === 1 ? `OFF*${'NOOK'}` : `ON*${'0'}`,
                });
                setDataChange({
                    last_time: LastTime,
                });
            });
        });
    }, []);

    // handle data get
    let arr = useRef();
    let stateDevice = useRef();
    let rows;
    if (dataChange) {
        arr.current = getUniqueListBy(dataRealTime.current, 'location');
        let dataForTable = arr.current.map((v, index) => {
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
                let obj = { [a]: b };

                // *********************************
                // getDataOfSensorRealtime(v.id_station, v2.Name);

                // *********************************
                return obj;
            });
            c.push({ id_station: v.id_station });
            c.push({ station: v.full_name });
            c.push({ stt: index + 1 });
            c.push({ time: v.last_time });
            c.push({ status: v.status_station });
            c.push({ view: 'chart' });

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

            return o;
        });
        rows = dataForTable;
    }
    console.log({ rows });

    const handleOnChangeSelectStation = (e, v) => {
        console.log(v);
        if (v !== null) {
            setValueSelect(v);
            let result = rows.filter((v2) => v2.id_station == v.id);
            console.log({ result });
            setDetailMonitor(result);
        }
    };

    // style for state sensor
    const styleStateValue = (value) => {
        let stateSensor = value.split('*')[1];
        let statusStation = value.split('*')[2];

        // console.log(statusStation);
        return {
            padding: '5px ',
            borderRadius: '5px',
            color: 'white',
            fontSize: '14px',
            backgroundColor:
                statusStation === 'STATION_OFF'
                    ? 'gray'
                    : stateSensor === '1'
                    ? 'orange'
                    : stateSensor === '2'
                    ? 'red'
                    : stateSensor === '0'
                    ? '#11cc67'
                    : 'gray',
        };
    };

    const handleMonitorAll = () => {
        setDetailMonitor(null);
        setValueSelect('');
    };

    return (
        <>
            {arr.current && arr.current.length > 0 ? (
                <>
                    <div className="monitor_page">
                        <SubHeader text={'GIÁM SÁT TRỰC TUYẾN TRẠM NƯỚC THẢI'} />
                        {/* <SubHeader text={'GIÁM SÁT TRỰC TUYẾN TRẠM NƯỚC THẢI'} /> */}
                        <div className="monitor_page-select">
                            <Grid container spacing={2}>
                                {/* <Grid item xs={2}>
                                    <MySelect label="Chọn Tỉnh" />
                                </Grid>
                                <Grid item xs={2}>
                                    <MySelect label="Chọn Vùng" />
                                </Grid>
                                <Grid item xs={3}>
                                    <MySelect label="Chọn Trạm" />
                                </Grid>
                                <Grid item xs={3}>
                                    <MySelect label="Chọn Mức Cảnh Báo" />
                                </Grid> */}
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                                    <Autocomplete
                                        id="controllable-states-demo"
                                        size="small"
                                        color="success"
                                        onChange={handleOnChangeSelectStation}
                                        options={menuValue}
                                        value={valueSelect.label}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Chọn trạm giám sát" />
                                        )}
                                    />
                                </Grid>
                                <Grid item xl={2} lg={2} md={6} sm={12} xs={12}>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#088f81' }}
                                        fullWidth
                                        onClick={handleMonitorAll}>
                                        GIÁM SÁT TẤT CẢ
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                        <div className="table">
                            <>
                                <MyTable
                                    columns={columns}
                                    rows={detailMonitor ? detailMonitor : rows}
                                    styleStateValue={styleStateValue}
                                />
                            </>
                        </div>
                    </div>
                </>
            ) : (
                // <LinearProgress color="success" />
                <Loading />
            )}
        </>
    );
}

export default Monitor;
