import Home from '../pages/Home';
import Account from '../pages/Account';
import Auth from '../pages/Auth';
import Login from '../pages/Auth/Login';
import NotFound from '../pages/404';
import Camera from '../pages/Camera';
import Monitor from '../pages/Monitor';
import Report from '../pages/Report';
import MyMap from '../pages/Map';
import History from '../pages/History';
import Search from '../pages/Search';
// public route
const privateRoutes = [
    {
        path: '/home',
        component: Home,
    },
    {
        path: '/account',
        component: Account,
    },
    {
        path: '/map',
        component: MyMap,
    },
    {
        path: '/monitor',
        component: Monitor,
    },
    {
        path: '/search',
        component: Search,
    },
    {
        path: '/report',
        component: Report,
    },
    {
        path: '/camera',
        component: Camera,
    },
    {
        path: '/history',
        component: History,
    },
    {
        path: '/search',
        component: History,
    },
];

// private route
const publicRoutes = [
    {
        path: '/',
        component: Auth,
        layout: null,
    },
    {
        path: '/*',
        component: NotFound,
        layout: null,
    },
];

export { privateRoutes, publicRoutes };
