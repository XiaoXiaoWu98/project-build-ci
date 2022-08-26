/**
 * @author tokyo
 * @date 2022-08-24 15:42
 * @since 0.1.0
 */

import React, { FC, useState, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { Button, message, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import DingniRoomAction from './components/dingniRoomAction';
import { Link, useNavigate } from 'react-router-dom';
import { tableDataAction } from 'src/common/types';
import Search from 'antd/lib/input/Search';
import { ColumnsType } from 'antd/lib/table';
import {
  deleteDingniRoomOne,
  getDingniRoomList,
} from 'src/api/strApi/dingniRoom';
import style from './style.module.less';
import { getChefsList } from 'src/api/strApi/chefAction';

export interface DiningRoomProps {
  [key: string]: any;
}
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const DiningRoom: FC<DiningRoomProps> = (props) => {
  const [dinniRoomListData, setDinniRoomListData] = useState<
    StrApi.ResDingniRoomListItem[]
  >([]);

  const [chefsListData, setChefsListData] = useState<StrApi.ResChefsListItem[]>(
    [],
  );

  const [filter, setFilter] = useState<any>({});

  const [loading, setLoading] = useState<boolean>(true);

  const [isShow, setIsShow] = useState<boolean>(false);

  const [actionData, setActionData] = useState<StrApi.ResDingniRoomListItem>(
    {},
  );

  const [type, setType] = useState<tableDataAction>(tableDataAction.add);

  const columns: ColumnsType<StrApi.ResDingniRoomListItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'createdAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'chef',
      key: 'chef',
      dataIndex: 'chef',
      render: (_, { chefs }) => (
        <>
          {chefs?.data?.map((val, index) => {
            return (
              <span key={val.id}>
                {val?.attributes?.name}
                {index !== chefs?.data.length - 1 && '、'}
              </span>
            );
          })}
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const confirm = async () => {
          setLoading(true);
          try {
            await deleteDingniRoomOne({ id: record.id as number });
            message.success(`${record.name}删除成功`);
            await initData();
          } catch (error) {
            console.log('error:', error);
          }
          setLoading(false);
        };
        return (
          <Space size="middle">
            <Tooltip title="更改">
              <a
                href="#"
                onClick={() => {
                  setActionData(record);
                  setIsShow(true);
                  setType(tableDataAction.edit);
                }}
              >
                edit
              </a>
            </Tooltip>

            <Popconfirm
              title="Are you sure to delete this task?"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="删除">
                <a href="#">Delete</a>
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    (async () => {
      await initData();
    })();
  }, [filter]);

  const initData = async () => {
    await getDingniRoomLists();
    await getChefsLists();
  };

  const getDingniRoomLists = async () => {
    setLoading(true);
    try {
      const res = await getDingniRoomList({
        filters: filter,
        populate: '*',
      });
      setDinniRoomListData(
        res.data.map((val) => {
          return { ...val.attributes, id: val.id };
        }) as StrApi.ResDingniRoomListItem[],
      );
    } catch (error) {
      console.log('error:', error);
    }
    setLoading(false);
  };

  const getChefsLists = async () => {
    setLoading(true);

    try {
      const chefsList: StrApi.ResChefsList = await getChefsList({
        populate: '*',
      });
      setChefsListData(
        chefsList.data.map((val) => {
          return { ...val.attributes, id: val.id };
        }) as StrApi.ResChefsListItem[],
      );
    } catch (error) {
      console.log('error:', error);
    }

    setLoading(false);
  };

  const onSearch = (value: string) => {
    setFilter({ name: { $contains: value } });
  };

  return (
    <div>
      <div className={style.searchAdd}>
        <div className={style.search}>
          <Search
            placeholder="input search name"
            onSearch={onSearch}
            enterButton
            width={400}
          />
        </div>

        <Button
          type="primary"
          size="large"
          key={'diningRoom'}
          onClick={() => {
            setIsShow(true);
            setActionData({});
            setType(tableDataAction.add);
          }}
        >
          +Add
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        rowKey="id"
        dataSource={dinniRoomListData}
      />

      <DingniRoomAction
        type={type}
        data={actionData}
        onClose={async () => {
          await getDingniRoomLists();
          setIsShow(false);
        }}
        chefList={chefsListData}
        isShow={isShow}
      ></DingniRoomAction>
    </div>
  );
};

export default DiningRoom;
