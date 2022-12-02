import React from 'react';

import Login from './Login';
import Register from './Register';
import ForgotPass from './ForgotPass';
import { Navigate, useNavigate } from 'react-router-dom';

import './Auth.scss';
import Cookies from 'js-cookie';

function Auth() {
    const navigate = useNavigate();
    const token = Cookies.get('auth_token');

    if (token) {
        // console.log('navi');
        // navigate('/home');
        return <Navigate to="/home" replace />;
    } else
        return (
            <>
                <div className="auth_wrap">
                    <div className="auth_container">
                        <div className="bg_auth_wrap">
                            <img
                                className="auth_logo"
                                src="/image/logo_cpn.png"
                                width={200}
                                alt=""
                            />
                            <div className="bg_auth"></div>
                        </div>
                        <div className="login_register">
                            <Login />
                        </div>
                    </div>
                </div>
            </>
        );
}

export default Auth;
