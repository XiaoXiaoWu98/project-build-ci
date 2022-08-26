/**
 * @author tokyo
 * @date 2022-08-24 14:41
 * @since 0.1.0
 */

import React, { FC, useEffect, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { userInfoContext } from '../../App';
import request from '../../api/request';
import classnames from 'classnames';
import { getLockr, setLockr } from '../../utils/localStr';
import { uerLogin } from 'src/api/strApi/userAction';

import style from './style.module.less';
export interface HomeProps {
  [key: string]: any;
}

const Home: FC<HomeProps> = (props) => {

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res: StrApi.ResLogin = await uerLogin({
        identifier: 'wudongjing',
        password: 'f#yxJiT56ZuFzC3',
      });

      setLockr('jwt', res.jwt);
    })();
  }, []);

  return (
    <div className={style.home}>
      home页面
      <span className={style.goJump} onClick={() => navigate('/home/chef')}>
        goChef
      </span>
      <span
        className={style.goJump}
        onClick={() => navigate('/home/dingniRoom')}
      >
        goDiningRoom
      </span>
      <div>{<Outlet />}</div>
    </div>
  );
};

export default Home;
