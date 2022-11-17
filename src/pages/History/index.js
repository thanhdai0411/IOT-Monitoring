import { useEffect } from 'react';
import moment from 'moment';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';

function History() {
    const getDataOfSensorRealtime = (
        idStation,
        nameSensor,
        startDateChoose,
        endDateChoose,
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

        console.log({ idStation, nameSensor, startDate, endDate });

        const fcGetDataOfSensor = httpsCallable(functions, 'GetDataOfSensor');
        const data = {
            deviceId: idStation,
            sensorId: nameSensor,
            startDate: startDate,
            endDate: endDate,
            isRealValue: true, // false : AVG | true : real value
            scale: 'hour',
            IsRealTime: true, // true :time real of value | false :
        };

        fcGetDataOfSensor(data)
            .then((result) => {
                // console.log(result.data);
                const dataSensorGet = JSON.parse(result.data);
                console.log(dataSensorGet);
            })
            .catch((error) => {
                const code = error.code;
                const message = error.message;
                const details = error.details;

                console.log({ code, message, details });
            });
    };
    //77
    getDataOfSensorRealtime('BD_DTIE_NUODTI', 'pH', '11:00 11/13/2022', '24:00 11/13/2022');

    return <div>History</div>;
}

export default History;
