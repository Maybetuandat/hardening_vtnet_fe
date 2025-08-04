import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Upload, message, Spin, Progress } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, CameraOutlined } from '@ant-design/icons';
import './style.scss'; // Assuming you want to use SCSS for styling
import dayjs from 'dayjs';
import { fetchApiPost, responseOk } from '../../../utils/FetchUtil';
import { ApiEnpoint } from '../../../config/ApiEnpoint';
import { ERROR_CODE, LEVEL, MEDIA_TYPE, ROLE_NAME } from '../../../config/data';
import toast, { NotifyType } from '../../../utils/Toast';
import { GlobalContext } from '../../../globalContext';
import { getUserInfo } from '../../../services/userService';
import Password from 'antd/es/input/Password';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../utils/Util';
import Avatar from 'antd/es/avatar/avatar';
import { uploadFile } from '../../../services/fileUploadService';


const { Option } = Select;

const Register = ({ onClose, data }) => {
  const [form] = Form.useForm();
  const { user } = useContext(GlobalContext)
  const [userData, setUserData] = useState({})
  const [isUpdate, setIsUpdate] = useState(false)
  const [loading, setLoading] = useState(false)
  const navi = useNavigate()

  const handleRegister = async (values) => {
    if (values.birthDay) {
      values.birthDay = values.birthDay.format('YYYY-MM-DD');
    }
    if(userData?.avatar) {
      values.avatar = userData?.avatar
    }
    const response = await fetchApiPost(ApiEnpoint.createAccount, values, MEDIA_TYPE.JSON)
    if (responseOk(response)) {
      if (response.data['status'] === ERROR_CODE.SUCCESS) {
        let message = isUpdate ? "Cập nhật tài khoản thành công" : "Tạo tài khoản thành công!"
        toast(NotifyType.SUCCESS, message)
        if (onClose) {
          onClose()
        }
      } else if (response.data['status'] === ERROR_CODE.USER_EXIST) {
        toast(NotifyType.WARNING, "Tài khoản đã tồn tại!")
      } else if (response.data['status'] === ERROR_CODE.EMAIL_ALREADY_USE) {
        toast(NotifyType.WARNING, "Email đã được sử dụng")
      } else {
        toast(NotifyType.WARNING, "Vui lòng nhập đủ thông tin!")
      }

    } else {
      toast(NotifyType.ERROR, "Có lỗi xảy ra!")
    }
  }
  const onFinish = (values) => {
    handleRegister(values)
  };

  const handleFileChange = (info) => {
    const file = info.file;
    if (file) {
      const isImage = info.file.type.startsWith('image/');
      if (!isImage) {
        message.error('Vui lòng tải ảnh!');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      setLoading(true)
      uploadFile(formData)
        .then((data) => {
          console.log(data)
          if (data?.status === 1) {
            setUserData({ ...userData, avatar: data?.url })
          } else if (data?.status === ERROR_CODE.FILE_TOO_LARGE) {
            message.warning("Vui lòng upload file dưới 10MB")
          }
          else {
            message.error('Upload image thất bại, vui lòng thử lại.');
          }
        })
        .catch((error) => {
          message.error('Upload image thất bại, vui lòng thử lại.');
        })
        .finally(() => {
          setLoading(false)
        })

    } else {
      message.error('Vui lòng tải lại ảnh!');
    }
  };


  useEffect(() => {
    if (data) {
      getUserInfo(data)
        .then(response => {
          setIsUpdate(true)
          setUserData(response)
          form.setFieldsValue({
            ...response,
            birthDay: response?.birthDay ? dayjs(response?.birthDay, 'YYYY-MM-DD') : null,
            password: null // Convert birthDay to moment if it exists
          });
        })
    } else {
      form.setFieldsValue({})
      setIsUpdate(false)
    }
  }, [data])

  return (
    <div className="register-container">
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        initialValues={{ remember: true }}
        scrollToFirstError
        className="register-form"
      >
        <div className='logo-container'>
          <h2 className='text-lg'>
            {isUpdate ? "Cập nhật " : " Tạo "}tài khoản <span>Học SQL</span>
          </h2>

        </div>
        <div className="flex justify-center mt-4 mb-4">
          <Upload
            accept="image/*"
            name="avatar"
            showUploadList={false}
            beforeUpload={() => false}
            maxCount={1}
            onChange={(info) => handleFileChange(info)}
            loading={true}
          >
            {
              loading ? (
                <div className='text-center'>
                  <Spin></Spin>
                  <p className='mt-2'>Đang tải</p>
                </div>
              ) : (
                <Avatar
                  size={120}
                  src={userData?.avatar ? userData?.avatar : '/assets/images/upload.jpg'} // Set imageUrl as the avatar source
                  shape="circle"
                >
                </Avatar>
              )
            }

          </Upload>
        </div>
        <div className='flex justify-around'>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Username is mandatory' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" className='input-form flex-1' disabled={isUpdate} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: isUpdate ? false : true, message: 'Password is mandatory' },
              { min: 6, message: 'Password must be at least 6 characters long' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" className='input-form flex-1' />
          </Form.Item>
        </div>

        <div className='flex justify-around'>
          <Form.Item
            name="firstName"
            rules={[
              { required: true, message: 'First name is mandatory' }
            ]}
          >
            <Input placeholder="First Name" className='input-form' />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[
              { required: true, message: 'Last name is mandatory' }
            ]}
          >
            <Input placeholder="Last Name" className='input-form' />
          </Form.Item>

        </div>

        <div className='flex justify-around'>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email is mandatory' },
              { type: 'email', message: 'The input is not valid E-mail!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" className='input-form' />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Phone is mandatory' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone" className='input-form' />
          </Form.Item>
        </div>

        <Form.Item
          name="birthDay"
          rules={[
            { required: true, message: 'Birth date is mandatory' }
          ]}
        >
          <DatePicker format="YYYY-MM-DD" placeholder="Birth Date" className='input-form' />
        </Form.Item>
        {userData?.createdAt && (
          <Input prefix={<CalendarOutlined />} className='input-form mb-4' value={formatDate(userData?.createdAt)} disabled={true} />
        )}
        {
          user?.role === ROLE_NAME.ADMIN && (
            <Form.Item
              name="role"
              rules={[
                { required: true, message: 'Vui lòng chọn role' }
              ]}
            >
              <Select
                placeholder="Chọn role"
                style={{ marginRight: 10 }}
                className='select-custom'
                // onChange={(value) => handleOnchangeFilter(value, 'level')}
                value={ROLE_NAME.STUDENT}
              >
                <Option value={ROLE_NAME.STUDENT}>Học sinh</Option>
                <Option value={ROLE_NAME.TEACHER}>Giảng viên</Option>
                <Option value={ROLE_NAME.ADMIN}>ADMIN</Option>
              </Select>
            </Form.Item>
          )
        }
        <Form.Item>
          <Button type="primary" htmlType="submit" className="register-form-button">
            {isUpdate ? "Cập nhật" : "Tạo"} tài khoản
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
