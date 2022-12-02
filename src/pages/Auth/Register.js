import React, { useState } from 'react';
import './Auth.scss';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';

import { useNavigate } from 'react-router-dom';

import { app } from '../../config/firebase';
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    sendSignInLinkToEmail,
} from 'firebase/auth';

import Toast from '../../utils/toasts';
import generateOTP from '../../utils/generate_otp.js';

export default function Register({ backToLogin }) {
    const [validateEmail, setValidateEmail] = useState(false);
    const [validateEmailPass, setValidateEmailPass] = useState(false);
    const [validateEmailPassAgain, setValidateEmailPassAgain] = useState(false);
    const [validateUsername, setValidateUsername] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [emailPass, setEmailPass] = useState('');
    const [emailPassAgain, setEmailPassAgain] = useState('');

    const navigate = useNavigate();

    // back to login page
    const handleBackLoginPage = () => {
        backToLogin('Login');
    };

    // register email , pass, username use firebase
    const authentication = getAuth();

    // handle login equal email
    const handleRegister = () => {
        if (!username) {
            setValidateUsername(true);
            return;
        }
        if (!email) {
            setValidateEmail(true);
            return;
        }
        if (!emailPass) {
            setValidateEmailPass(true);
            return;
        }
        if (!emailPassAgain) {
            setValidateEmailPassAgain(true);
            return;
        }

        if (emailPass !== emailPassAgain) {
            Toast('error', 'Nhập lại mật khẩu không đúng. Xin thử lại');
            return;
        }

        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: 'https://datalogger.iotdaiviet.com/',
        };

        sendSignInLinkToEmail(authentication, email, actionCodeSettings)
            .then(() => {
                alert('Sent success');
                // The link was successfully sent. Inform the user.
                // Save the email locally so you don't need to ask the user for it again
                // if they open the link on the same device.
                // window.localStorage.setItem('emailForSignIn', email);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log({ error });
                // ...
            });

        // createUserWithEmailAndPassword(authentication, email, emailPass)
        //     .then((userCredential) => {
        //         updateProfile(authentication.currentUser, {
        //             displayName: username,
        //             // photoURL: 'https://example.com/jane-q-user/profile.jpg',
        //         }).then(() => {
        //             // sessionStorage.setItem(
        //             //     'auth_token',
        //             //     userCredential._tokenResponse.refreshToken
        //             // );
        //             localStorage.setItem('loginUserName', username);
        //             navigate('/home');
        //             Toast('success', 'Đăng ký thành công. Vui lòng đăng nhập');
        //         });
        //     })
        //     .catch((error) => {
        //         const errorCode = error.code;
        //         const errorMessage = error.message;
        //         console.log({ code: errorCode, message: errorMessage });
        //         Toast('error', 'Tài khoản đã tồn tại');
        //     });
    };

    return (
        <div className="form_login">
            <h1 style={{}}>ĐĂNG KÝ TÀI KHOẢN</h1>
            <div>
                <div className="form_input">
                    {/* <p style={{ marginBottom: '10px' }}>Nhập email của bạn</p> */}
                    <TextField
                        required
                        error={validateUsername}
                        id="outlined-required"
                        type={'email'}
                        label="Nhập tên đăng nhập"
                        defaultValue=""
                        size="small"
                        color="success"
                        fullWidth
                        onChange={(e) => {
                            setValidateUsername(false);
                            setUsername(e.target.value);
                        }}
                    />
                </div>
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
                <div className="form_input">
                    {/* <p style={{ marginBottom: '10px' }}>Nhập lại mật khẩu của bạn</p> */}
                    <TextField
                        required
                        error={validateEmailPassAgain}
                        type={'password'}
                        id="outlined-required"
                        label="Nhập lại mật khẩu của bạn"
                        defaultValue=""
                        size="small"
                        color="success"
                        fullWidth
                        onChange={(e) => {
                            setValidateEmailPassAgain(false);
                            setEmailPassAgain(e.target.value);
                        }}
                    />
                </div>
                <div style={{ marginTop: '5px' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        style={{ backgroundColor: '#088f81' }}
                        onClick={handleRegister}>
                        ĐĂNG KÝ NGAY
                    </Button>
                </div>
                <div style={{ marginTop: '5px' }}>
                    <p style={{ textAlign: 'center', margin: '5px 0' }}>Đã có tài khoản</p>
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
