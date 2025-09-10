import gql from 'graphql-tag';
import { IReservation } from '../models/reservation.model.ts';
import * as reservationController from '../controllers/reservation.controller.ts';

// 定义GraphQL模式
export const typeDefs = gql`
  enum ReservationStatus {
    requested
    confirmed
    pending
    cancelled
  }

  type ContactInfo {
    email: String!
    phone: String!
  }

  type Reservation {
    id: ID!
    guestName: String!
    contactInfo: ContactInfo!
    arrivalTime: String!
    tableSize: Int!
    status: ReservationStatus!
    specialRequests: String
    createdAt: String!
    updatedAt: String!
  }

  input ContactInfoInput {
    email: String!
    phone: String!
  }

  input ReservationInput {
    guestName: String!
    contactInfo: ContactInfoInput!
    arrivalTime: String!
    tableSize: Int!
    status: ReservationStatus!
    specialRequests: String
  }

  type Query {
    getAllReservations: [Reservation!]!
    getReservationById(id: ID!): Reservation
  }

  type Mutation {
    createReservation(input: ReservationInput!): Reservation!
    updateReservation(id: ID!, input: ReservationInput!): Reservation
    cancelReservation(id: ID!): Reservation
  }
`;

// 定义解析器
export const resolvers = {
  Query: {
    getAllReservations: async (): Promise<IReservation[]> => {
      return new Promise((resolve, reject) => {
        reservationController.getAllReservations(
          { query: {} } as any,
          { 
            status: (code: number) => ({ 
              json: (data: any) => {
                if (code === 200) {
                  resolve(data || []);
                } else {
                  reject(data);
                }
              }
            })
          } as any
        );
      }).catch(() => []);
    },
    getReservationById: async (_: any, { id }: { id: string }): Promise<IReservation | null> => {
      return new Promise((resolve, reject) => {
        reservationController.getReservationById(
          { params: { id } } as any,
          { 
            status: (code: number, data: any) => code === 200 ? resolve(data) : reject(data),
            json: (data: any) => data
          } as any
        );
      });
    }
  },
  Mutation: {
    createReservation: async (_: any, { input }: { input: IReservation }): Promise<IReservation> => {
      return new Promise((resolve, reject) => {
        reservationController.createReservation(
          { body: input } as any,
          { 
            status: (code: number, data: any) => code === 201 ? resolve(data) : reject(data),
            json: (data: any) => data
          } as any
        );
      });
    },
    updateReservation: async (_: any, { id, input }: { id: string; input: IReservation }): Promise<IReservation | null> => {
      return new Promise((resolve, reject) => {
        reservationController.updateReservation(
          { params: { id }, body: input } as any,
          { 
            status: (code: number, data: any) => code === 200 ? resolve(data) : reject(data),
            json: (data: any) => data
          } as any
        );
      });
    },
    cancelReservation: async (_: any, { id }: { id: string }): Promise<IReservation | null> => {
      return new Promise((resolve, reject) => {
        reservationController.cancelReservation(
          { params: { id } } as any,
          { 
            status: (code: number, data: any) => code === 200 ? resolve(data) : reject(data),
            json: (data: any) => data
          } as any
        );
      });
    }
  }
};