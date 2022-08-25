import Chef from '../pages/chef';
import DiningRoom from '../pages/diningRoom';
import Home from '../pages/home';
import { Navigate, RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/home',
    element: <Home />,
    children: [
      {
        path: 'diningRoom',
        element: <DiningRoom />,
      },
      {
        path: 'chef',
        element: <Chef />,
      },
    ],
  },
  { path: '/', element: <Navigate to="/home" /> },

  // { path: '/diningRoom', element: null }
];
export default routes;
