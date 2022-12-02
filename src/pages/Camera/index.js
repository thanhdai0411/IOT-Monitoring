import { useState, useEffect, useRef } from 'react';
import { Autocomplete, Button, CardMedia, Grid, TextField } from '@mui/material';
import React from 'react';
import Nothing from '../../components/Nothing';
import SubHeader from '../../components/SubHeader';
import './Camera.scss';
import asyncLocalStorage from '../../utils/async_localstorage';
import Loading from '../../components/Loading';
function Camera() {
    const [dataChange, setDataChange] = useState(false);
    const [valueSelect, setValueSelect] = useState('');
    const [menuValue, setMenuSelect] = useState([]);
    const [detailMonitor, setDetailMonitor] = useState(null);
    const [cameraList, setCameraList] = useState([]);

    const deviceUser = localStorage.getItem('device_user');
    const listDevice = JSON.parse(deviceUser);

    let devices = [];
    useEffect(() => {
        if (listDevice) {
            const id = Object.keys(listDevice);
            id.forEach((v) => {
                devices.push({
                    id: v,
                    label: listDevice[v]['FullName'],
                });
            });
        }
        setMenuSelect(devices);
    }, []);

    const handleOnChangeSelectStation = (e, v) => {
        console.log(v);
        setValueSelect(v);
        setCameraList(listDevice[v.id]['cameraList']);
    };

    useEffect(() => {
        asyncLocalStorage.getItem('home_station').then((station) => {
            if (station) {
                let stationUser = JSON.parse(station);
                setValueSelect(stationUser);
                setCameraList(listDevice[stationUser.id]['cameraList']);
            } else {
                setValueSelect(devices[0]);
                setCameraList(listDevice[devices[0].id]['cameraList']);
            }
        });
    }, []);

    console.log({ cameraList });
    // console.log({ valueSelect });

    return (
        <div className="camera_page">
            <SubHeader
                text={
                    valueSelect.label
                        ? `GIÁM SÁT CAMERA ${valueSelect.label}`
                        : 'CHỌN TRẠM ĐỂ GIÁM SÁT CAMERA'
                }
            />
            {/* <SubHeader text={'GIÁM SÁT TRỰC TUYẾN TRẠM NƯỚC THẢI'} /> */}
            <div className="camera_page-select">
                <Grid container spacing={2}>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
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
                </Grid>
            </div>
            <div>
                <Grid container spacing={2}>
                    {cameraList.length ? (
                        cameraList.map((v) => {
                            console.log(cameraList, v);
                            return (
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                                    <CardMedia
                                        component="video"
                                        height="350"
                                        autoPlay
                                        controls
                                        src={v}
                                        alt="Paella dish"
                                    />
                                </Grid>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '100px', width: '100%' }}>
                            <p>Không có camera để giám sát</p>
                        </div>
                    )}
                </Grid>
            </div>
        </div>
    );
}

export default Camera;
// <video width="750" height="500" controls muted autoPlay={true} preLoad="auto" loop>
//     <source src="https://config.iotdaiviet.com/video?tagid=rtsp://admin:hd543211@123.25.218.245:1555/11" />
// </video>
