// src/index.ts
import express2 from "express";
import mongoose2 from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

// src/routes/reservation.routes.ts
import express from "express";

// src/models/reservation.model.ts
import mongoose, { Schema } from "mongoose";
var ReservationStatus = /* @__PURE__ */ ((ReservationStatus2) => {
  ReservationStatus2["REQUESTED"] = "requested";
  ReservationStatus2["CONFIRMED"] = "confirmed";
  ReservationStatus2["PENDING"] = "pending";
  ReservationStatus2["CANCELLED"] = "cancelled";
  return ReservationStatus2;
})(ReservationStatus || {});
var ReservationSchema = new Schema({
  guestName: {
    type: String,
    required: [true, "\u5BA2\u4EBA\u59D3\u540D\u4E0D\u80FD\u4E3A\u7A7A"],
    trim: true
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, "\u8054\u7CFB\u7535\u8BDD\u4E0D\u80FD\u4E3A\u7A7A"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "\u7535\u5B50\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A"],
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u7BB1"]
    }
  },
  arrivalTime: {
    type: Date,
    required: [true, "\u9884\u8BA1\u5230\u8FBE\u65F6\u95F4\u4E0D\u80FD\u4E3A\u7A7A"],
    min: [/* @__PURE__ */ new Date(), "\u5230\u8FBE\u65F6\u95F4\u4E0D\u80FD\u662F\u8FC7\u53BB\u7684\u65F6\u95F4"]
  },
  tableSize: {
    type: Number,
    required: [true, "\u9910\u684C\u4EBA\u6570\u4E0D\u80FD\u4E3A\u7A7A"],
    min: [1, "\u9910\u684C\u4EBA\u6570\u81F3\u5C11\u4E3A1\u4EBA"],
    max: [20, "\u9910\u684C\u4EBA\u6570\u4E0D\u80FD\u8D85\u8FC720\u4EBA"]
  },
  status: {
    type: String,
    enum: Object.values(ReservationStatus),
    default: "requested" /* REQUESTED */
  }
}, {
  timestamps: true
});
ReservationSchema.index({ arrivalTime: 1, status: 1 });
var reservation_model_default = mongoose.model("Reservation", ReservationSchema);

// src/controllers/reservation.controller.ts
var createReservation = async (req, res) => {
  try {
    const reservation = new reservation_model_default(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "\u521B\u5EFA\u9884\u8BA2\u5931\u8D25" });
    }
  }
};
var getAllReservations = async (req, res) => {
  console.log("Entering getAllReservations function");
  try {
    console.log("Attempting to fetch reservations from database");
    const reservations = await reservation_model_default.find().sort({ arrivalTime: 1 });
    console.log("Successfully fetched reservations:", reservations.length);
    res.status(200).json(reservations);
  } catch (error) {
    console.error("\u83B7\u53D6\u9884\u8BA2\u5217\u8868\u5931\u8D25:", error);
    res.status(500).json({ message: "\u83B7\u53D6\u9884\u8BA2\u5217\u8868\u5931\u8D25", error: process.env.NODE_ENV === "development" ? error.message : void 0 });
  }
};
var getReservationById = async (req, res) => {
  try {
    const reservation = await reservation_model_default.findById(req.params.id);
    if (!reservation) {
      res.status(404).json({ message: "\u672A\u627E\u5230\u9884\u8BA2\u4FE1\u606F" });
      return;
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "\u83B7\u53D6\u9884\u8BA2\u4FE1\u606F\u5931\u8D25" });
  }
};
var updateReservation = async (req, res) => {
  try {
    const isEmployee = req.path.includes("/employee");
    const updates = req.body;
    if (!isEmployee) {
      const allowedUpdates = ["guestName", "contactInfo", "arrivalTime", "tableSize"];
      const actualUpdates = Object.keys(updates);
      const isValidOperation = actualUpdates.every((update) => allowedUpdates.includes(update));
      if (!isValidOperation) {
        res.status(400).json({ message: "\u4E0D\u5141\u8BB8\u66F4\u65B0\u7684\u5B57\u6BB5" });
        return;
      }
    }
    const reservation = await reservation_model_default.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!reservation) {
      res.status(404).json({ message: "\u672A\u627E\u5230\u9884\u8BA2\u4FE1\u606F" });
      return;
    }
    res.status(200).json(reservation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "\u66F4\u65B0\u9884\u8BA2\u5931\u8D25" });
    }
  }
};
var cancelReservation = async (req, res) => {
  try {
    const reservation = await reservation_model_default.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" /* CANCELLED */ },
      { new: true }
    );
    if (!reservation) {
      res.status(404).json({ message: "\u672A\u627E\u5230\u9884\u8BA2\u4FE1\u606F" });
      return;
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "\u53D6\u6D88\u9884\u8BA2\u5931\u8D25" });
  }
};
var getReservationsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const reservations = await reservation_model_default.find({
      arrivalTime: {
        $gte: date,
        $lt: nextDay
      }
    }).sort({ arrivalTime: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: "\u6309\u65E5\u671F\u83B7\u53D6\u9884\u8BA2\u5931\u8D25" });
  }
};
var getReservationsByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    if (!Object.values(ReservationStatus).includes(status)) {
      res.status(400).json({ message: "\u65E0\u6548\u7684\u9884\u8BA2\u72B6\u6001" });
      return;
    }
    const reservations = await reservation_model_default.find({ status }).sort({ arrivalTime: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: "\u6309\u72B6\u6001\u83B7\u53D6\u9884\u8BA2\u5931\u8D25" });
  }
};

// src/routes/reservation.routes.ts
var router = express.Router();
router.use((req, res, next) => {
  console.log("Reservation API request received:", req.method, req.path);
  next();
});
router.post("/", createReservation);
router.get("/:id", getReservationById);
router.put("/:id", updateReservation);
router.delete("/:id", cancelReservation);
router.get("/", getAllReservations);
router.get("/date/:date", getReservationsByDate);
router.get("/status/:status", getReservationsByStatus);
router.put("/employee/:id", updateReservation);
var reservation_routes_default = router;

// src/index.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

// src/graphql/schema.ts
import gql from "graphql-tag";
var typeDefs = gql`
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
var resolvers = {
  Query: {
    getAllReservations: async () => {
      return new Promise((resolve, reject) => {
        getAllReservations(
          { query: {} },
          {
            status: (code) => ({
              json: (data) => {
                if (code === 200) {
                  resolve(data || []);
                } else {
                  reject(data);
                }
              }
            })
          }
        );
      }).catch(() => []);
    },
    getReservationById: async (_, { id }) => {
      return new Promise((resolve, reject) => {
        getReservationById(
          { params: { id } },
          {
            status: (code, data) => code === 200 ? resolve(data) : reject(data),
            json: (data) => data
          }
        );
      });
    }
  },
  Mutation: {
    createReservation: async (_, { input }) => {
      return new Promise((resolve, reject) => {
        createReservation(
          { body: input },
          {
            status: (code, data) => code === 201 ? resolve(data) : reject(data),
            json: (data) => data
          }
        );
      });
    },
    updateReservation: async (_, { id, input }) => {
      return new Promise((resolve, reject) => {
        updateReservation(
          { params: { id }, body: input },
          {
            status: (code, data) => code === 200 ? resolve(data) : reject(data),
            json: (data) => data
          }
        );
      });
    },
    cancelReservation: async (_, { id }) => {
      return new Promise((resolve, reject) => {
        cancelReservation(
          { params: { id } },
          {
            status: (code, data) => code === 200 ? resolve(data) : reject(data),
            json: (data) => data
          }
        );
      });
    }
  }
};

// src/index.ts
dotenv.config();
var app = express2();
var PORT = process.env.PORT || 3e3;
app.use(helmet());
app.use(cors());
app.use(express2.json());
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});
app.use("/api/reservations", reservation_routes_default);
app.get("/", (req, res) => {
  res.json({ message: "\u6B22\u8FCE\u4F7F\u7528\u9910\u5385\u8BA2\u684C\u670D\u52A1API" });
});
app.use((err, req, res, next) => {
  console.error("\u5168\u5C40\u9519\u8BEF\u6355\u83B7:", err);
  res.status(500).json({
    message: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF",
    error: process.env.NODE_ENV === "development" ? err.message : void 0
  });
});
mongoose2.connect(process.env.MONGODB_URI, { authSource: "admin" }).then(async () => {
  console.log("\u6210\u529F\u8FDE\u63A5\u5230MongoDB\u6570\u636E\u5E93");
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault()]
  });
  await server.start();
  app.use("/graphql", expressMiddleware(server));
  console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
  mongoose2.connection.on("error", (err) => {
    console.error("MongoDB\u8FDE\u63A5\u9519\u8BEF(\u8FD0\u884C\u65F6):", err);
  });
  app.listen(PORT, () => {
    console.log(`\u670D\u52A1\u5668\u8FD0\u884C\u5728 http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB\u8FDE\u63A5\u9519\u8BEF(\u521D\u59CB\u5316):", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("\u672A\u6355\u83B7\u7684\u5F02\u5E38:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("\u672A\u5904\u7406\u7684Promise\u62D2\u7EDD:", promise, "\u539F\u56E0:", reason);
  process.exit(1);
});
