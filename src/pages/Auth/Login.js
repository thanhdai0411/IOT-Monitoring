import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import './Auth.scss';

import ForgotPass from './ForgotPass';
import LoginSocial from './LoginSocial';
import Register from './Register';

import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';

import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithEmailAndPassword,
} from 'firebase/auth';

import asyncLocalStorage from '../../utils/async_localstorage';
import Toast from '../../utils/toasts';

export default function Login() {
    const [loginSocial, setLoginSocial] = useState(false);

    const [registerForm, setRegisterForm] = useState(false);
    const [forgotForm, setForgotForm] = useState(false);

    const [validateEmail, setValidateEmail] = useState(false);
    const [validateEmailPass, setValidateEmailPass] = useState(false);

    const [email, setEmail] = useState('');
    const [emailPass, setEmailPass] = useState('');
    const navigate = useNavigate();

    // login social
    const handleLoginSocial = () => {
        setLoginSocial(true);
    };

    // get deviced user
    const getDeviceUser = (author, accessToken) => {
        author.getIdToken().then((data) => {
            const token = `Bearer ${data}`;
            // let a = getDeviceUser(token);
            Toast('info', 'Vui lòng chờ... Đang chuyển hướng!');
            fetch(
                'https://asia-east2-weatherstationiotdaiviet.cloudfunctions.net/HttpPostRequest/api/getListDevices',
                {
                    method: 'POST',
                    headers: new Headers({
                        Authorization: token,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }),
                }
            )
                .then((response) => response.json())
                .then((myJson) => {
                    const res = myJson.ListDevicesOfUser;

                    asyncLocalStorage
                        .setItem('device_user', JSON.stringify(res))
                        .then(() => {
                            Cookies.set('auth_token', accessToken, {
                                expires: 30,
                            });
                            Toast('success', 'Đăng nhập thành công');
                            navigate('/home');
                        })
                        .catch(() => {
                            Toast('error', 'Đã xảy ra lỗi trong quá trình đăng nhập');
                        });
                })
                .catch((err) => {
                    console.log({ err_loin: err });
                });
        });
    };

    // handle login equal email
    const auth = getAuth();

    const handleLoginEmail = () => {
        if (!email) {
            setValidateEmail(true);
            return;
        }
        if (!emailPass) {
            setValidateEmailPass(true);
            return;
        }

        signInWithEmailAndPassword(auth, email, emailPass)
            .then((userCredential) => {
                const author = userCredential.user;
                const isVerify = author.emailVerified;
                console.log(author);
                console.log({ isVerify });
                const accessToken = userCredential.user.accessToken;
                localStorage.setItem('loginUserName', author.displayName);

                getDeviceUser(author, accessToken);
            })
            .catch((error) => {
                const errorMessage = error.message;
                Toast('error', `Đăng nhập thât bại ${errorMessage}`);
            });
    };

    // register
    const handleRegister = () => {
        setRegisterForm(true);
    };

    //forgot pass
    const handleForgotPass = () => {
        setForgotForm(true);
    };

    // back to login
    const backToLogin = (v) => {
        if (v) {
            setRegisterForm(false);
            setForgotForm(false);
            setLoginSocial(false);
        }
    };

    return (
        <>
            {registerForm === true ? (
                <Register backToLogin={backToLogin} />
            ) : forgotForm === true ? (
                <ForgotPass backToLogin={backToLogin} />
            ) : loginSocial === true ? (
                <LoginSocial backToLogin={backToLogin} />
            ) : (
                <div className="form_login">
                    {/* <img src="/image/logo_cpn.png" width={200} height={100} alt="" /> */}
                    <h1>ĐĂNG NHẬP</h1>
                    <div id="recaptcha-container"></div>
                    <div>
                        <div className="form_input">
                            <p style={{ marginBottom: '10px' }}>Nhập email của bạn</p>
                            <TextField
                                required
                                error={validateEmail}
                                id="outlined-required"
                                type={'email'}
                                label="Nhập email của bạn"
                                defaultValue=""
                                size="small"
                                color="success"
                                fullWidth
                                onChange={(e) => {
                                    setValidateEmail(false);
                                    setEmail(e.target.value);
                                }}
                            />
                        </div>
                        <div className="form_input">
                            <p style={{ marginBottom: '10px' }}>Nhập mật khẩu của bạn</p>
                            <TextField
                                required
                                error={validateEmailPass}
                                type={'password'}
                                id="outlined-required"
                                label="Nhập mật khẩu của bạn"
                                defaultValue=""
                                size="small"
                                color="success"
                                fullWidth
                                onChange={(e) => {
                                    setValidateEmailPass(false);
                                    setEmailPass(e.target.value);
                                }}
                            />
                        </div>
                        <div style={{ marginTop: '5px' }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                style={{ backgroundColor: '#088f81' }}
                                onClick={handleLoginEmail}>
                                ĐĂNG NHẬP
                            </Button>
                        </div>
                        <div className="register_forgot">
                            <p className="register" onClick={handleRegister}>
                                Đăng ký ngay
                            </p>
                            <p className="forgot_pass" onClick={handleForgotPass}>
                                Quên mật khẩu
                            </p>
                        </div>
                    </div>

                    <div className="break_auth">
                        <div className="break_first"></div>
                        <span
                            style={{
                                fontWeight: '500',
                                fontSize: '18px',
                                margin: ' 0 10px',
                            }}>
                            OR
                        </span>
                        <div className="break_second"></div>
                    </div>
                    <div className="login_social">
                        <div className="login_social-gg">
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                size="large"
                                style={{ fontWeight: '500' }}
                                onClick={handleLoginSocial}>
                                ĐĂNG NHẬP BẰNG SOCIAL
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
