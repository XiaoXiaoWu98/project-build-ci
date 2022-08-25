/**
 * @author tokyo
 * @date 2022-08-24 15:43
 * @since 0.1.0
 */

import React, { FC, useState, useEffect, useTransition } from 'react';
import classnames from 'classnames';
import request from '../../utils/request';

import style from './style.module.less';

export interface ChefProps {
  [key: string]: any;
}

const Chef: FC<ChefProps> = (props) => {
  useEffect(() => {
    request('/', { method: 'GET' });
  }, []);
  return <div>chef</div>;
};

export default Chef;
