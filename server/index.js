require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const nodemailer = require("nodemailer");

const port = process.env.PORT || 9000;
const app = express();
// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

// Send email using nodemailer
const sendEmail = (emailAddress, emailDate) => {
  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  // verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Transporter is ready to send email", success);
    }
  });
  const emailBody = {
    from: process.env.NODEMAILER_USER,
    to: emailAddress,
    subject: emailDate?.subject,
    html: `<p>${emailDate?.message}</p>`, // HTML body
  };
  //send email
  transporter.sendMail(emailBody, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(info);
      console.log("Email sent :" + info);
    }
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vu9lo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const database = client.db("plant-store");
    const userCollection = database.collection("users");
    const plantCollection = database.collection("plants");
    const orderCollection = database.collection("orders");

    //* Save or Update User to the database
    app.post("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = req.body;
      // check if user exists in db
      const isExistingUser = await userCollection.findOne(query);
      if (isExistingUser) {
        return res.send(isExistingUser);
      }
      const result = await userCollection.insertOne({
        ...user,
        role: "Customer", // default role
        createdAt: new Date(),
      });
      res.send(result);
    });

    // Verify admin middleware
    const verifyAdmin = async (req, res, next) => {
      // console.log("Data from verifyAdmin middleware --->", req.user);
      const email = req.user?.email;
      const query = { email };
      // const query = { email: "abc@gmail.com" };
      const result = await userCollection.findOne(query);
      if (!result || result?.role !== "Admin")
        return res
          .send(403)
          .send({ message: "Forbidden Access! only admin can Actions!" });
      next();
    };
    // Verify seller middleware
    const verifySeller = async (req, res, next) => {
      // console.log("Data from verifyAdmin middleware --->", req.user);
      const email = req.user?.email;
      const query = { email };
      // const query = { email: "abc@gmail.com" };
      const result = await userCollection.findOne(query);
      if (!result || result?.role !== "Seller")
        return res
          .send(403)
          .send({ message: "Forbidden Access! only seller can Actions!" });
      next();
    };

    // get all users to manage users
    app.get("/all-users/:email", verifyToken, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const query = { email: { $ne: email } };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // get all users by role
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send({ role: result?.role });
    });

    // update a user role and status
    app.patch(
      "/user/role/:email",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const { role } = req.body;
        const filter = { email };
        const updateDoc = {
          $set: { role, status: "Verified" },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    );

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // save a new plant
    app.post("/plant", verifyToken, verifySeller, async (req, res) => {
      const plant = req.body;
      const result = await plantCollection.insertOne(plant);
      res.send(result);
    });

    // get all plants
    app.get("/plants", async (req, res) => {
      const cursor = plantCollection.find({});
      const plants = await cursor.toArray();
      res.send(plants);
    });

    // get inventory data for seller
    app.get("/plants/seller", verifyToken, verifySeller, async (req, res) => {
      const email = req.user.email;
      const result = await plantCollection
        .find({ "seller.email": email })
        .toArray();
      res.send(result);
    });

    // update plant info
    app.put("/plants/:id", verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updateData,
      };
      const result = await plantCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // delete inventory plant to specific sellers
    app.delete("/plants/:id", verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.deleteOne(query);
      res.send(result);
    });
    // get a single plant by id
    app.get("/plant/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const plant = await plantCollection.findOne(query);
      res.send(plant);
    });

    // update a user role and status
    app.patch("/orders/:id", verifyToken, verifySeller, async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status },
      };
      const result = await orderCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // get all orders of a specific seller
    app.get(
      "/seller-orders/:email",
      verifyToken,
      verifySeller,
      async (req, res) => {
        const email = req.params.email;
        const query = { seller: email };
        const cursor = orderCollection.aggregate([
          { $match: query },
          {
            $addFields: {
              plantId: {
                $toObjectId: "$plantId",
              },
            },
          },
          {
            $lookup: {
              from: "plants",
              localField: "plantId",
              foreignField: "_id",
              as: "plantDetails",
            },
          },
          {
            $unwind: "$plantDetails",
          },
          {
            $addFields: {
              name: "$plantDetails.name",
            },
          },
          {
            $project: {
              plantDetails: 0,
            },
          },
        ]);
        const orders = await cursor.toArray();
        res.send(orders);
      }
    );

    // save order data in the database
    app.post("/order", verifyToken, async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
      // Send Email
      if (result?.insertedId) {
        // to customer
        sendEmail(order?.customer?.email, {
          subject: "Order Successful",
          message: `You've placed an order successfully. Transaction ID: ${result?.insertedId}`,
        });
        // to seller
        sendEmail(order?.seller, {
          subject: "Hurrah! You have an order to process",
          message: `Get the plants ready for ${order?.customer?.name}`,
        });
      }
    });

    // manage plants quantity after purchase
    app.patch("/plant/quantity/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { quantityToUpdate, status } = req.body;
      const query = { _id: new ObjectId(id) };
      let updateDoc = {
        $inc: { quantity: -quantityToUpdate },
      };
      if (status === "increase") {
        updateDoc = {
          $inc: { quantity: quantityToUpdate },
        };
      }
      const result = await plantCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // get all orders of a specific customer
    app.get("/customer-orders/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { "customer.email": email };
      const cursor = orderCollection.aggregate([
        { $match: query },
        {
          $addFields: {
            plantId: {
              $toObjectId: "$plantId",
            },
          },
        },
        {
          $lookup: {
            from: "plants",
            localField: "plantId",
            foreignField: "_id",
            as: "plantDetails",
          },
        },
        {
          $unwind: "$plantDetails",
        },
        {
          $addFields: {
            name: "$plantDetails.name",
            category: "$plantDetails.category",
            image: "$plantDetails.image",
          },
        },
        {
          $project: {
            plantDetails: 0,
          },
        },
      ]);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // cancel or delete an order
    app.delete("/order/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await orderCollection.findOne(query);
      if (order.status === "Delivered")
        return res
          .status(409)
          .send("cannot cancel once the product is delivered");
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // manage user status and role
    app.patch("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user || user?.status === "Requested") {
        return res
          .status(400)
          .send("You have already requested, wait for sometime! 👊");
      }
      const updateDoc = {
        $set: {
          status: "Requested",
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from PlantStore Server..");
});

app.listen(port, () => {
  console.log(`PlantStore is running on port ${port}`);
});
