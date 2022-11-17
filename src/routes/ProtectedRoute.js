import { Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/' }) => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
        return <Navigate to={redirectPath} replace />;
    }

    return (
        <>
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
