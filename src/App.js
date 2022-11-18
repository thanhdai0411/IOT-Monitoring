import React, { Fragment, useId } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DefaultLayout from './components/Layout/DefaultLayout';
import { privateRoutes, publicRoutes } from './routes';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './routes/ProtectedRoute';
function App() {
    const id = useId();

    return (
        <Router>
            <ToastContainer />
            <div className="App">
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        {privateRoutes.map((route, index) => {
                            const Page = route.component;

                            let Layout;
                            if (route.layout === null) {
                                Layout = Fragment;
                            } else if (route.layout) {
                                Layout = route.layout;
                            } else {
                                Layout = DefaultLayout;
                            }

                            return (
                                <Route
                                    key={id}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}
                    </Route>
                    {publicRoutes.map((route) => {
                        const Page = route.component;

                        let Layout;
                        if (route.layout === null) {
                            Layout = Fragment;
                        } else if (route.layout) {
                            Layout = route.layout;
                        } else {
                            Layout = DefaultLayout;
                        }

                        return (
                            <Route
                                key={id}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
