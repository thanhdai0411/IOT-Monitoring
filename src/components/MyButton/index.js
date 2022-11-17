import { Button } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import React from 'react';

export default function MyButton({
    name = 'Tìm kiếm',
    icon = <SearchOutlinedIcon />,
    fullWidth = true,
    onClick,
}) {
    return (
        <Button
            onClick={onClick}
            variant="contained"
            style={{ backgroundColor: '#088f81' }}
            fullWidth={fullWidth}
            startIcon={icon}>
            {name}
        </Button>
    );
}
