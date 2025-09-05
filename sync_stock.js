// sync_stock.js
import { Client } from "pg";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";


// ---- Postgres connection ----
const pgClient = new Client({
  user: "rits",
  host: "localhost",
  database: "gems",
  password: "tipra",
  port: 5432,
});

// ---- Mongo connection ----
const mongoUri = "mongodb://localhost:27017";
const mongoDbName = "gems";
await mongoose.connect(`${mongoUri}/${mongoDbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("✅ Connected to Mongo via Mongoose");


const sizeSchema = new mongoose.Schema(
  {
    sizeName: { type: String, required: true },
    sizes: { type: [String], required: true }, // Array of size values
  },
  { timestamps: true }
);



async function syncStock() {
  try {
    await pgClient.connect();
    console.log("✅ Connected to Postgres");

    // const mongoClient = new MongoClient(mongoUri);
    // await mongoClient.connect();
    // console.log("✅ Connected to Mongo");

    //const mongoDb = mongoClient.db(mongoDbName);
    //const sizeSetCollection = mongoDb.collection("sizes");
    const sizeSetCollection = mongoose.model("sizes", sizeSchema);

    // 1. Fetch all products from product_master
    const { rows: products } = await pgClient.query(
      "SELECT id, style_name, size_set FROM products_master"
    );

    for (const product of products) {
        const product_id = product.id;
        const sizeset_name = product.size_set;

      // 2. Fetch size set from Mongo
      const sizeSet = await sizeSetCollection.findOne({ sizeName: sizeset_name });
      if (!sizeSet) {
        console.warn(`⚠️ No size set found for ${sizeset_name} (product ${product_id})`);
        continue;
      }

      // 3. Insert stock rows if not exists
      for (const size of sizeSet.sizes) {
        const exists = await pgClient.query(
          "SELECT 1 FROM products_stock WHERE product_id=$1 AND size_label=$2",
          [product_id, size]
        );

        if (exists.rowCount === 0) {
          await pgClient.query(
            `INSERT INTO products_stock (product_id, size_label, quantity, movement_type)
             VALUES ($1, $2, $3, $4)`,
            [product_id, size,0,'INIT']
          );
          console.log(`➕ Added stock row for product ${product_id}, size ${size}`);
        } else {
          console.log(`✔️ Already exists for product ${product_id}, size ${size}`);
        }
      }
    }

   await mongoose.connection.close();
    console.log("✅ Mongo connection closed.");
    await pgClient.end();
    console.log("✅ Sync complete, connections closed.");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

syncStock();
