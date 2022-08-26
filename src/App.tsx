import React, { createContext, useReducer } from 'react';
import routes from './router';

import { useRoutes } from 'react-router-dom';
import './App.css';


export let userInfoContext:any = {};

function App() {

  const element = useRoutes(routes);

  return <div>{element}</div>;
}

export default App;
