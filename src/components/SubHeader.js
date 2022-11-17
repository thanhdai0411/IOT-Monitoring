import { memo } from 'react';
import MySelect from './MySelect';

function SubHeader({ text, component = <></> }) {
    return (
        <div
            style={{
                border: '1.5px solid #ccc',
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: 'white',
                fontWeight: '600',
                borderRadius: '3px',
            }}>
            <p style={{ fontSize: '18px' }}>{text}</p>
            {component}
        </div>
    );
}

export default memo(SubHeader);
