import React from 'react';
import Nothing from '../../components/Nothing';
import { FixedSizeList as List } from 'react-window';
const Row = ({ index, style }) => <div style={style}>Row {index}</div>;
export default function History() {
    // return <Nothing />;
    return (
        <List height={150} itemCount={1000} itemSize={35} width={300}>
            {Row}
        </List>
    );
}
