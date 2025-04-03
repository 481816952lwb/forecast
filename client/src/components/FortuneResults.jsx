import React from 'react';
import { Card, Row, Col, Statistic, Tag, Typography, Button } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { 
  FacebookShareButton, 
  WeiboShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  WeiboIcon,
  WhatsappIcon
} from 'react-share';
import '../styles/FortuneResults.css';

const { Title, Paragraph, Text } = Typography;

// 注册Chart.js必要的组件
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const FortuneResults = ({ data, userName }) => {
  // 准备图表数据
  const chartData = {
    labels: data.map(day => day.date),
    datasets: [
      {
        label: '财运指数',
        data: data.map(day => day.score),
        fill: false,
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        borderColor: 'rgba(255, 165, 0, 1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `财运指数: ${context.raw}/10`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        title: {
          display: true,
          text: '财运指数'
        }
      }
    }
  };

  // 生成分享URL和标题
  const shareUrl = window.location.href;
  const shareTitle = `${userName}的未来一周财运预测 - 财运天机`;

  return (
    <div className="fortune-results">
      <Title level={2}>{userName}的未来一周财运预测</Title>
      
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="share-section">
        <Text strong>分享您的财运预测:</Text>
        <div className="share-buttons">
          <FacebookShareButton url={shareUrl} quote={shareTitle}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          
          <WeiboShareButton url={shareUrl} title={shareTitle}>
            <WeiboIcon size={32} round />
          </WeiboShareButton>
          
          <WhatsappShareButton url={shareUrl} title={shareTitle}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>
      </div>
      
      <Row gutter={[16, 16]} className="fortune-cards">
        {data.map((day, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card 
              title={day.date} 
              className="fortune-card"
              extra={
                <Tag color={day.score >= 7 ? 'gold' : day.score >= 4 ? 'blue' : 'volcano'}>
                  {day.score >= 7 ? '大吉' : day.score >= 4 ? '中平' : '小凶'}
                </Tag>
              }
            >
              <Statistic
                title="财运指数"
                value={day.score}
                suffix="/10"
                prefix={<DollarOutlined />}
                valueStyle={{ 
                  color: day.score >= 7 ? '#cf1322' : day.score >= 4 ? '#3f8600' : '#999'
                }}
              />
              
              <div className="fortune-detail">
                <Paragraph><Text strong>财运描述：</Text>{day.description}</Paragraph>
                <Paragraph><Text strong>财运建议：</Text>{day.advice}</Paragraph>
                <Paragraph>
                  <Text strong>幸运数字：</Text>
                  <Tag color="purple">{day.luckyNumber}</Tag>
                </Paragraph>
                <Paragraph><Text strong>适合活动：</Text>{day.activities}</Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FortuneResults; 