import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { useSelector } from 'react-redux';
import { dataChartSelector, listSensorStationSelector } from '../../redux/reducer/dataSensorSlice';

import { useParams, useNavigate } from 'react-router-dom';

import MyButton from '../../components/MyButton';

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
    '#3A8891',
    '#38E54D',
];
function DetailChart() {
    const endDataForChart = useSelector(dataChartSelector);
    const sensorName = useSelector(listSensorStationSelector);
    const { station } = useParams();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    console.log({ endDataForChart });

    return (
        <div style={{ height: '500px', width: '90vw', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {endDataForChart ? (
                    <MyButton fullWidth={false} icon={null} name="Trờ về" onClick={handleGoBack} />
                ) : null}

                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '25px',
                        margin: '20px 0',
                        textTransform: 'uppercase',
                    }}>
                    BIỂU ĐỒ DỮ LIỆU {station}
                </p>
                <p></p>
            </div>
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
                        <YAxis
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            allowDataOverFlow={true}
                        />
                        <Legend />
                        <Tooltip />
                        {sensorName.map((v, index) => (
                            <Line
                                key={`line-${index}`}
                                type="linear"
                                strokeWidth={1.5}
                                dataKey={v}
                                dot={{ r: 1 }}
                                stroke={COLOR[index]}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '20px', marginBottom: '10px' }}>Không có dữ liệu</p>
                    <MyButton
                        fullWidth={false}
                        icon={null}
                        name="Trờ về trang tra cứu dữ liệu"
                        onClick={handleGoBack}
                    />
                </div>
            )}
        </div>
    );
}

export default DetailChart;
