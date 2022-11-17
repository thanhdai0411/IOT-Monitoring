import React from 'react';

import Login from './Login';
import Register from './Register';
import ForgotPass from './ForgotPass';

import './Auth.scss';

function Auth() {
    return (
        <>
            <div className="auth_wrap">
                <div className="auth_container">
                    <div className="bg_auth_wrap">
                        <img src="/image/logo_cpn.png" width={200} alt="" />
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
