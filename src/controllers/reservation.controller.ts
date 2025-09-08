import { Request, Response } from 'express';
import Reservation, { IReservation, ReservationStatus } from '../models/reservation.model.ts';

// 创建新预订
export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: '创建预订失败' });
    }
  }
};

// 获取所有预订
export const getAllReservations = async (req: Request, res: Response): Promise<void> => {
  console.log('Entering getAllReservations function');
  try {
    console.log('Attempting to fetch reservations from database');
    const reservations = await Reservation.find().sort({ arrivalTime: 1 });
    console.log('Successfully fetched reservations:', reservations.length);
    res.status(200).json(reservations);
  } catch (error) {
    console.error('获取预订列表失败:', error);
    res.status(500).json({ message: '获取预订列表失败', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// 根据ID获取预订
export const getReservationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      res.status(404).json({ message: '未找到预订信息' });
      return;
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: '获取预订信息失败' });
  }
};

// 更新预订
export const updateReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    // 区分客人和员工更新权限
    const isEmployee = req.path.includes('/employee');
    const updates = req.body;

    // 如果不是员工，限制可更新的字段
    if (!isEmployee) {
      const allowedUpdates = ['guestName', 'contactInfo', 'arrivalTime', 'tableSize'];
      const actualUpdates = Object.keys(updates);
      const isValidOperation = actualUpdates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        res.status(400).json({ message: '不允许更新的字段' });
        return;
      }
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      res.status(404).json({ message: '未找到预订信息' });
      return;
    }

    res.status(200).json(reservation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: '更新预订失败' });
    }
  }
};

// 取消预订
export const cancelReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: ReservationStatus.CANCELLED },
      { new: true }
    );

    if (!reservation) {
      res.status(404).json({ message: '未找到预订信息' });
      return;
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: '取消预订失败' });
  }
};

// 按日期获取预订
export const getReservationsByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const reservations = await Reservation.find({
      arrivalTime: {
        $gte: date,
        $lt: nextDay
      }
    }).sort({ arrivalTime: 1 });

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: '按日期获取预订失败' });
  }
};

// 按状态获取预订
export const getReservationsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.params.status as ReservationStatus;
    if (!Object.values(ReservationStatus).includes(status)) {
      res.status(400).json({ message: '无效的预订状态' });
      return;
    }

    const reservations = await Reservation.find({ status }).sort({ arrivalTime: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: '按状态获取预订失败' });
  }
};