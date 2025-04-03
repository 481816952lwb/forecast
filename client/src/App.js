import React from 'react';
import { Layout } from 'antd';
import FortuneCalculator from './components/FortuneCalculator';
import './styles/App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo">财运天机</div>
      </Header>
      <Content className="content">
        <div className="site-layout-content">
          <FortuneCalculator />
        </div>
      </Content>
      <Footer className="footer">财运天机 ©{new Date().getFullYear()} 由AI技术驱动</Footer>
    </Layout>
  );
}

export default App; 