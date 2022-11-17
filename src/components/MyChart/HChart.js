import React, { Component } from 'react';
import Highcharts from 'highcharts';
import moment from 'moment';
import {
    HighchartsChart,
    Chart,
    withHighcharts,
    XAxis,
    YAxis,
    Title,
    Legend,
    LineSeries,
    Tooltip,
} from 'react-jsx-highcharts';

const createDataPoint = (time = Date.now(), magnitude = 1000, offset = 0) => {
    return [time + offset * magnitude, 0];
};
const createRandomData = (time, magnitude, points = 20) => {
    const data = [];
    let i = points * -1 + 1;
    for (i; i <= 0; i++) {
        data.push(createDataPoint(time, magnitude, i));
    }

    return data;
};

const addDataPoint = (data, toAdd) => {
    if (!toAdd) toAdd = createDataPoint();
    const newData = data.slice(0); // Clone
    if (newData.length > 20) {
        newData.reverse().pop();
        newData.reverse();
    }

    newData.push(toAdd);

    return newData;
};
class HChart extends Component {
    constructor(props) {
        super(props);
        this.updateLiveData = this.updateLiveData.bind(this);
        this.handleStartLiveUpdate = this.handleStartLiveUpdate.bind(this);
        const now = Date.now();
        this.state = {
            data1: createRandomData(now),
            data2: createRandomData(now),
            data3: createRandomData(now),
            data4: createRandomData(now),
            liveUpdate: false,
        };
    }

    componentDidMount() {
        this.handleStartLiveUpdate();
    }

    updateLiveData() {
        const { data1, data2, data3, data4 } = this.state;

        this.setState({
            data1: addDataPoint(data1, [Date.now(), Math.round(Math.random() * 10)]),
            data2: addDataPoint(data2, [Date.now(), Math.round(Math.random() * 10)]),
            data3: addDataPoint(data3, [Date.now(), Math.round(Math.random() * 10)]),
            data4: addDataPoint(data4, [Date.now(), Math.round(Math.random() * 10)]),
        });
    }

    handleStartLiveUpdate(e) {
        e && e.preventDefault();
        this.setState({
            liveUpdate: window.setInterval(this.updateLiveData, 1000),
        });
    }

    render() {
        const { data1, data2, data3, data4, liveUpdate } = this.state;

        return (
            <div className="app">
                <HighchartsChart time={{ useUTC: false }}>
                    <Chart />

                    <Title>{this.props.titleHeader}</Title>

                    <Legend>
                        <Legend.Title>Legend</Legend.Title>
                    </Legend>
                    <Tooltip padding={10} hideDelay={250} shape="square" split />
                    <XAxis type="datetime">
                        <XAxis.Title>Time</XAxis.Title>
                    </XAxis>

                    <YAxis>
                        <YAxis.Title>Pressure (m)</YAxis.Title>
                        {this.props.dataSensor.map((v) => {
                            <LineSeries name="Sensor 1" data={data1} />;
                        })}
                        <LineSeries name="Sensor 2" data={data2} />
                        <LineSeries name="Sensor 3" data={data3} />
                        <LineSeries name="Sensor 4" data={data4} />
                    </YAxis>
                </HighchartsChart>
            </div>
        );
    }
}

export default withHighcharts(HChart, Highcharts);
