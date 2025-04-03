import React, { useState } from 'react';
import { Form, Input, DatePicker, Button, Spin, Alert, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import FortuneResults from './FortuneResults';
import '../styles/FortuneCalculator.css';

const FortuneCalculator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fortuneData, setFortuneData] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const { name, birthdate } = values;
      const formattedDate = birthdate.format('YYYY-MM-DD');
      
      const response = await axios.post('/api/fortune', {
        name,
        birthdate: formattedDate
      });
      
      setFortuneData(response.data);
    } catch (err) {
      setError('获取财运预测失败，请稍后再试。');
      console.error('Error fetching fortune data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fortune-calculator">
      <div className="fortune-intro">
        <h1>个人财运预测</h1>
        <p>根据您的姓名和生日，AI将为您分析未来一周的财运状况</p>
      </div>
      
      <div className="input-section">
        <Form
          form={form}
          name="fortune_form"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="您的姓名"
            rules={[{ required: true, message: '请输入您的姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="birthdate"
            label="您的生日"
            rules={[{ required: true, message: '请选择您的生日' }]}
          >
            <DatePicker 
              placeholder="选择生日" 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="submit-button"
            >
              查看财运
            </Button>
          </Form.Item>
        </Form>
      </div>
      
      {error && <Alert message={error} type="error" showIcon />}
      
      {loading && (
        <div className="loading-container">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <p>正在分析您的财运，请稍候...</p>
        </div>
      )}
      
      {fortuneData && (
        <>
          <Divider orientation="center">财运预测结果</Divider>
          <FortuneResults data={fortuneData} userName={form.getFieldValue('name')} />
        </>
      )}
    </div>
  );
};

export default FortuneCalculator; 