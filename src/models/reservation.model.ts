import mongoose, { Document, Schema } from 'mongoose';

// 定义预订状态枚举
export enum ReservationStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

// 定义预订接口
export interface IReservation extends Document {
  guestName: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  arrivalTime: Date;
  tableSize: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 创建预订模式
const ReservationSchema: Schema = new Schema({
  guestName: {
    type: String,
    required: [true, '客人姓名不能为空'],
    trim: true
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, '联系电话不能为空'],
      trim: true
    },
    email: {
      type: String,
      required: [true, '电子邮箱不能为空'],
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, '请输入有效的电子邮箱']
    }
  },
  arrivalTime: {
    type: Date,
    required: [true, '预计到达时间不能为空'],
    min: [new Date(), '到达时间不能是过去的时间']
  },
  tableSize: {
    type: Number,
    required: [true, '餐桌人数不能为空'],
    min: [1, '餐桌人数至少为1人'],
    max: [20, '餐桌人数不能超过20人']
  },
  status: {
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.REQUESTED
  }
}, {
  timestamps: true
});

// 创建索引以提高查询性能
ReservationSchema.index({ arrivalTime: 1, status: 1 });

// 导出预订模型
export default mongoose.model<IReservation>('Reservation', ReservationSchema);