import GoogleIcon from '@mui/icons-material/Google';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import './Auth.scss';

import { useNavigate } from 'react-router-dom';

import { getAuth } from 'firebase/auth';

import AppleIcon from '@mui/icons-material/Apple';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import Toast from '../../utils/toasts';
import './Auth.scss';

import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';

import {
    GoogleAuthProvider,
    OAuthProvider,
    RecaptchaVerifier,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signInWithPopup,
} from 'firebase/auth';

import asyncLocalStorage from '../../utils/async_localstorage';

const provider = new GoogleAuthProvider();
const providerApple = new OAuthProvider('apple.com');

export default function LoginSocial({ backToLogin }) {
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

    const [disableBtnPhoneNumber, setDisableBtPhoneNumber] = useState(false);
    const navigate = useNavigate();

    //show input phone
    const handleShowFormPhone = (e) => {
        setShowInputPhone(true);
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

    // login google
    const handleLoginGG = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;

                const user = result.user;

                const name = user.displayName;
                const imgUser = user.photoURL;
                localStorage.setItem('loginUserName', name);
                localStorage.setItem('imgUser', imgUser);

                getDeviceUser(user, token);
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
                Toast('error', 'Đăng nhập thất bại');

                // ...
            });
    };

    // login apple

    providerApple.addScope('email');
    providerApple.addScope('name');

    providerApple.setCustomParameters({
        // Localize the Apple authentication screen in French.
        locale: 'en_US',
    });

    const handleLoginApple = () => {
        signInWithPopup(auth, providerApple)
            .then((result) => {
                // The signed-in user info.
                const user = result.user;

                // Apple credential
                const credential = OAuthProvider.credentialFromResult(result);
                const accessToken = credential.accessToken;

                const name = user.displayName;
                const imgUser = user.photoURL;
                localStorage.setItem('loginUserName', name);
                localStorage.setItem('imgUser', imgUser);

                getDeviceUser(user, accessToken);

                // ...
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The credential that was used.
                const credential = OAuthProvider.credentialFromError(error);

                console.log({ error });
                Toast('error', 'Đăng nhập thất bại');

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
        setDisableBtPhoneNumber(true);
        const verify = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phone, verify)
            .then((confirmationResult) => {
                console.log({ confirmationResult });
                setShowInputOTP(true);
                setShowInputPhone(false);
                setResult(confirmationResult);
                Toast('info', 'Vui lòng nhập mã OTP');
                setDisableBtPhoneNumber(false);
            })
            .catch((error) => {
                alert(error);
                Toast('error', `Đăng nhập thất bại ${error.message} `);
                setDisableBtPhoneNumber(false);

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
                console.log({ user });
                localStorage.setItem('loginUserName', user.phoneNumber);
                // sessionStorage.setItem('auth_token', user.refreshToken);

                getDeviceUser(user, user.accessToken);
            })
            .catch((error) => {
                Toast('error', `Đăng nhập thất bại ${error.message} `);
            });
    };

    // back to login page
    const handleBackLoginPage = () => {
        backToLogin('Login');
    };

    return (
        <div className="form_login">
            <h1 style={{ marginBottom: '15px' }}>ĐĂNG NHẬP SOCIAL</h1>
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
                <div className="login_social-gg">
                    <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        size="medium"
                        style={{ fontWeight: '500', color: 'black' }}
                        startIcon={<AppleIcon sx={{ color: 'black' }} />}
                        onClick={handleLoginApple}>
                        ĐĂNG NHẬP BẰNG APPLE
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
                            size="medium"
                            disabled={disableBtnPhoneNumber}
                            onClick={handleLoginPhoneNumber}>
                            XÁC THỰC SỐ ĐIỆN THOẠI
                        </Button>
                    ) : showInputOTP ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LocalPhoneRoundedIcon />}
                            size="medium"
                            onClick={verifyOTP}>
                            ĐĂNG NHẬP NGAY
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LocalPhoneRoundedIcon />}
                            size="medium"
                            onClick={handleShowFormPhone}>
                            ĐĂNG NHẬP BẰNG SMS
                        </Button>
                    )}
                </div>
            </div>
            <div>
                <div style={{ marginTop: '15px' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleBackLoginPage}>
                        TRỞ VỀ ĐĂNG NHẬP
                    </Button>
                </div>
            </div>
        </div>
    );
}
