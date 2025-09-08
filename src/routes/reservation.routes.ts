import express from 'express';
import { createReservation, getAllReservations, getReservationById, updateReservation, cancelReservation, getReservationsByDate, getReservationsByStatus } from '../controllers/reservation.controller.ts';

const router = express.Router();

// 基础请求日志
router.use((req, res, next) => {
  console.log('Reservation API request received:', req.method, req.path);
  next();
});

// 客人操作路由
router.post('/', createReservation); // 创建预订
router.get('/:id', getReservationById); // 获取单个预订
router.put('/:id', updateReservation); // 更新预订(客人)
router.delete('/:id', cancelReservation); // 取消预订

// 餐厅员工操作路由
router.get('/', getAllReservations); // 获取所有预订
router.get('/date/:date', getReservationsByDate); // 按日期获取预订
router.get('/status/:status', getReservationsByStatus); // 按状态获取预订
router.put('/employee/:id', updateReservation); // 员工更新预订状态

export default router;