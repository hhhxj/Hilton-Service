dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import reservationRoutes from './routes/reservation.routes.ts';



// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 全局请求日志
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// API路由
app.use('/api/reservations', reservationRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用餐厅订桌服务API' });
});

// 全局错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误捕获:', err);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 连接MongoDB并启动服务器
mongoose.connect(process.env.MONGODB_URI!, { authSource: 'admin' })
  .then(() => {
    console.log('成功连接到MongoDB数据库');
    // 监听MongoDB连接错误
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB连接错误(运行时):', err);
    });
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB连接错误(初始化):', err);
    process.exit(1);
  });

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', promise, '原因:', reason);
  process.exit(1);
});