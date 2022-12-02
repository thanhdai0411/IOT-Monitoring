import { getAuth, signOut } from 'firebase/auth';
import Cookies from 'js-cookie';
import React from 'react';
import Toast from '../../utils/toasts';
import { useNavigate } from 'react-router-dom';
import MyButton from '../../components/MyButton';

export default function WebError() {
    const auth = getAuth();
    const navigate = useNavigate();
    const handleLogOut = () => {
        signOut(auth)
            .then(() => {
                sessionStorage.clear();
                localStorage.clear();
                Cookies.remove('auth_token');
                Toast('success', 'Khởi động lại thành công');
                navigate(0);
                navigate('/');
            })
            .catch((error) => {
                // An error happened.
                // navigate('/');
            });
    };
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '70vh',
                // marginTop: '10%',
            }}>
            <img src="/image/logo_cpn.png" alt="" width={200} />

            <p style={{ fontSize: '18px', margin: '20px 0', color: 'red' }}>
                Có lỗi xảy ra vui lòng nhấn nút khởi động lại
            </p>
            <MyButton
                name="Khởi động lại"
                fullWidth={false}
                icon={null}
                backgroundColor={'red'}
                onClick={handleLogOut}
            />
        </div>
    );
}
