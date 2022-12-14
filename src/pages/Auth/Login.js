import './Auth.scss';
import 'react-toastify/dist/ReactToastify.css';

import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    RecaptchaVerifier,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signInWithPopup,
} from 'firebase/auth';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import asyncLocalStorage from '../../utils/async_localstorage';
import Toast from '../../utils/toasts';
import ForgotPass from './ForgotPass';
import LoginPhone from './LoginPhone';
import Register from './Register';

const provider = new GoogleAuthProvider();
const providerApple = new OAuthProvider('apple.com');

export default function Login() {
    const [loginSocial, setLoginSocial] = useState(false);
    const [completeLogin, setCompleteLogin] = useState(false);

    const [registerForm, setRegisterForm] = useState(false);
    const [forgotForm, setForgotForm] = useState(false);

    const [validateEmail, setValidateEmail] = useState(false);
    const [validateEmailPass, setValidateEmailPass] = useState(false);

    const [email, setEmail] = useState('');
    const [emailPass, setEmailPass] = useState('');

    const [loginPhone, setLoginPhone] = useState(false);
    const [showInputOTP, setShowInputOTP] = useState(true);

    const [validatePhone, setValidatePhone] = useState(false);
    const [validateOTP, setValidateOTP] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');

    const [result, setResult] = useState('');
    const [otp, setOTP] = useState('');

    const [disableBtnPhoneNumber, setDisableBtPhoneNumber] = useState(false);
    const navigate = useNavigate();

    // get deviced user
    const getDeviceUser = (author, accessToken) => {
        author.getIdToken().then((data) => {
            const token = `Bearer ${data}`;
            console.log({ token });
            // let a = getDeviceUser(token);
            Toast('info', 'Vui l??ng ch???... ??ang chuy???n h?????ng!');
            // excel

            // call device
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
                            Toast('success', '????ng nh???p th??nh c??ng');
                            navigate('/home');
                            setCompleteLogin(true);
                        })
                        .catch(() => {
                            Toast('error', '???? x???y ra l???i trong qu?? tr??nh ????ng nh???p');
                            setCompleteLogin(false);
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
        setCompleteLogin(true);
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
                Toast('error', `????ng nh???p th??t b???i ${errorMessage}`);
                setCompleteLogin(false);
            });
    };

    //show input phone
    const handleShowFormPhone = (e) => {
        setLoginPhone(true);
    };

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
                Toast('error', '????ng nh???p th???t b???i');

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
                Toast('error', '????ng nh???p th???t b???i');

                // ...
            });
    };

    // const handleLoginPhoneNumber = () => {
    //     if (!phoneNumber) {
    //         setValidatePhone(true);
    //         return;
    //     }
    //     const a = phoneNumber.slice(1);
    //     const phone = '+84' + a;
    //     window.recaptchaVerifier = new RecaptchaVerifier(
    //         'recaptcha-container',
    //         {
    //             size: 'invisible',
    //         },
    //         auth
    //     );
    //     setDisableBtPhoneNumber(true);
    //     const verify = window.recaptchaVerifier;
    //     signInWithPhoneNumber(auth, phone, verify)
    //         .then((confirmationResult) => {
    //             setShowInputOTP(true);
    //             setShowInputPhone(false);
    //             setResult(confirmationResult);
    //             Toast('info', 'Vui l??ng nh???p m?? OTP');
    //             setDisableBtPhoneNumber(false);
    //         })
    //         .catch((error) => {
    //             alert(error);
    //             Toast('error', `????ng nh???p th???t b???i ${error.message} `);
    //             setDisableBtPhoneNumber(false);

    //             // Error; SMS not sent
    //             // ...
    //         });
    // };

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
                Toast('error', `????ng nh???p th???t b???i ${error.message} `);
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
            setLoginPhone(false);
        }
    };

    return (
        <>
            {registerForm === true ? (
                <Register backToLogin={backToLogin} />
            ) : forgotForm === true ? (
                <ForgotPass backToLogin={backToLogin} />
            ) : loginPhone === true ? (
                <LoginPhone backToLogin={backToLogin} />
            ) : (
                <div className="form_login">
                    {/* <img src="/image/logo_cpn.png" width={200} height={100} alt="" /> */}
                    <h1>????NG NH???P</h1>
                    <div id="recaptcha-container"></div>
                    <div>
                        <div className="form_input">
                            {/* <p style={{ marginBottom: '10px' }}>Nh???p email c???a b???n</p> */}
                            <TextField
                                required
                                error={validateEmail}
                                id="outlined-required"
                                type={'email'}
                                label="Nh???p email c???a b???n"
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
                            {/* <p style={{ marginBottom: '10px' }}>Nh???p m???t kh???u c???a b???n</p> */}
                            <TextField
                                required
                                error={validateEmailPass}
                                type={'password'}
                                id="outlined-required"
                                label="Nh???p m???t kh???u c???a b???n"
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
                                onClick={handleLoginEmail}
                                disabled={completeLogin}>
                                ????NG NH???P
                            </Button>
                        </div>
                        <div className="register_forgot">
                            <p className="register" onClick={handleRegister}>
                                ????ng k?? ngay
                            </p>
                            <p className="forgot_pass" onClick={handleForgotPass}>
                                Qu??n m???t kh???u
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
                                ????NG NH???P B???NG GOOGLE
                            </Button>
                        </div>
                        <div className="login_social-sms">
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<LocalPhoneRoundedIcon />}
                                size="medium"
                                onClick={handleShowFormPhone}>
                                ????NG NH???P B???NG SMS
                            </Button>
                        </div>
                        <div className="login_social-apple">
                            <Button
                                fullWidth
                                variant="outlined"
                                color="success"
                                size="medium"
                                style={{ fontWeight: '500', color: 'black' }}
                                startIcon={<AppleIcon sx={{ color: 'black' }} />}
                                onClick={handleLoginApple}>
                                ????NG NH???P B???NG APPLE
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// {
//     showInputPhone ? (
//         <Button
//             fullWidth
//             variant="outlined"
//             startIcon={<LocalPhoneRoundedIcon />}
//             size="medium"
//             disabled={disableBtnPhoneNumber}
//             onClick={handleLoginPhoneNumber}>
//             X??C TH???C S??? ??I???N THO???I
//         </Button>
//     ) : showInputOTP ? (
//         <Button
//             fullWidth
//             variant="outlined"
//             startIcon={<LocalPhoneRoundedIcon />}
//             size="medium"
//             onClick={verifyOTP}>
//             ????NG NH???P NGAY
//         </Button>
//     ) : (
//         <Button
//             fullWidth
//             variant="outlined"
//             startIcon={<LocalPhoneRoundedIcon />}
//             size="medium"
//             onClick={handleShowFormPhone}>
//             SMS
//         </Button>
//     );
// }

// {
//     showInputPhone ? (
//         <div className="form_input">
//             {/* <p style={{ marginBottom: '10px' }}>Nh???p m???t kh???u c???a b???n</p> */}
//             <TextField
//                 required
//                 error={validatePhone}
//                 id="outlined-required"
//                 label="Nh???p s??? ??i???n tho???i c???a b???n"
//                 autoFocus
//                 size="small"
//                 color="success"
//                 fullWidth
//                 onChange={(e) => {
//                     setValidatePhone(false);
//                     setPhoneNumber(e.target.value);
//                 }}
//             />
//         </div>
//     ) : showInputOTP ? (
//         <div className="form_input">
//             <TextField
//                 required
//                 error={validateOTP}
//                 id="outlined-required"
//                 label="Nh???p m?? OTP"
//                 autoFocus
//                 value={otp}
//                 size="small"
//                 color="success"
//                 fullWidth
//                 onChange={(e) => {
//                     setValidateOTP(false);
//                     setOTP(e.target.value);
//                 }}
//             />
//         </div>
//     ) : null;
// }
