import { Skeleton } from '@mui/material';
import { child, get, getDatabase, ref } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import moment from 'moment';
import { useEffect } from 'react';
import { useState, memo, useRef } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { functions } from '../../config/firebase';

const COLOR = [
    '#DC3535',
    '#256D85',
    '#474E68',
    '#990000',
    '#557153',
    '#2192FF',
    '#000000',
    '#EF9A53',
    '#38E54D',
    '#3A8891',
];
function MainChart({ endDate, startDate, deviceUser }) {
    const [dataSensorRange, setDataSensorRange] = useState([]);
    const [countGet, setCountGet] = useState(0);
    const [listSensor, setListSensor] = useState([]);

    const db = ref(getDatabase());

    let count = useRef(0);

    const getDataOfSensorRealtime = (
        idStation,
        nameSensor,
        startDateChoose = '13:30 11/15/2022',
        endDateChoose = '24:00 11/15/2022',
        isRealValue = true,
        IsRealTime = true
    ) => {
        // const startDateChoose = '13:00 11/11/2022'; // time MM/DD/YYYY
        // const endDateChoose = '13:00 12/11/2022';
        // console.log({ idStation, nameSensor, startDateChoose, endDateChoose });

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
    // let sensorName = localStorage.getItem('sensor').split(',');

    useEffect(() => {
        setCountGet(0);
        setDataSensorRange([]);
        // const deviceUser = localStorage.getItem('home_station');
        get(child(db, `Devices/DAIVIET-RS485/${deviceUser}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const { RS485Data } = snapshot.val();

                    let s = [];
                    RS485Data.map((v) => {
                        s.push(v.Name);
                    });
                    // console.log({ s });
                    setListSensor(s);
                    s.forEach((s) => {
                        getDataOfSensorRealtime(deviceUser, s, startDate, endDate);
                    });
                } else {
                    console.log('No data available');
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, [startDate, endDate, deviceUser]);

    // console.log({ count: countGet, leng: listSensor.length });

    let output = [];
    if (countGet === listSensor.length) {
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
                    if (typeof item.value == 'object') {
                        item.value = arr;
                    }
                    // console.log(item);
                    output.push(item);
                }
            });
        };
        handleObjectSameKeyInArr(dataSensorRange);
    }
    // console.log({ countGet });

    const mergeItemObjectArrToObject = (arr) => {
        return arr.map((v) => {
            let c = v.value.map((v2) => {
                let b = v2.val;
                let a = v2.name;
                let obj = { [a]: b };
                return obj;
            });
            c.push({ time: moment(v.time).format('DD-MM HH:mm') });

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
        endDataForChart = mergeItemObjectArrToObject(output);
    }

    // console.log({ endDataForChart });

    return (
        <>
            {endDataForChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        width={1000}
                        height={1000}
                        style={{ minHeight: '500px' }}
                        data={endDataForChart}
                        margin={{
                            top: 20,
                            right: 20,
                            left: -15,
                            bottom: 5,
                        }}>
                        <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
                        <XAxis dataKey="time" />

                        <YAxis />
                        <Legend />
                        <Tooltip />
                        {listSensor.map((v, index) => (
                            <Line
                                key={index}
                                type="linear"
                                strokeWidth={1.5}
                                dataKey={v}
                                stroke={COLOR[index]}
                                dot={{ r: 1 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ position: 'relative' }}>
                    <Skeleton animation="wave" variant="rounded" height={500} width={'100%'} />
                    <p
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '0',
                            right: '0',
                            textAlign: 'center',
                            padding: '0 165px',
                        }}>
                        <span style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '600' }}>
                            Vui lòng chờ...
                        </span>{' '}
                        <br />
                        Trường hợp không hiện thị vì không có dữ liệu bạn có thể chọn khoảng thời
                        gian khác
                    </p>
                </div>
            )}
        </>
    );
}

export default memo(MainChart);
