import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.resolve('public');
app.use(express.static(publicPath));

const usersDatabase = new Map<string, any>();

app.post('/api/auth/register', (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Identity credentials cannot be null.' });
    }
    
    if (usersDatabase.has(username.toLowerCase())) {
      return res.status(409).json({ success: false, error: 'Identity designation already initialized.' });
    }

    const sequenceNumber = usersDatabase.size + 1;
    const newUser = { username, isPioneer: true, joinedSequence: sequenceNumber };

    usersDatabase.set(username.toLowerCase(), { ...newUser, password });
    return res.json({ success: true, user: newUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const account = usersDatabase.get(username?.toLowerCase());

    if (!account || account.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid developer security credentials.' });
    }

    return res.json({
      success: true,
      user: {
        username: account.username,
        isPioneer: account.isPioneer,
        joinedSequence: account.joinedSequence
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/timeline', (req: any, res: any) => {
  try {
    const items = [
      { id: 1, title: "Initial System Framework Injection", author: "Tanishq Tyagi", date: "2026-06-28", confidenceScore: 98, hash: "ae084ff" },
      { id: 2, title: "Structured Pioneer Clearance Protocol", author: "Tanishq Tyagi", date: "2026-06-30", confidenceScore: 94, hash: "41bfa2c" },
      { id: 3, title: "Refactored Core Interface Geometry", author: "System Kernel", date: "2026-07-01", confidenceScore: 82, hash: "7f9bcba" }
    ];
    return res.json({ success: true, items: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/export/csv', (req: any, res: any) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=devtrace_forensic_log.csv');
  const csvContent = "id,title,author,date,confidence\n1,Initial Injection,Tanishq Tyagi,2026-06-28,98\n2,Pioneer Protocol,Tanishq Tyagi,2026-06-30,94\n3,Geometry Patch,System Kernel,2026-07-01,82";
  return res.send(csvContent);
});

// Fully compliant catch-all parameter for clean spa style asset loading
app.get('/:matchingPath*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📡 Platform server deployed online at port: ${PORT}`);
});
// Keep your existing app.listen block for local development fallback, 
// but add this exact export statement at the absolute bottom line:
export default app;