import React, { useState } from 'react';
import './Auth.scss';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';

import LinearProgress from '@mui/material/LinearProgress';

import Register from './Register';
import ForgotPass from './ForgotPass';

import { useNavigate } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    getAuth,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from 'firebase/auth';

import Toast from '../../utils/toasts';
import getDeviceUser from '../../utils/get_device';
import asyncLocalStorage from '../../utils/async_localstorage';

const provider = new GoogleAuthProvider();

export default function Login() {
    const [showInputPhone, setShowInputPhone] = useState(false);
    const [showInputOTP, setShowInputOTP] = useState(false);

    const [registerForm, setRegisterForm] = useState(false);
    const [forgotForm, setForgotForm] = useState(false);

    const [validateEmail, setValidateEmail] = useState(false);
    const [validateEmailPass, setValidateEmailPass] = useState(false);
    const [validatePhone, setValidatePhone] = useState(false);
    const [validateOTP, setValidateOTP] = useState(false);

    const [email, setEmail] = useState('');
    const [emailPass, setEmailPass] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [result, setResult] = useState('');
    const [otp, setOTP] = useState('');

    const navigate = useNavigate();

    //show input phone
    const handleShowFormPhone = (e) => {
        setShowInputPhone(true);
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
                localStorage.setItem('loginUserName', author.displayName);

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
                                    sessionStorage.setItem(
                                        'auth_token',
                                        userCredential._tokenResponse.refreshToken
                                    );
                                    Toast('success', 'Đăng nhập thành công');
                                    navigate('/home');
                                })
                                .catch(() => {
                                    Toast('error', 'Đã xảy ra lỗi trong quá trình đăng nhập');
                                });
                        });
                });
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
        }
    };

    // login google
    const handleLoginGG = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;

                const user = result.user;
                user.getIdToken().then(function (data) {
                    sessionStorage.setItem('call_token', `Bearer ${data}`);
                });

                const name = user.displayName;
                const imgUser = user.photoURL;
                localStorage.setItem('loginUserName', name);
                localStorage.setItem('imgUser', imgUser);
                sessionStorage.setItem('auth_token', token);

                Toast('success', 'Đăng nhập thành công');

                navigate('/home');
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log({ errorCode, errorMessage, email, credential });
                // ...
            });
    };

    // login equal phone number
    const handleLoginPhoneNumber = () => {
        if (!phoneNumber) {
            setValidatePhone(true);
            return;
        }
        const a = phoneNumber.slice(1);
        const phone = '+84' + a;
        window.recaptchaVerifier = new RecaptchaVerifier(
            'recaptcha-container',
            {
                size: 'invisible',
            },
            auth
        );

        const verify = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phone, verify)
            .then((confirmationResult) => {
                console.log({ confirmationResult });
                setShowInputOTP(true);
                setShowInputPhone(false);
                setResult(confirmationResult);
                Toast('info', 'Vui lòng nhập mã OTP');
            })
            .catch((error) => {
                alert(error);
                // Error; SMS not sent
                // ...
            });
    };

    const verifyOTP = () => {
        if (!otp) {
            setValidateOTP(true);
            return;
        }
        result
            .confirm(otp)
            .then((result) => {
                const user = result.user;

                user.getIdToken().then(function (data) {
                    sessionStorage.setItem('call_token', `Bearer ${data}`);
                });

                localStorage.setItem('loginUserName', user.phoneNumber);
                sessionStorage.setItem('auth_token', user.refreshToken);
                Toast('success', 'Đăng nhập thành công');
                navigate('/home');
            })
            .catch((error) => {
                Toast('error', `Đăng nhập thất bại ${error.message} `);
            });
    };
    return (
        <>
            {registerForm === true ? (
                <Register backToLogin={backToLogin} />
            ) : forgotForm === true ? (
                <ForgotPass backToLogin={backToLogin} />
            ) : (
                <div className="form_login">
                    {/* <img src="/image/logo_cpn.png" width={200} height={100} alt="" /> */}
                    <h1>ĐĂNG NHẬP</h1>
                    <div id="recaptcha-container"></div>
                    <div>
                        <div className="form_input">
                            {/* <p style={{ marginBottom: '10px' }}>Nhập email của bạn</p> */}
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
                            {/* <p style={{ marginBottom: '10px' }}>Nhập mật khẩu của bạn</p> */}
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
                                variant="outlined"
                                color="error"
                                size="medium"
                                style={{ fontWeight: '500' }}
                                startIcon={<GoogleIcon sx={{ color: 'red' }} />}
                                onClick={handleLoginGG}>
                                ĐĂNG NHẬP BẰNG GOOGLE
                            </Button>
                        </div>
                        {showInputPhone ? (
                            <div className="form_input">
                                {/* <p style={{ marginBottom: '10px' }}>Nhập mật khẩu của bạn</p> */}
                                <TextField
                                    required
                                    error={validatePhone}
                                    id="outlined-required"
                                    label="Nhập số điện thoại của bạn"
                                    autoFocus
                                    size="small"
                                    color="success"
                                    fullWidth
                                    onChange={(e) => {
                                        setValidatePhone(false);
                                        setPhoneNumber(e.target.value);
                                    }}
                                />
                            </div>
                        ) : showInputOTP ? (
                            <div className="form_input">
                                <TextField
                                    required
                                    error={validateOTP}
                                    id="outlined-required"
                                    label="Nhập mã OTP"
                                    autoFocus
                                    value={otp}
                                    size="small"
                                    color="success"
                                    fullWidth
                                    onChange={(e) => {
                                        setValidateOTP(false);
                                        setOTP(e.target.value);
                                    }}
                                />
                            </div>
                        ) : null}

                        <div className="login_social-apple">
                            {showInputPhone ? (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<LocalPhoneRoundedIcon />}
                                    size="large"
                                    onClick={handleLoginPhoneNumber}>
                                    XÁC THỰC SỐ ĐIỆN THOẠI
                                </Button>
                            ) : showInputOTP ? (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<LocalPhoneRoundedIcon />}
                                    size="large"
                                    onClick={verifyOTP}>
                                    ĐĂNG NHẬP NGAY
                                </Button>
                            ) : (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<LocalPhoneRoundedIcon />}
                                    size="large"
                                    onClick={handleShowFormPhone}>
                                    ĐĂNG NHẬP BẰNG SỐ ĐIỆN THOẠI
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
