/**
 * @author tokyo
 * @date 2022-08-24 14:41
 * @since 0.1.0
 */

import React, { FC, useState, useEffect, ReactElement, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import classnames from 'classnames';
import style from './style.module.less';
import { userInfoContext } from '../../App'
export interface HomeProps {
  [key: string]: any;
}

const Home: FC<HomeProps> = (props) => {
  const info = useContext(userInfoContext)
  console.log('info:',  info)
  return (
    <div className={style.home}>
      home页面
      <div>{<Outlet />}</div>
    </div>
  );
};

export default Home;
