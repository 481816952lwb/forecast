# 先在项目根目录运行
npm install

# 然后在服务器目录安装依赖
cd server
npm install
cd ..

# 最后启动开发服务器
npm run dev

如果仍然有问题，请尝试分别启动服务器和客户端：

# 启动服务器 (在一个终端窗口)
cd server
node server.js

# 启动客户端 (在另一个终端窗口)
cd client
npm start