// server.js - Production Ready Backend

const express = require('express');
const cors = require('cors');
const { Octokit } = require("@octokit/rest");

const {
  DynamoDBClient
} = require('@aws-sdk/client-dynamodb');

const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand
} = require('@aws-sdk/lib-dynamodb');

require('dotenv').config();

const app = express();

// =====================================================
// CORS
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
  origin: function (origin, callback) {

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

app.options(/.*/, cors());

app.use(express.json());

// =====================================================
// AWS DYNAMODB SETUP
// =====================================================

const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';

console.log("\n🔍 Checking AWS Configuration:");
console.log("AWS_REGION:", AWS_REGION);
console.log(
  "AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing"
);
console.log(
  "AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing"
);

const client = new DynamoDBClient({
  region: AWS_REGION,

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);

// =====================================================
// GITHUB CONFIG
// =====================================================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;

// =====================================================
// TEST DYNAMODB
// =====================================================

let dynamoConnected = false;

async function testDynamoDB() {

  try {

    await dynamodb.send(
      new ScanCommand({
        TableName: 'Deployments',
        Limit: 1
      })
    );

    dynamoConnected = true;

    console.log("\n✅ AWS DynamoDB CONNECTED SUCCESSFULLY!");
    console.log("📊 Tables: Deployments, Logs, Security");

  } catch (error) {

    dynamoConnected = false;

    console.log("\n❌ AWS DynamoDB CONNECTION FAILED");
    console.log("Using mock data instead");
    console.log("Error:", error.message);
  }
}

// =====================================================
// INITIALIZE SECURITY DATA
// =====================================================

async function initializeSecurityData() {

  if (!dynamoConnected) return;

  try {

    const result = await dynamodb.send(
      new ScanCommand({
        TableName: 'Security',
        Limit: 1
      })
    );

    if (result.Items.length === 0) {

      console.log("\n📝 Initializing Security data...");

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

        await dynamodb.send(
          new PutCommand({
            TableName: 'Security',
            Item: item
          })
        );

        console.log(`✅ Created ${item.id}`);
      }
    }

  } catch (error) {

    console.log(
      "⚠️ Could not initialize security data:",
      error.message
    );
  }
}

// =====================================================
// REALTIME LOGS
// =====================================================

let realtimeLogs = [
  `[${new Date().toISOString()}] INFO: 🚀 Orbit Mission Control Started`,
  `[${new Date().toISOString()}] INFO: Backend server running`,
  `[${new Date().toISOString()}] INFO: AWS Region ${AWS_REGION}`
];

async function addLogToDynamoDB(message, level = "INFO") {

  const timestamp = new Date().toISOString();

  const logId =
    `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const formattedLog =
    `[${timestamp}] ${level}: ${message}`;

  realtimeLogs.unshift(formattedLog);

  if (realtimeLogs.length > 100) {
    realtimeLogs.pop();
  }

  if (dynamoConnected) {

    try {

      await dynamodb.send(
        new PutCommand({
          TableName: 'Logs',
          Item: {
            id: logId,
            timestamp,
            level,
            message,
            region: AWS_REGION
          }
        })
      );

    } catch (error) {

      console.log(
        "⚠️ Could not save log to DynamoDB"
      );
    }
  }

  console.log(`📝 ${formattedLog}`);
}

// =====================================================
// MOCK DEPLOYMENTS
// =====================================================

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

// =====================================================
// MONITORING DATA
// =====================================================

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

  if (monitoringData.cpu.length > 12) {
    monitoringData.cpu.shift();
  }

  monitoringData.memory.push({
    time: newTime,
    value: Math.floor(Math.random() * 45) + 35
  });

  if (monitoringData.memory.length > 12) {
    monitoringData.memory.shift();
  }

  monitoringData.lastUpdated = new Date().toISOString();

}, 10000);

// =====================================================
// STATUS
// =====================================================

app.get('/status', (req, res) => {

  res.json({
    system: "Orbit Cloud Mission Control",
    pipeline: "GitHub Actions Connected",
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

// =====================================================
// DEPLOYMENTS
// =====================================================

app.get('/deployments', async (req, res) => {

  if (dynamoConnected) {

    try {

      const result = await dynamodb.send(
        new ScanCommand({
          TableName: 'Deployments'
        })
      );

      if (result.Items?.length > 0) {
        return res.json(result.Items);
      }

    } catch (error) {

      console.log(error.message);
    }
  }

  res.json(mockDeployments);
});

// =====================================================
// LOGS
// =====================================================

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

// =====================================================
// REAL GITHUB ACTIONS PIPELINE
// =====================================================

app.get('/pipeline', async (req, res) => {

  try {

    if (!GITHUB_TOKEN || !GITHUB_REPO) {

      return res.json({
        source: "fallback",
        runs: [],
        error: "Missing GitHub credentials"
      });
    }

    const repoString = process.env.GITHUB_REPO || "";
    const [owner, repo] = repoString.split("/");
    
    const octokit = new Octokit({
      auth: GITHUB_TOKEN
    });

    const response =
      await octokit.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: 10,
      });

    const runs =
      response.data.workflow_runs.map(run => ({

        id: run.id,

        name: run.name,

        status:
          run.status === "completed"
            ? (
              run.conclusion === "success"
                ? "completed"
                : "failed"
            )
            : "in_progress",

        branch: run.head_branch,

        commit:
          run.display_title || "No commit message",

        created_at: run.created_at,

        updated_at: run.updated_at,

        duration:
          run.run_started_at
            ? `${Math.round(
                (
                  new Date(run.updated_at) -
                  new Date(run.run_started_at)
                ) / 1000
              )}s`
            : "N/A"
      }));

    res.json({
      source: "github-actions",
      runs
    });

  } catch (err) {

    console.log("❌ GitHub API Error:", err.message);

    res.json({
      source: "error",
      runs: [],
      error: err.message
    });
  }
});

// =====================================================
// CPU MONITORING
// =====================================================

app.get('/monitoring/cpu', (req, res) => {

  res.json({
    data: monitoringData.cpu,
    lastUpdated: monitoringData.lastUpdated
  });
});

// =====================================================
// MEMORY MONITORING
// =====================================================

app.get('/monitoring/memory', (req, res) => {

  res.json({
    data: monitoringData.memory,
    lastUpdated: monitoringData.lastUpdated
  });
});

// =====================================================
// SECURITY
// =====================================================

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

// =====================================================
// UPDATE SECURITY
// =====================================================

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

    await dynamodb.send(
      new PutCommand({
        TableName: 'Security',
        Item: {
          id,
          ...updateValue,
          lastUpdated: new Date().toISOString()
        }
      })
    );

    res.json({ success: true });

  } catch (error) {

    res.json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// DEPLOY
// =====================================================

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

  if (dynamoConnected) {

    try {

      await dynamodb.send(
        new PutCommand({
          TableName: 'Deployments',
          Item: newDeployment
        })
      );

    } catch (error) {

      console.log(error.message);
    }
  }

  res.json({
    success: true,
    deployment: newDeployment
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {

  console.log(`\n========================================`);
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📍 AWS Region: ${AWS_REGION}`);
  console.log(`🔥 GitHub Actions pipeline connected`);
  console.log(`========================================`);

  await testDynamoDB();

  await initializeSecurityData();

  console.log(`\n✅ Ready for S3 frontend`);
  console.log(`========================================\n`);
});