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

let data = [
    {
        pH: '6.68',
        DO: '2.83',
        NH4: '2.83',
        name: '09:20 15/11/2022',
    },
    {
        pH: '5',
        DO: '2',
        NH4: '1',
        name: '09:20 15/11/2022',
    },
    {
        pH: '3',
        DO: '2',
        NH4: '1',
        name: '09:20 15/11/2022',
    },
];

const COLOR = [
    '#DC3535',
    '#256D85',
    '#474E68',
    '#990000',
    '#557153',
    '#2192FF',
    '#000000',
    '#00F5FF',
    '#38E54D',
    '#3A8891',
];
function Report() {
    const [dataSensorRange, setDataSensorRange] = useState([]);
    const [dataChart, setDataChart] = useState([]);
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
                count.current = count.current + 1;
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
    const sensorName = localStorage.getItem('sensor').split(',');

    useEffect(() => {
        const deviceUser = localStorage.getItem('home_station');
        sensorName.map((s) => {
            getDataOfSensorRealtime(deviceUser, s);
        });
    }, []);
    console.log({ count: count.current, leng: sensorName.length });

    let output = [];
    if (count.current === sensorName.length) {
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
    // console.log({ output });

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
        <div style={{ height: '500px', width: '90vw', margin: 'auto' }}>
            <h3 style={{ textAlign: 'center' }}>GIAM SAT BIEU DO DU LIEU QUAN TRAC</h3>
            {endDataForChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        width={500}
                        height={500}
                        data={endDataForChart}
                        margin={{
                            top: 20,
                            right: 35,
                            left: 5,
                            bottom: 5,
                        }}>
                        <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Legend />
                        <Tooltip />
                        {sensorName.map((v, index) => (
                            <Line
                                type="linear"
                                strokeWidth={2}
                                dataKey={v}
                                dot={{ r: 1 }}
                                stroke={COLOR[index]}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default Report;
