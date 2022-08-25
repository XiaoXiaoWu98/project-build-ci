import React, { createContext, useReducer } from 'react';
import routes from './router';

import { useRoutes } from 'react-router-dom';
import './App.css';
import { defaultState, userInfoReducer } from './reducer/userInfoReducer';


export let userInfoContext:any = {};

function App() {
  const [state, dispatch] = useReducer(userInfoReducer, defaultState)
  userInfoContext = createContext({state, dispatch})

  const element = useRoutes(routes);

  return <div>{element}</div>;
}

export default App;
