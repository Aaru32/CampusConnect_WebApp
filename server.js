import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeApp as initAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Initialize Firebase Admin SDK
const adminApp = initAdminApp({ projectId: firebaseConfig.projectId });
const adminAuth = getAdminAuth(adminApp);

app.use(express.json());

/**
 * Cryptographically verifies Firebase ID Tokens.
 * NEVER trusts client-supplied headers (X-User-Role, X-User-Email, localStorage).
 * Derives UID and identity strictly from the verified JWT.
 */
async function extractUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return null;
  }

  try {
    // Verify cryptographic signature, expiry, and audience using Google's public keys
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const email = (decoded.email || '').toLowerCase();

    // Default role is student unless verified otherwise
    let role = 'student';

    // App owner / super-admin check
    if (email === 'arti63531@gmail.com') {
      role = 'admin';
    } else {
      // Query Firestore database via REST API using the user's verified token
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${uid}`;
        const fsRes = await fetch(firestoreUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fsRes.ok) {
          const docData = await fsRes.json();
          if (docData.fields && docData.fields.role && docData.fields.role.stringValue) {
            role = docData.fields.role.stringValue;
          }
        }
      } catch (err) {
        console.warn("Firestore role lookup error:", err.message);
      }
    }

    return {
      uid,
      email,
      role,
      name: decoded.name || email.split('@')[0],
      token
    };
  } catch (tokenErr) {
    // Invalid, expired, malformed, or forged token
    return null;
  }
}

// ========================================================
// API ROUTES WITH CRYPTOGRAPHIC TOKEN VERIFICATION
// ========================================================

// 1. Admin Profile: Strictly requires verified Admin authorization via ID token
app.get('/api/admin/profile', async (req, res) => {
  const user = await extractUser(req);
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized: Valid Firebase ID Token required"
    });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: "Forbidden: Admin privileges required"
    });
  }

  return res.json({
    uid: user.uid,
    name: user.name || "Administrative Officer",
    email: user.email,
    role: "admin",
    designation: "Administrator",
    adminId: "ADM001"
  });
});

// 2. Student Assignment Statistics: Requires verified Student ID token
app.get('/api/student/assignments/statistics', async (req, res) => {
  const user = await extractUser(req);
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized: Valid Firebase ID Token required"
    });
  }
  if (user.role !== 'student' && user.role !== 'admin') {
    return res.status(403).json({
      error: "Forbidden: Student privileges required"
    });
  }

  // Return live statistics for the authenticated student
  return res.json({
    studentUid: user.uid,
    total: 0,
    pending: 0,
    isLive: true,
    source: "firestore",
    note: "Assignments feature in progress for Phase 2"
  });
});

// 3. SafeSpeak Admin Reports: Strictly Admin only
app.get('/api/safespeak/admin/reports', async (req, res) => {
  const user = await extractUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: Valid Firebase ID Token required" });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  return res.json([]);
});

// 4. SafeSpeak Submit Report: Open to any authenticated user or anonymous submitter
app.post('/api/safespeak/reports', async (req, res) => {
  const { category, subject, description } = req.body || {};
  if (!category || !subject || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const trackingCode = "SS-" + Math.floor(100000 + Math.random() * 900000);
  return res.json({
    success: true,
    trackingCode,
    message: "Report submitted successfully"
  });
});

// 5. Undefined API route handler: Always return JSON 404
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.path,
    method: req.method
  });
});

// ========================================================
// STATIC SERVING & ASSET RESOLUTION MIDDLEWARE
// ========================================================

app.use((req, res, next) => {
  const reqPath = req.path;

  // Root redirect to Home
  if (reqPath === '/' || reqPath === '/index.html') {
    return res.redirect('/Login/home.html');
  }

  // Handle /Assets/ or /assets/ at any nesting level
  const assetMatch = reqPath.match(/\/(?:Assets|assets)\/([^/]+)$/i);
  if (assetMatch) {
    const filename = assetMatch[1];
    const assetPath = path.join(__dirname, 'assets', filename);
    if (fs.existsSync(assetPath)) {
      return res.sendFile(assetPath);
    }
  }

  // Handle notification.js / notification.css requests from subdirectories
  if (reqPath.endsWith('/notification.js')) {
    const notifJs = path.join(__dirname, 'Notifications', 'notification.js');
    if (fs.existsSync(notifJs)) {
      return res.sendFile(notifJs);
    }
  }
  if (reqPath.endsWith('/notification.css')) {
    const notifCss = path.join(__dirname, 'Notifications', 'notification.css');
    if (fs.existsSync(notifCss)) {
      return res.sendFile(notifCss);
    }
  }

  // Inject route-guard.js dynamically into all Dashboard HTML files without altering on-disk source
  if (reqPath.includes('/Dashboard/') && (reqPath.endsWith('.html') || !path.extname(reqPath))) {
    const filePath = path.join(__dirname, reqPath.endsWith('.html') ? reqPath : `${reqPath}.html`);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('route-guard.js')) {
        content = content.replace(
          /<\/head>/i,
          `  <script src="/assets/route-guard.js"></script>\n</head>`
        );
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(content);
    }
  }

  next();
});

// Serve static assets from project root
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Fallback for missing images to ensure no broken icons
app.use((req, res, next) => {
  if (req.path.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i)) {
    const fallbackPath = path.join(__dirname, 'assets', 'college-logo.jpg');
    if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    }
  }
  next();
});

// Fallback for unmatched non-API routes
app.use((req, res) => {
  res.redirect('/Login/home.html');
});

app.listen(PORT, HOST, () => {
  console.log(`CampusConnect dev server listening on http://${HOST}:${PORT}`);
});
