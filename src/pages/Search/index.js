import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Grid, Button, LinearProgress, Autocomplete, TextField } from '@mui/material';

import SubHeader from '../../components/SubHeader';
import MySelect from '../../components/MySelect';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import './Search.scss';
import MyDateRange from '../../components/DateRange';
import moment from 'moment';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import MyTable from '../../components/MyTable';
import { dataChartDetail, listSensorOfStation } from '../../redux/reducer/dataSensorSlice';
import { getDatabase, onValue, ref, child, get } from 'firebase/database';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import Toast from '../../utils/toasts';
const columns = [
    { id: 'stt', label: '#', align: 'center', minWidth: 50 },

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

function Search() {
    const [startDate, setStartDate] = useState(moment(new Date()).format('00:00 MM/DD/YYYY'));
    const [endDate, setEndDate] = useState(moment(new Date()).format('HH:mm MM/DD/YYYY'));

    const [menuValue, setMenuSelect] = useState([]);
    const [dataSensorRange, setDataSensorRange] = useState([]);
    const [countGet, setCountGet] = useState(0);
    const [stationId, setStationId] = useState('');
    const [endGetSensor, setEndGetSensor] = useState(false);
    const [listSensor, setListSensor] = useState([]);
    const [lengSensor, setLengSensor] = useState(0);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [valueSelect, setValueSelect] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // let sensorName = localStorage.getItem('sensor').split(',');

    const db = ref(getDatabase());

    const handleChangeStartDate = (e) => {
        const startTime = moment(e.$d).format('HH:mm MM-DD-YYYY');
        setStartDate(startTime);
    };

    const handleChangeEndDate = (e) => {
        const endTime = moment(e.$d).format('HH:mm MM-DD-YYYY');
        setEndDate(endTime);
    };

    const handleOnChangeSelect = (e) => {
        // console.log(e.target.value);
        setStationId(e.target.value);
    };

    const deviceUser = localStorage.getItem('device_user');
    const listDevice = JSON.parse(deviceUser);

    useEffect(() => {
        let devices = [];

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

    const getDataOfSensorRealtime = (
        idStation,
        nameSensor,
        startDateChoose = '13:30 11/15/2022',
        endDateChoose = '24:00 11/15/2022',
        endSensor,
        isRealValue = true,
        IsRealTime = true
    ) => {
        // console.log({ nameSensor, idStation, startDateChoose, endDateChoose });

        // const startDateChoose = '13:00 11/11/2022'; // time MM/DD/YYYY
        // const endDateChoose = '13:00 12/11/2022';

        const dateS = new Date(startDateChoose);
        const dateE = new Date(endDateChoose);

        const subtract7HoursStart = dateS.getTime() - 7 * 60 * 60 * 1000;
        const subtract7HoursEnd = dateE.getTime() - 7 * 60 * 60 * 1000;

        const startDate = moment(subtract7HoursStart).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment(subtract7HoursEnd).format('YYYY-MM-DD HH:mm:ss');

        const fcGetDataOfSensor = httpsCallable(functions, 'GetDataOfSensor');
        const data = {
            deviceId: idStation,
            sensorId: nameSensor,
            startDate: startDate,
            endDate: endDate,
            isRealValue: isRealValue, // false : AVG | true : real value
            scale: 'hour',
            IsRealTime: IsRealTime, // true :time real of value | false :
        };
        fcGetDataOfSensor(data)
            .then((result) => {
                const dataSensorGet = JSON.parse(result.data);
                setCountGet((countGet) => countGet + 1);

                // count.current = count.current + 1;

                dataSensorGet.Detail.forEach((v) => {
                    let obj = {
                        value: { name: nameSensor, val: v.avg_value },
                        time: v.data_hora.value,
                    };

                    setDataSensorRange((prv) => [...prv, obj]);
                });
            })
            .catch((error) => {
                const code = error.code;
                const message = error.message;
                const details = error.details;

                console.log({ code, message, details });
            });
    };

    // const watchData = () => {
    let output = [];
    if (countGet === lengSensor.length) {
        const handleObjectSameKeyInArr = (arr) => {
            arr.forEach(function (item) {
                var existing = output.filter(function (v, i) {
                    return v.time == item.time;
                });

                if (existing.length) {
                    var existingIndex = output.indexOf(existing[0]);
                    output[existingIndex].value = output[existingIndex].value.concat(item.value);
                } else {
                    let arr = [];
                    arr.push(item.value);
                    let type = typeof item.value;
                    if (type == 'object') {
                        item.value = arr;
                    }
                    // console.log(item);
                    output.push(item);
                }
            });
        };
        handleObjectSameKeyInArr(dataSensorRange);
        // };
    }

    // console.log({ count: countGet, leng: lengSensor });

    const mergeItemObjectArrToObject = (arr) => {
        return arr.map((v, index) => {
            let c = v.value.map((v2) => {
                let b = v2.val;
                let a = v2.name;
                let obj = { [a]: b };
                return obj;
            });
            c.push({ time: moment(v.time).format('HH:mm DD/MM/YYYY ') });
            c.push({ stt: index + 1 });
            let r = [];
            let o = {};
            c.map((v) => {
                let a = Object.keys(v)[0];
                let b = String(Object.values(v)[0]);
                r.push({ a, b });
            });
            r.map((v) => {
                o[v.a] = v.b;
            });

            return o;
        });
    };
    let endDataForChart = [];
    if (output.length > 0) {
        let type = dataSensorRange[0].value[0].length;
        if (!type) {
            endDataForChart = mergeItemObjectArrToObject(output);
        }
    }

    const handleClickSearch = () => {
        if (!valueSelect) {
            Toast('error', 'Vui lòng chọn trạm để tra cứu', 2000);
            return;
        }
        if (endDataForChart.length > 0) {
            Toast('warning', 'Dữ liệu đã tìm thấy', 2000);
            return;
        }

        setCountGet(0);
        setDataSensorRange([]);
        setLoadingSearch(true);
        get(child(db, `Devices/DAIVIET-RS485/${stationId}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const { RS485Data } = snapshot.val();

                    let s = [];
                    let tb = [];
                    RS485Data.map((v) => {
                        s.push(v.Name);
                        tb.push({
                            id: v.Name,
                            label: `${v.Name}(${v.Unit})`,
                            align: 'center',
                        });
                    });
                    tb.unshift({
                        id: 'time',
                        label: 'Thời gian',
                        // minWidth: 60,
                        align: 'center',
                        format: (value) => value.toLocaleString('en-US', { timeZone: 'UTC' }),
                    });

                    setListSensor(tb);
                    setLengSensor(s);

                    let endSensor = s[s.length - 1];
                    s.forEach((s) => {
                        getDataOfSensorRealtime(stationId, s, startDate, endDate, endSensor);
                    });
                } else {
                    console.log('No data available');
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleClickChart = () => {
        if (!valueSelect) {
            Toast('error', 'Vui lòng chọn trạm để tra cứu', 2000);
            return;
        }
        navigate(`/search/chart/${valueSelect.label}`);
        dispatch(dataChartDetail(endDataForChart));
        dispatch(listSensorOfStation(lengSensor));
    };

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

    const handleOnChangeSelectStation = (e, v) => {
        if (v !== null) {
            setValueSelect(v);
            setStationId(v.id);
        }
    };

    return (
        <div className="search_page">
            <SubHeader text={'TRA CỨU DỮ LIỆU'} />
            {/* <SubHeader text={'GIÁM SÁT TRỰC TUYẾN TRẠM NƯỚC THẢI'} /> */}
            <div className="monitor_page-select">
                <Grid container spacing={1}>
                    <Grid item xl={3} lg={3} md={12} sm={12} xs={12}>
                        <Autocomplete
                            id="controllable-states-demo"
                            size="small"
                            color="success"
                            onChange={handleOnChangeSelectStation}
                            options={menuValue}
                            value={valueSelect.label || null}
                            renderInput={(params) => (
                                <TextField {...params} label="Chọn trạm tra cứu" />
                            )}
                        />
                    </Grid>
                    <Grid item xl={2.5} lg={2.5} md={3} sm={4} xs={12}>
                        <MyDateRange
                            label={'Bắt đầu'}
                            onChange={handleChangeStartDate}
                            value={startDate}
                        />
                    </Grid>
                    <Grid item xl={2.5} lg={2.5} md={3} sm={4} xs={12}>
                        <MyDateRange
                            label={'Kết thúc'}
                            onChange={handleChangeEndDate}
                            value={endDate}
                        />
                    </Grid>
                    <Grid item xl={2} lg={2} md={3} sm={4} xs={12}>
                        <Button
                            variant="contained"
                            style={{ backgroundColor: 'orange' }}
                            fullWidth
                            onClick={handleClickChart}
                            disabled={endDataForChart.length ? false : true}
                            startIcon={<StackedLineChartIcon />}>
                            Biểu đồ
                        </Button>
                    </Grid>
                    <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                        <Button
                            variant="contained"
                            style={{ backgroundColor: '#088f81' }}
                            fullWidth
                            // disabled={dbBtnSearch ? true : false}
                            onClick={handleClickSearch}
                            startIcon={<SearchOutlinedIcon />}>
                            Tìm kiếm
                        </Button>
                    </Grid>
                </Grid>
            </div>
            <div className="table">
                {endDataForChart.length ? (
                    <MyTable
                        columns={listSensor}
                        rows={endDataForChart}
                        styleStateValue={styleStateValue}
                    />
                ) : (
                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: '18px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '40vh',
                        }}>
                        {loadingSearch ? (
                            <span>Đang tiến hành tìm kiếm</span>
                        ) : (
                            <span>Chưa có dữ liệu</span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Search;
