import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { calculateMatchScore } from './matching';
import { upload, UPLOAD_DIR } from './upload';
import { CampusItem, Claim, ItemStatus } from './types';
import { DEMO_USERS } from './seed';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Helper to mask sensitive details for public listings
function sanitizeItemForPublic(item: CampusItem, userEmail?: string, userRole?: string): CampusItem {
  const isAuthorized = userRole === 'admin' || (userEmail && item.reporterEmail.toLowerCase() === userEmail.toLowerCase());
  
  if (isAuthorized) {
    return item;
  }

  // Mask private clues and phone numbers for public display
  return {
    ...item,
    privateSecretClue: item.privateSecretClue ? '🔒 Protected for claim verification (Visible only to reporter & authorized reviewers)' : undefined,
    reporterPhone: item.reporterPhone ? item.reporterPhone.replace(/(\d{2})\d{4}(\d{3})/, '$1****$2') : '',
    reporterEmail: item.reporterEmail ? item.reporterEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : ''
  };
}

// ==========================================
// 1. ITEMS API
// ==========================================

// GET /api/items - list items with filters
app.get('/api/items', (req: Request, res: Response) => {
  const { type, category, location, status, search, reporterEmail } = req.query;
  const userEmail = (req.headers['x-user-email'] as string) || (reporterEmail as string);
  const userRole = req.headers['x-user-role'] as string;

  const items = db.getItems({
    type: type as string,
    category: category as string,
    location: location as string,
    status: status as string,
    search: search as string,
    reporterEmail: reporterEmail as string
  });

  const sanitized = items.map(i => sanitizeItemForPublic(i, userEmail, userRole));
  res.json({ items: sanitized, total: sanitized.length });
});

// GET /api/items/:id - get single item details
app.get('/api/items/:id', (req: Request, res: Response) => {
  const item = db.getItemById(req.params.id as string);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const userEmail = req.headers['x-user-email'] as string;
  const userRole = req.headers['x-user-role'] as string;

  // Check if current user has an approved claim for this item
  const claims = db.getClaims({ itemId: item.id, status: 'approved' });
  const hasApprovedClaim = userEmail && claims.some(c => c.claimantEmail.toLowerCase() === userEmail.toLowerCase());
  const canSeeFull = userRole === 'admin' || (userEmail && item.reporterEmail.toLowerCase() === userEmail.toLowerCase()) || hasApprovedClaim;

  if (canSeeFull) {
    return res.json({ item, isAuthorized: true });
  }

  return res.json({ item: sanitizeItemForPublic(item, userEmail, userRole), isAuthorized: false });
});

// POST /api/items - report lost or found item
app.post('/api/items', upload.single('image'), (req: Request, res: Response) => {
  try {
    const body = req.body;
    const file = req.file;

    if (!body.title || !body.type || !body.category || !body.campusLocation || !body.date) {
      return res.status(400).json({ error: 'Missing required report fields' });
    }

    let imageUrl = body.imageUrl || '';
    if (file) {
      imageUrl = `/uploads/${file.filename}`;
    }

    const newItem: CampusItem = {
      id: `item-${Date.now()}-${uuidv4().substring(0, 6)}`,
      type: body.type === 'found' ? 'found' : 'lost',
      title: body.title.trim(),
      category: body.category,
      description: body.description || '',
      brand: body.brand?.trim() || undefined,
      primaryColor: body.primaryColor?.trim() || undefined,
      campusLocation: body.campusLocation.trim(),
      date: body.date,
      time: body.time?.trim() || undefined,
      imageUrl: imageUrl || undefined,
      status: 'open',
      privateSecretClue: body.privateSecretClue?.trim() || undefined,
      custodyLocation: body.custodyLocation?.trim() || undefined,
      reporterName: body.reporterName?.trim() || 'Anonymous Student',
      reporterEmail: body.reporterEmail?.trim() || 'student@campus.edu',
      reporterPhone: body.reporterPhone?.trim() || '+91 90000 00000',
      reporterRollNo: body.reporterRollNo?.trim() || 'UNREGISTERED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = db.createItem(newItem);
    res.status(201).json({ item: saved, message: 'Item reported successfully' });
  } catch (error: any) {
    console.error('Error reporting item:', error);
    res.status(500).json({ error: error.message || 'Failed to report item' });
  }
});

// PATCH /api/items/:id/status - update status
app.patch('/api/items/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['open', 'claimed', 'returned'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = db.updateItem(req.params.id as string, { status: status as ItemStatus });
  if (!updated) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ item: updated, message: `Status updated to ${status}` });
});

// DELETE /api/items/:id - delete item
app.delete('/api/items/:id', (req: Request, res: Response) => {
  const deleted = db.deleteItem(req.params.id as string);
  if (!deleted) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ message: 'Item deleted successfully' });
});

// ==========================================
// 2. FILE UPLOADS
// ==========================================
app.post('/api/upload', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// ==========================================
// 3. SMART MATCHING API
// ==========================================

// GET /api/matches/:itemId - find matching items for a specific item
app.get('/api/matches/:itemId', (req: Request, res: Response) => {
  const item = db.getItemById(req.params.itemId as string);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const allItems = db.getItems();
  const matches: any[] = [];

  if (item.type === 'lost') {
    // Compare lost item against all found items
    const foundItems = allItems.filter(i => i.type === 'found' && i.status !== 'returned');
    for (const found of foundItems) {
      const matchResult = calculateMatchScore(item, found);
      if (matchResult.eligible) {
        matches.push(matchResult);
      }
    }
  } else {
    // Compare found item against all lost items
    const lostItems = allItems.filter(i => i.type === 'lost' && i.status !== 'returned');
    for (const lost of lostItems) {
      const matchResult = calculateMatchScore(lost, item);
      if (matchResult.eligible) {
        matches.push(matchResult);
      }
    }
  }

  // Sort by highest match score
  matches.sort((a, b) => b.score - a.score);

  res.json({
    baseItem: item,
    matches,
    totalMatches: matches.length
  });
});

// GET /api/matches - global smart matches overview across campus
app.get('/api/matches', (_req: Request, res: Response) => {
  const allItems = db.getItems();
  const lostItems = allItems.filter(i => i.type === 'lost' && i.status !== 'returned');
  const foundItems = allItems.filter(i => i.type === 'found' && i.status !== 'returned');

  const allMatches: any[] = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const result = calculateMatchScore(lost, found);
      if (result.eligible && result.score >= 40) {
        allMatches.push(result);
      }
    }
  }

  // Deduplicate and sort by highest score
  allMatches.sort((a, b) => b.score - a.score);

  res.json({
    matches: allMatches,
    total: allMatches.length
  });
});

// ==========================================
// 4. CLAIMS WORKFLOW API
// ==========================================

// POST /api/claims - submit ownership claim
app.post('/api/claims', upload.single('proofImage'), (req: Request, res: Response) => {
  try {
    const body = req.body;
    const file = req.file;

    if (!body.itemId || !body.claimantName || !body.claimantEmail || !body.claimantPhone || !body.secretProofClue) {
      return res.status(400).json({ error: 'Missing required claim details or secret proof clue' });
    }

    const item = db.getItemById(body.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Found item not found' });
    }

    if (item.type !== 'found') {
      return res.status(400).json({ error: 'Claims can only be filed against Found items' });
    }

    let proofImageUrl = body.proofImageUrl || '';
    if (file) {
      proofImageUrl = `/uploads/${file.filename}`;
    }

    const newClaim: Claim = {
      id: `claim-${Date.now()}-${uuidv4().substring(0, 6)}`,
      itemId: body.itemId,
      claimantName: body.claimantName.trim(),
      claimantEmail: body.claimantEmail.trim(),
      claimantPhone: body.claimantPhone.trim(),
      claimantRollNo: body.claimantRollNo?.trim() || 'NOT_PROVIDED',
      secretProofClue: body.secretProofClue.trim(),
      proofImageUrl: proofImageUrl || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedClaim = db.createClaim(newClaim);

    // Update item status to 'claimed' while review is ongoing
    if (item.status === 'open') {
      db.updateItem(item.id, { status: 'claimed' });
    }

    res.status(201).json({
      claim: savedClaim,
      message: 'Claim submitted successfully. Finder & Campus Admin have been notified.'
    });
  } catch (error: any) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: error.message || 'Failed to submit claim' });
  }
});

// GET /api/claims - list claims
app.get('/api/claims', (req: Request, res: Response) => {
  const { itemId, claimantEmail, status } = req.query;
  const claims = db.getClaims({
    itemId: itemId as string,
    claimantEmail: claimantEmail as string,
    status: status as string
  });

  // Attach item title for convenient display
  const enriched = claims.map(c => {
    const item = db.getItemById(c.itemId);
    return {
      ...c,
      itemTitle: item?.title || 'Unknown Item',
      itemCategory: item?.category || 'General',
      itemLocation: item?.campusLocation || 'Campus',
      itemImageUrl: item?.imageUrl
    };
  });

  res.json({ claims: enriched, total: enriched.length });
});

// PATCH /api/claims/:id - approve or reject claim
app.patch('/api/claims/:id', (req: Request, res: Response) => {
  const { status, adminNote, reviewedBy } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid claim status' });
  }

  const claim = db.getClaimById(req.params.id as string);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  const updatedClaim = db.updateClaim(claim.id, {
    status,
    adminNote: adminNote || claim.adminNote,
    reviewedBy: reviewedBy || 'Campus Administrator'
  });

  // If approved, ensure item stays marked as claimed
  if (status === 'approved') {
    db.updateItem(claim.itemId, { status: 'claimed' });
  } else if (status === 'rejected') {
    // If no other approved or pending claims exist, set item back to open
    const otherActiveClaims = db.getClaims({ itemId: claim.itemId }).filter(c => c.id !== claim.id && c.status !== 'rejected');
    if (otherActiveClaims.length === 0) {
      db.updateItem(claim.itemId, { status: 'open' });
    }
  }

  res.json({
    claim: updatedClaim,
    message: status === 'approved' ? 'Claim verified and approved! Safe contact channels unlocked.' : 'Claim rejected.'
  });
});

// POST /api/items/:id/return - mark item as handed over / returned
app.post('/api/items/:id/return', (req: Request, res: Response) => {
  const item = db.getItemById(req.params.id as string);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const updated = db.updateItem(item.id, { status: 'returned' });
  res.json({ item: updated, message: 'Item safely marked as Returned and Recovered!' });
});

// ==========================================
// 5. STATS, DEMO USERS & RESET
// ==========================================

// GET /api/stats - campus analytics
app.get('/api/stats', (_req: Request, res: Response) => {
  const stats = db.getStats();
  res.json(stats);
});

// GET /api/demo/users - list demo accounts
app.get('/api/demo/users', (_req: Request, res: Response) => {
  res.json({ users: DEMO_USERS });
});

// POST /api/demo/reset - reset data
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  db.resetDatabase();
  res.json({ message: 'Database reset to default realistic campus seed data successfully.' });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Find Back API', timestamp: new Date().toISOString() });
});

// Serve static client in production if built
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Find Back Server running on http://localhost:${PORT}`);
});
