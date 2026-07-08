import "dotenv/config";

const apiUrl = process.env.API_URL;
const deviceId = process.env.DEVICE_ID || "device-001";
const sendIntervalMs = Number(process.env.SEND_INTERVAL_MS || 5000);

let sequenceNumber = 100;

function buildTelemetryEvent() {
  return {
    deviceId,
    sequenceNumber: sequenceNumber++,
    deviceTimestamp: new Date().toISOString(),
    batteryPercent: Math.floor(Math.random() * 41) + 60,
    latitude: 49.2827 + (Math.random() - 0.5) * 0.01,
    longitude: -123.1207 + (Math.random() - 0.5) * 0.01,
    networkType: "wifi"
  };
}

async function sendTelemetry() {
  const event = buildTelemetryEvent();

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });

    const body = await response.json();

    console.log({
      sequenceNumber: event.sequenceNumber,
      status: response.status,
      result: body.status,
      receivedAt: body.event.received_at
    });
  } catch (error) {
    console.error({
      sequenceNumber: event.sequenceNumber,
      error: error.message
    });
  }
}

console.log(`Starting telemetry device agent: ${deviceId}`);
console.log(`Sending telemetry to ${apiUrl} every ${sendIntervalMs}ms`);

sendTelemetry();
setInterval(sendTelemetry, sendIntervalMs);