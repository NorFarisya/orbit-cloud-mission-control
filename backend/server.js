// server.js - Production Ready Backend
const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const app = express();

// =====================================================
// CORS FIX
// =====================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://orbit-mission-control.s3-website-ap-southeast-1.amazonaws.com',
  'http://orbit-mission-control-ui.s3-website-ap-southeast-1.amazonaws.com',
  'http://orbit-mission-control-ui.s3-website.ap-southeast-1.amazonaws.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (postman/mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// IMPORTANT FOR PREFLIGHT REQUESTS
app.options('*', cors());

app.use(express.json());

// ============ AWS DYNAMODB SETUP ============
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';

console.log("\n🔍 Checking AWS Configuration:");
console.log("   AWS_REGION:", AWS_REGION);
console.log("   AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing");
console.log("   AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing");

const client = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);

// ============ TEST DYNAMODB CONNECTION ============
let dynamoConnected = false;

async function testDynamoDB() {
  try {
    await dynamodb.send(new ScanCommand({
      TableName: 'Deployments',
      Limit: 1
    }));

    dynamoConnected = true;

    console.log("\n✅ AWS DynamoDB CONNECTED SUCCESSFULLY!");
    console.log("   📊 Tables: Deployments, Logs, Security");

  } catch (error) {

    dynamoConnected = false;

    console.log("\n❌ AWS DynamoDB CONNECTION FAILED - Using Mock Data");
    console.log("   Error:", error.message);
  }
}

// ============ AUTO-CREATE SECURITY DATA ============
async function initializeSecurityData() {
  if (!dynamoConnected) return;

  try {
    const result = await dynamodb.send(new ScanCommand({
      TableName: 'Security',
      Limit: 1
    }));

    if (result.Items.length === 0) {

      console.log("\n📝 Initializing Security data in DynamoDB...");

      const securityItems = [
        {
          id: "threat_detection",
          status: "Secure",
          lastUpdated: new Date().toISOString()
        },
        {
          id: "active_sessions",
          count: 12,
          lastUpdated: new Date().toISOString()
        },
        {
          id: "firewall_status",
          status: "Active",
          lastUpdated: new Date().toISOString()
        }
      ];

      for (const item of securityItems) {
        await dynamodb.send(new PutCommand({
          TableName: 'Security',
          Item: item
        }));

        console.log(`   ✅ Created: ${item.id}`);
      }

      console.log("✅ Security data initialized in DynamoDB");
    }

  } catch (error) {
    console.log("⚠️ Could not initialize security data:", error.message);
  }
}

// ============ REAL-TIME LOGS ============
let realtimeLogs = [
  `[${new Date().toISOString()}] INFO: 🚀 Orbit Mission Control System Started`,
  `[${new Date().toISOString()}] INFO: Backend server running`,
  `[${new Date().toISOString()}] INFO: AWS Region: ${AWS_REGION} (Singapore)`,
];

async function addLogToDynamoDB(message, level = 'INFO') {

  const timestamp = new Date().toISOString();

  const logId =
    `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const formattedLog = `[${timestamp}] ${level}: ${message}`;

  realtimeLogs.unshift(formattedLog);

  if (realtimeLogs.length > 100) realtimeLogs.pop();

  if (dynamoConnected) {
    try {

      await dynamodb.send(new PutCommand({
        TableName: 'Logs',
        Item: {
          id: logId,
          timestamp,
          level,
          message,
          region: AWS_REGION
        }
      }));

    } catch (error) {
      console.log("⚠️ Could not save log to DynamoDB");
    }
  }

  console.log(`📝 LOG: ${formattedLog}`);
}

// ============ CI/CD PIPELINE ============
let pipelineStages = [
  {
    id: 1,
    name: "🔍 Source Checkout",
    status: "completed",
    progress: 100,
    description: "Code pulled from GitHub",
    command: "git clone"
  },
  {
    id: 2,
    name: "📦 Install Dependencies",
    status: "completed",
    progress: 100,
    description: "npm ci completed",
    command: "npm ci"
  },
  {
    id: 3,
    name: "🧪 Run Tests",
    status: "in_progress",
    progress: 65,
    description: "Running Jest tests (24/36)",
    command: "npm test"
  },
  {
    id: 4,
    name: "🏗️ Build Application",
    status: "pending",
    progress: 0,
    description: "Waiting for tests",
    command: "npm run build"
  },
  {
    id: 5,
    name: "☁️ Deploy to S3",
    status: "pending",
    progress: 0,
    description: "Waiting for build",
    command: "aws s3 sync"
  },
  {
    id: 6,
    name: "🌐 Invalidate CloudFront",
    status: "pending",
    progress: 0,
    description: "Waiting for deploy",
    command: "aws cloudfront"
  }
];

function updatePipelineProgress() {

  const testStage = pipelineStages.find(s => s.id === 3);

  if (testStage.status === 'in_progress' && testStage.progress < 100) {

    testStage.progress =
      Math.min(
        100,
        testStage.progress + Math.floor(Math.random() * 10) + 5
      );

    testStage.description =
      `Running Jest tests (${Math.floor(testStage.progress / 100 * 36)}/36)`;

    if (testStage.progress >= 100) {

      testStage.status = 'completed';

      addLogToDynamoDB(
        "All tests passed! (36/36)",
        "SUCCESS"
      );

      const buildStage = pipelineStages.find(s => s.id === 4);

      buildStage.status = 'in_progress';
      buildStage.progress = 0;
      buildStage.description = "Building React application...";

      addLogToDynamoDB("Build stage started", "INFO");
    }
  }

  const buildStage = pipelineStages.find(s => s.id === 4);

  if (buildStage.status === 'in_progress' && buildStage.progress < 100) {

    buildStage.progress =
      Math.min(
        100,
        buildStage.progress + Math.floor(Math.random() * 15) + 5
      );

    buildStage.description = `Building (${buildStage.progress}%)`;

    if (buildStage.progress >= 100) {

      buildStage.status = 'completed';

      addLogToDynamoDB(
        "Build completed! Bundle size: 2.3MB",
        "SUCCESS"
      );

      const deployStage = pipelineStages.find(s => s.id === 5);

      deployStage.status = 'in_progress';
      deployStage.progress = 0;
      deployStage.description = "Uploading to S3...";

      addLogToDynamoDB("Deploy stage started", "INFO");
    }
  }

  const deployStage = pipelineStages.find(s => s.id === 5);

  if (deployStage.status === 'in_progress' && deployStage.progress < 100) {

    deployStage.progress =
      Math.min(
        100,
        deployStage.progress + Math.floor(Math.random() * 20) + 10
      );

    deployStage.description = `Uploading (${deployStage.progress}%)`;

    if (deployStage.progress >= 100) {

      deployStage.status = 'completed';

      addLogToDynamoDB(
        "S3 deployment complete! 247 files uploaded",
        "SUCCESS"
      );

      const cfStage = pipelineStages.find(s => s.id === 6);

      cfStage.status = 'in_progress';
      cfStage.progress = 50;
      cfStage.description = "Invalidating CloudFront...";

      setTimeout(() => {

        cfStage.status = 'completed';
        cfStage.progress = 100;
        cfStage.description = "Cache invalidation complete ✅";

        addLogToDynamoDB(
          "Pipeline completed successfully! 🎉",
          "SUCCESS"
        );

      }, 15000);
    }
  }
}

setInterval(updatePipelineProgress, 5000);

// ============ MOCK DATA ============
let mockDeployments = [
  {
    id: "dep_001",
    status: "✅ Success",
    time: new Date().toISOString(),
    version: "v2.1.0"
  },
  {
    id: "dep_002",
    status: "✅ Success",
    time: new Date().toISOString(),
    version: "v2.0.9"
  },
  {
    id: "dep_003",
    status: "❌ Failed",
    time: new Date().toISOString(),
    version: "v2.0.8"
  }
];

// ============ MONITORING DATA ============
let monitoringData = {

  cpu: Array.from({ length: 12 }, (_, i) => ({
    time: new Date(
      Date.now() - (11 - i) * 5 * 60000
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: Math.floor(Math.random() * 40) + 30
  })),

  memory: Array.from({ length: 12 }, (_, i) => ({
    time: new Date(
      Date.now() - (11 - i) * 5 * 60000
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: Math.floor(Math.random() * 40) + 40
  })),

  lastUpdated: new Date().toISOString()
};

setInterval(() => {

  const newTime =
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  monitoringData.cpu.push({
    time: newTime,
    value: Math.floor(Math.random() * 50) + 25
  });

  if (monitoringData.cpu.length > 12)
    monitoringData.cpu.shift();

  monitoringData.memory.push({
    time: newTime,
    value: Math.floor(Math.random() * 45) + 35
  });

  if (monitoringData.memory.length > 12)
    monitoringData.memory.shift();

  monitoringData.lastUpdated = new Date().toISOString();

}, 10000);

// ============ API ENDPOINTS ============

app.get('/status', (req, res) => {

  res.json({
    system: "Orbit Cloud Mission Control",
    pipeline: "Active",
    latestBuild: "Success",
    deployments: mockDeployments.length,
    cloudHealth: "98%",
    aws: dynamoConnected
      ? `Connected (${AWS_REGION})`
      : "Mock Data",
    region: AWS_REGION,
    timestamp: new Date().toISOString()
  });
});

app.get('/deployments', async (req, res) => {

  if (dynamoConnected) {
    try {

      const result = await dynamodb.send(
        new ScanCommand({
          TableName: 'Deployments'
        })
      );

      if (result.Items?.length > 0)
        return res.json(result.Items);

    } catch (error) {
      console.log(error.message);
    }
  }

  res.json(mockDeployments);
});

app.get('/logs', async (req, res) => {

  if (dynamoConnected) {
    try {

      const result = await dynamodb.send(
        new ScanCommand({
          TableName: 'Logs'
        })
      );

      if (result.Items?.length > 0) {

        const formatted = result.Items.map(log =>
          `[${new Date(log.timestamp).toLocaleString()}] ${log.level}: ${log.message}`
        );

        return res.json(formatted);
      }

    } catch (error) {
      console.log(error.message);
    }
  }

  res.json(realtimeLogs);
});

app.get('/pipeline', (req, res) => {
  res.json(pipelineStages);
});

app.get('/monitoring/cpu', (req, res) => {
  res.json({
    data: monitoringData.cpu,
    lastUpdated: monitoringData.lastUpdated
  });
});

app.get('/monitoring/memory', (req, res) => {
  res.json({
    data: monitoringData.memory,
    lastUpdated: monitoringData.lastUpdated
  });
});

app.get('/security', async (req, res) => {

  if (dynamoConnected) {

    try {

      const result = await dynamodb.send(
        new ScanCommand({
          TableName: 'Security'
        })
      );

      const items = result.Items || [];

      const securityData = {};

      items.forEach(item => {
        securityData[item.id] = item;
      });

      return res.json({
        threatDetection:
          securityData.threat_detection?.status || "Secure",

        activeSessions:
          securityData.active_sessions?.count || 12,

        firewallStatus:
          securityData.firewall_status?.status || "Active",

        source: "DynamoDB",
        region: AWS_REGION
      });

    } catch (error) {
      console.log(error.message);
    }
  }

  res.json({
    threatDetection: "Secure",
    activeSessions: 12,
    firewallStatus: "Active",
    source: "Mock",
    region: AWS_REGION
  });
});

app.post('/security/update', async (req, res) => {

  const { type, value } = req.body;

  try {

    let id;
    let updateValue;

    if (type === 'threatDetection') {
      id = 'threat_detection';
      updateValue = { status: value };
    }

    else if (type === 'activeSessions') {
      id = 'active_sessions';
      updateValue = { count: parseInt(value) };
    }

    else if (type === 'firewallStatus') {
      id = 'firewall_status';
      updateValue = { status: value };
    }

    await dynamodb.send(new PutCommand({
      TableName: 'Security',
      Item: {
        id,
        ...updateValue,
        lastUpdated: new Date().toISOString()
      }
    }));

    res.json({ success: true });

  } catch (error) {

    res.json({
      success: false,
      error: error.message
    });
  }
});

app.post('/deploy', async (req, res) => {

  const newDeployment = {
    id: `dep_${Date.now()}`,
    status: "✅ Success",
    time: new Date().toISOString(),
    version: `v2.2.${mockDeployments.length + 1}`
  };

  mockDeployments.unshift(newDeployment);

  await addLogToDynamoDB(
    `New deployment ${newDeployment.id} triggered`,
    "INFO"
  );

  pipelineStages.forEach(s => {

    if (s.id === 1 || s.id === 2)
      s.status = "completed";

    else if (s.id === 3)
      s.status = "in_progress";

    else {
      s.status = "pending";
      s.progress = 0;
    }
  });

  if (dynamoConnected) {
    try {

      await dynamodb.send(new PutCommand({
        TableName: 'Deployments',
        Item: newDeployment
      }));

    } catch (error) {
      console.log(error.message);
    }
  }

  res.json({
    success: true,
    deployment: newDeployment
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {

  console.log(`\n========================================`);
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📍 AWS Region: ${AWS_REGION} (Singapore)`);
  console.log(`========================================`);

  await testDynamoDB();

  await initializeSecurityData();

  console.log(`\n✅ Ready for S3 frontend!`);
  console.log(`========================================\n`);
});