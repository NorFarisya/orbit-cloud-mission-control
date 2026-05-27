// server.js - Production Ready Backend
const express = require('express');
const cors = require('cors');
const axios = require("axios"); // ✅ ADDED FOR GITHUB API

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

// ============ AWS DYNAMODB SETUP ============
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';

const client = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);

// ============ GITHUB CONFIG ============
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ============ PIPELINE (SIMULATED + REAL HYBRID) ============
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
    description: "Running Jest tests",
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

// =====================================================
// 🔥 REAL GITHUB ACTIONS PIPELINE ENDPOINT
// =====================================================
app.get("/pipeline/github", async (req, res) => {
  try {
    if (!GITHUB_REPO || !GITHUB_TOKEN) {
      return res.json({
        source: "fallback",
        runs: [],
        error: "Missing GitHub credentials"
      });
    }

    const response = await axios.get(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/runs`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    const runs = response.data.workflow_runs;

    const formatted = runs.slice(0, 10).map(run => ({
      id: run.id,
      name: run.name,
      status:
        run.status === "completed"
          ? run.conclusion === "success"
            ? "completed"
            : "failed"
          : "in_progress",
      branch: run.head_branch,
      commit: run.head_commit?.message || "No commit message",
      created_at: run.created_at,
      updated_at: run.updated_at,
      duration:
        run.updated_at && run.created_at
          ? `${Math.round(
              (new Date(run.updated_at) - new Date(run.created_at)) / 1000
            )}s`
          : "N/A"
    }));

    res.json({
      source: "github-actions",
      runs: formatted
    });

  } catch (err) {
    console.log("GitHub API error:", err.message);

    res.json({
      source: "error",
      runs: [],
      error: err.message
    });
  }
});

// =====================================================
// YOUR EXISTING ENDPOINTS (UNCHANGED BELOW)
// =====================================================

function updatePipelineProgress() {
  const testStage = pipelineStages.find(s => s.id === 3);

  if (testStage.status === 'in_progress' && testStage.progress < 100) {
    testStage.progress += Math.floor(Math.random() * 10) + 5;

    if (testStage.progress >= 100) {
      testStage.status = 'completed';
    }
  }
}

setInterval(updatePipelineProgress, 5000);

app.get('/pipeline', async (req, res) => {
  const { Octokit } = require("@octokit/rest");

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  const [owner, repo] = process.env.GITHUB_REPO.split("/");

  try {
    const response = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 10,
    });

    const runs = response.data.workflow_runs.map(run => ({
      id: run.id,
      name: run.name,
      status:
        run.status === "completed"
          ? (run.conclusion === "success" ? "completed" : "failed")
          : "in_progress",
      branch: run.head_branch,
      commit: run.display_title,
      created_at: run.created_at,
      updated_at: run.updated_at,
      duration: run.run_started_at
        ? `${Math.round(
            (new Date(run.updated_at) - new Date(run.run_started_at)) / 1000
          )}s`
        : "N/A"
    }));

    res.json({
      source: "github-actions",
      runs
    });

  } catch (err) {
    res.json({
      source: "error",
      runs: [],
      error: err.message
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📍 AWS Region: ${AWS_REGION}`);
  console.log(`🔥 GitHub Pipeline endpoint ready`);
});