import Chef from '../pages/chef';
import Home from '../pages/home';
import DingniRoom from 'src/pages/dingniRoom';

import { Navigate, RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/home',
    element: <Home />,
    children: [
      {
        path: 'dingniRoom',
        element: <DingniRoom />,
      },
      {
        path: 'chef',
        element: <Chef />,
      },
    ],
  },
  { path: '/', element: <Navigate to="/home" /> },
];
export default routes;
