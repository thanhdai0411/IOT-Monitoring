import { styled } from '@mui/material/styles';
import { memo, useState, useCallback } from 'react';

import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { ListItemIcon } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import Toast from '../../../utils/toasts';
import './Header.scss';
import Cookies from 'js-cookie';

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
}));

function Header({ handleOpenSidebar }) {
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    const handleDrawerOpen = () => {
        setOpen(!open);
        handleOpenSidebar(!open);
    };

    // menu
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const handleClickAvatar = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // get in local storage
    let username = localStorage.getItem('loginUserName');
    let imgUserLogin = localStorage.getItem('imgUser');

    //log out
    const auth = getAuth();
    const handleLogOut = () => {
        signOut(auth)
            .then(() => {
                sessionStorage.clear();
                localStorage.clear();
                Cookies.remove('auth_token');
                Toast('success', 'Bạn đã đăng suất ra khỏi hệ thống');
                navigate('/');
            })
            .catch((error) => {
                // An error happened.
                // navigate('/');
            });
    };

    return (
        <AppBar className="header" position="fixed" sx={{ display: 'flex' }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{
                        marginRight: 2,
                        // ...(open && { display: 'none' }),
                    }}>
                    {open ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                {/* <img src="/image/logo_cpn.png" width={120} alt="" /> */}
                <Typography
                    sx={{ flexGrow: 1 }}
                    className="header_title"
                    variant="h6"
                    noWrap
                    component="div">
                    QUẢN LÝ DỮ LIỆU QUAN TRẮC
                </Typography>
                <Avatar
                    alt="Remy Sharp"
                    src={imgUserLogin}
                    onClick={handleClickAvatar}
                    sx={{ cursor: 'pointer' }}
                />
                <Menu
                    id="fade-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}>
                    {/* <MenuItem onClick={handleCloseMenu}>
                        <ListItemIcon>
                            <PersonAdd fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem> */}
                    <MenuItem onClick={handleLogOut}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
                <p className="header_username">{username}</p>
            </Toolbar>
        </AppBar>
    );
}
export default memo(Header);
