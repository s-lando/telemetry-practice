# Telemetry Connectivity Lab

A small project for practicing device telemetry, API development, PostgreSQL, and reliability testing.

## What it does

A simulated device sends telemetry events to a Node.js API every few seconds. The API stores them in PostgreSQL.

```text
device agent → API → PostgreSQL
```

Each event includes a device ID, sequence number, timestamp, battery level, location, and network type.

The database prevents duplicate events from being stored by treating `deviceId` and `sequenceNumber` as a unique pair.

Next steps are testing outages, adding retries, and automating reliability tests.

## Stack

* WSL2 / Ubuntu
* Node.js and Express
* PostgreSQL in Docker
* Planned: Python and pytest for automated testing

## Run it

Start PostgreSQL:

```bash
docker compose up -d
```

Start the API:

```bash
cd api
npm run dev
```

In another terminal, start the simulated device:

```bash
cd device-agent
npm run dev
```


