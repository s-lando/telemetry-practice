import "dotenv/config";

import express, { json } from "express";
import { Pool } from "pg";

const app = express();
const port = process.env.PORT || 3000;

app.use(json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS telemetry_events (
      id SERIAL PRIMARY KEY,
      device_id TEXT NOT NULL,
      sequence_number INTEGER NOT NULL,
      device_timestamp TIMESTAMPTZ NOT NULL,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      battery_percent INTEGER,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      network_type TEXT,
      raw_payload JSONB NOT NULL,
      UNIQUE(device_id, sequence_number)
    );
  `);
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/telemetry", async (req, res) => {
  const {
    deviceId,
    sequenceNumber,
    deviceTimestamp,
    batteryPercent,
    latitude,
    longitude,
    networkType,
  } = req.body;

  if (!deviceId || sequenceNumber === undefined || !deviceTimestamp) {
    return res.status(400).json({
      error: "deviceId, sequenceNumber, and deviceTimestamp are required",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO telemetry_events (
        device_id,
        sequence_number,
        device_timestamp,
        battery_percent,
        latitude,
        longitude,
        network_type,
        raw_payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (device_id, sequence_number)
      DO NOTHING
      RETURNING *;
      `,
      [
        deviceId,
        sequenceNumber,
        deviceTimestamp,
        batteryPercent ?? null,
        latitude ?? null,
        longitude ?? null,
        networkType ?? null,
        req.body,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ status: "duplicate_ignored" });
    }

    res.status(201).json({ status: "stored", event: result.rows[0] });
  } catch (error) {
    console.error("Failed to store telemetry:", error);
    res.status(500).json({ error: "failed_to_store_telemetry" });
  }
});

setupDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Telemetry API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to set up database:", error);
    process.exit(1);
  });