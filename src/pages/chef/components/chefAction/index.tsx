/**
 * @author tokyo
 * @date 2022-08-26 08:55
 * @since 0.1.0
 */

import React, { FC, useState, useEffect, createRef } from 'react';
import {
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
} from 'antd';
import { addChef, editChef } from 'src/api/strApi/chefAction';
import { tableDataAction } from 'src/common/types';
import classnames from 'classnames';
import style from './style.module.less';

const { Option } = Select;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

export interface ChefActionProps {
  type: 'edit' | 'add';
  data: StrApi.ResChefsListItem;
  isShow: boolean;
  dingniRoomList?: StrApi.ResDingniRoomListItem[];
  onClose: () => void;
  [key: string]: any;
}

const ChefAction: FC<ChefActionProps> = (props) => {
  const { isShow, data, type, onClose, dingniRoomList = [] } = props;
  const formRef = createRef<FormInstance>();

  useEffect(() => {
    if (!isShow) return;
    if (type === tableDataAction.edit) {
      const newData = {
        name: data.name,
        age: data.age as number,
        dingni_rooms: data.dingni_rooms?.data.map((val) => {
          return val.id;
        }),
      };
      formRef.current!.setFieldsValue(newData);
    } else {
      formRef.current!.resetFields();
    }
  }, [type, isShow, data]);

  const chefActionOne = async () => {
    const formData = formRef.current!.getFieldsValue();
    if (type === 'edit') {
      try {
        await editChef({ id: Number(data.id) }, { data: formData });
        onClose();
        message.success('修改成功');
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await addChef({ data: formData });
        onClose();
        message.success('添加成功');
      } catch (error) {
        console.log(error);
      }
    }
  };

  // const onDingniRoomsChange = (e: any) => {
  //   console.log('value:', e);
  // };

  return (
    <div>
      <Modal
        title={type}
        visible={isShow}
        onOk={chefActionOne}
        onCancel={onClose}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        <Form
          {...layout}
          ref={formRef}
          name="control-ref"
          // onFinish={onFinish}
        >
          <Form.Item name="name" label="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="age" label="age" rules={[{ required: true }]}>
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="dingni_rooms"
            label="dingni_rooms"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select chefs and change"
              // onChange={onDingniRoomsChange}
              allowClear
              mode="multiple"
            >
              {dingniRoomList.map((val) => {
                return (
                  <Option key={val.id} value={val.id}>
                    {val.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChefAction;
