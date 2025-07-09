import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { UserProvider } from './components/UserContext';
import ReactDOM from 'react-dom/client';
import './styles.css';
import ManagerApprovalPage from './components/ManagerApprovalPage';
import Login from './components/LoginPage'
import HomePage from './components/HomePage';
import ReceiptPage from './components/ReceiptPage';
import HRPage from './components/HRPage';
import AnimatedRoutes from './components/AnimatedRoutes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AnimatedRoutes />,
    children: [
      { path: '/', element: <Login /> },
      { path: '/login', element: <Login /> },
      { path: '/home', element: <HomePage /> },
      { path: '/approveTransactions', element: <ManagerApprovalPage /> },
      { path: '/receipts', element: <ReceiptPage /> },
      { path: '/hrpage', element: <HRPage /> },
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
        <RouterProvider router={router}/>
    </UserProvider>
  </React.StrictMode>
);

