/**
 * @author tokyo
 * @date 2022-08-26 09:01
 * @since 0.1.0
 */

import React, { FC, useState, useEffect, createRef } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  FormInstance,
  message,
} from 'antd';
import { tableDataAction } from 'src/common/types';
import { addDingniRoom, editDingniRoom } from 'src/api/strApi/dingniRoom';
import classnames from 'classnames';
import style from './style.module.less';

const { Option } = Select;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

export interface DingniRoomActionProps {
  type: 'edit' | 'add';
  onClose: () => void;
  data: StrApi.ResDingniRoomListItem;
  chefList: StrApi.ResChefsListItem[];
  isShow: boolean;
  [key: string]: any;
}

const DingniRoomAction: FC<DingniRoomActionProps> = (props) => {
  const { isShow, data, type, onClose, chefList } = props;

  const formRef = createRef<FormInstance>();

  useEffect(() => {
    if (!isShow) return;
    if (type === tableDataAction.edit) {
      const newData = {
        name: data.name,
        address: data.address,
        chefs: data.chefs?.data?.map((val) => {
          return val.id;
        }),
      };
      formRef.current!.setFieldsValue(newData);
    } else {
      formRef.current!.resetFields();
    }
  }, [type, isShow, data]);

  const dingniRoomActionOne = async () => {
    const formData = formRef.current!.getFieldsValue();
    if (type === 'edit') {
      try {
        await editDingniRoom({ id: Number(data.id) }, { data: formData });
        onClose();
        message.success('修改成功');
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await addDingniRoom({ data: formData });
        onClose();
        message.success('添加成功');
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onChefschange = () => {};

  return (
    <div>
      <Modal
        title={type}
        visible={isShow}
        onOk={dingniRoomActionOne}
        onCancel={onClose}
        okText="确认"
        cancelText="取消"
        maskClosable={false}
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

          <Form.Item
            name="address"
            label="address"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="chefs" label="chefs" rules={[{ required: true }]}>
            <Select
              placeholder="Select chefs and change"
              onChange={onChefschange}
              allowClear
              mode="multiple"
            >
              {chefList.map((val) => {
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

export default DingniRoomAction;
