import React from 'react';

export default function TabStateStation({ left = '7%', top = '13%' }) {
    return (
        <div style={{ position: 'absolute', left: left, top: top, display: 'flex' }}>
            <div style={{ marginRight: '5px' }}>
                <div
                    style={{
                        // width: '50px',
                        height: '10px',
                        backgroundColor: '#11cc67',
                    }}></div>
                <p style={{ fontSize: '10px' }}>Hoạt động tốt</p>
            </div>
            <div style={{ marginRight: '5px' }}>
                <div
                    style={{
                        // width: '50px',
                        height: '10px',
                        backgroundColor: 'red',
                    }}></div>
                <p style={{ fontSize: '10px' }}>Cảm biến lỗi</p>
            </div>
            <div style={{ marginRight: '5px' }}>
                <div
                    style={{
                        // width: '50px',
                        height: '10px',
                        backgroundColor: 'orange',
                    }}></div>
                <p style={{ fontSize: '10px' }}>Cảm biến calib</p>
            </div>
            <div style={{ marginRight: '5px' }}>
                <div
                    style={{
                        // width: '50px',
                        height: '10px',
                        backgroundColor: 'gray',
                    }}></div>
                <p style={{ fontSize: '10px' }}>Không hoạt động</p>
            </div>
        </div>
    );
}
