import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock MP data
const mockMPs = [
    {
        postcode: 'SW1A 1AA',
        mp: {
            name: 'Rishi Sunak',
            constituency: 'Richmond and Northallerton',
            party: 'Conservative',
            email: 'rishi.sunak.mp@parliament.uk',
        },
    },
    {
        postcode: 'WC1E 6BT',
        mp: {
            name: 'Keir Starmer',
            constituency: 'Holborn and St Pancras',
            party: 'Labour',
            email: 'keir.starmer.mp@parliament.uk',
        },
    },
    {
        postcode: 'EC1A 1BB',
        mp: {
            name: 'Jeremy Corbyn',
            constituency: 'Islington North',
            party: 'Independent',
            email: 'jeremy.corbyn.mp@parliament.uk',
        },
    },
];

// Mock find-mp endpoint
app.post('/api/find-mp', (req, res) => {
    console.log('🔍 Mock: Finding MP for postcode:', req.body.postcode);

    const { postcode } = req.body;

    if (!postcode) {
        return res.status(400).json({ error: 'Postcode is required' });
    }

    // Normalize postcode
    const normalizedPostcode = postcode.toUpperCase().replace(/\s+/g, '');

    // Find matching MP or return a generic one
    const match = mockMPs.find(
        (m) => m.postcode.replace(/\s+/g, '') === normalizedPostcode
    );

    if (match) {
        console.log('✅ Mock: Found MP:', match.mp.name);
        return res.json({ mp: match.mp });
    }

    // Return a generic MP for any other postcode
    console.log('✅ Mock: Returning generic MP');
    res.json({
        mp: {
            name: 'Generic Test MP',
            constituency: 'Test Constituency',
            party: 'Test Party',
            email: 'test.mp@parliament.uk',
        },
    });
});

// Mock send-magic-link endpoint
app.post('/api/send-magic-link', (req, res) => {
    console.log('📧 Mock: Sending magic link to:', req.body.email);

    const { name, email, postcode, address, mp } = req.body;

    if (!name || !email || !postcode || !address || !mp) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a mock token
    const mockToken = Buffer.from(
        JSON.stringify({ email, name, postcode, address, mp, exp: Date.now() + 3600000 })
    ).toString('base64');

    const magicLink = `http://localhost:8888/verify?token=${mockToken}`;

    console.log('📧 Mock Email Content:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Subject: Confirm your campaign signature`);
    console.log('');
    console.log(`Hi ${name},`);
    console.log('');
    console.log('Thank you for taking action! Please confirm by clicking:');
    console.log(magicLink);
    console.log('');
    console.log(`Your MP: ${mp.name}, ${mp.constituency} (${mp.party})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({
        success: true,
        message: 'Magic link sent to your email',
        _mockData: {
            magicLink, // Include in dev mode for easy testing
        },
    });
});

// Mock verify-and-send endpoint
app.post('/api/verify-and-send', (req, res) => {
    console.log('✉️  Mock: Verifying token and sending email to MP');

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        // Decode mock token
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());

        console.log('✉️  Mock Email to MP:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`To: ${payload.mp.mpEmail || payload.mp.email}`);
        console.log(`CC: ${payload.email}`);
        console.log(`Subject: Urgent: Your constituent's concerns`);
        console.log('');
        console.log(`Dear ${payload.mp.mpName || payload.mp.name},`);
        console.log('');
        console.log(`I am writing as your constituent from ${payload.address}, ${payload.postcode}.`);
        console.log('');
        console.log('[Campaign message would appear here]');
        console.log('');
        console.log(`Yours sincerely,`);
        console.log(payload.name);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        res.json({
            success: true,
            message: 'Email sent to MP successfully',
        });
    } catch (error) {
        console.error('❌ Mock: Invalid token');
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'mock' });
});

app.listen(PORT, () => {
    console.log('');
    console.log('🎭 Mock API Server Running');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Listening on: http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  POST http://localhost:${PORT}/api/find-mp`);
    console.log(`  POST http://localhost:${PORT}/api/send-magic-link`);
    console.log(`  POST http://localhost:${PORT}/api/verify-and-send`);
    console.log(`  GET  http://localhost:${PORT}/health`);
    console.log('');
    console.log('💡 To use mock server, set: MOCK_API_URL=http://localhost:3001');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

