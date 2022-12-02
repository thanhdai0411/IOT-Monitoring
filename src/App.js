import React, { Fragment, useId } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DefaultLayout from './components/Layout/DefaultLayout';
import { privateRoutes, publicRoutes } from './routes';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './routes/ProtectedRoute';
import { ErrorBoundary } from 'react-error-boundary';
import WebError from './pages/WebError';

function ErrorFallback({ error, resetErrorBoundary }) {
    return <WebError />;
}

var DEBUG = false;
if (!DEBUG) {
    if (!window.console) window.console = {};
    var methods = ['log', 'debug', 'warn', 'info', 'error'];
    for (var i = 0; i < methods.length; i++) {
        console[methods[i]] = function () {};
    }
}

function App() {
    const id = useId();

    return (
        <Router>
            <ToastContainer />
            <div className="App">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
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
                </ErrorBoundary>
            </div>
        </Router>
    );
}

export default App;
