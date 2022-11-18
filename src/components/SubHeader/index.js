import { memo } from 'react';
import './SubHeader.scss';

function SubHeader({ text, component = <></> }) {
    return (
        <div className="sub_header_wrapper">
            <p className="sub_text">{text}</p>
            {component}
        </div>
    );
}

export default memo(SubHeader);
