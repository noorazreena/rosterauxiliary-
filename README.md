# Equipment Log Application - Auxiliary Police EcoWorld

A comprehensive equipment tracking system for auxiliary police personnel built with Next.js, TypeScript, Firebase, and Tailwind CSS.

## Features

### ✅ Equipment Deployment (Take Out)
- Select personnel from a predefined database
- Choose shift (Morning/Night)
- Track equipment with checkboxes for each item
- Digital signature authorization
- Real-time Firebase storage

### ✅ Equipment Recovery (Return)
- List all active deployments
- Item-by-item verification checkboxes
- Incident/damage reporting
- Remarks field for additional notes
- Automatic return timestamp

### ✅ Dashboard & History
- Real-time statistics
- Active deployment tracking
- Complete audit log
- Export to Excel (CSV) or PDF/Print

## Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase account (or use demo mode)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## Firebase Configuration

### Option 1: Global Variables (Production)
The application expects these global variables to be defined:
- `__firebase_config` - JSON string with Firebase config
- `__initial_auth_token` - Optional custom auth token
- `__app_id` - Application identifier

### Option 2: Environment Variables (Development)
Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_APP_ID=ecoworld-ap-log-v3
```

### Option 3: Demo Mode
The application will use a demo configuration if no Firebase config is provided. Note that authentication may fail in demo mode, but the UI will still be accessible for testing.

## Usage Guide

### 1. Taking Equipment Out (Deploy)

1. Click the **"+"** button at the bottom
2. Select **"Deploy"**
3. Choose the shift (Morning/Night)
4. Select personnel from the dropdown
5. Equipment will auto-fill - uncheck items not being taken
6. Click **"Sign Authorization"**
7. Click **"Deploy Now"**

### 2. Returning Equipment (Recovery)

1. Click the **"+"** button at the bottom
2. Select **"Recovery"**
3. Choose the staff member returning
4. Check off each item as it's returned
5. Mark **"Report Damage / Incident"** if applicable
6. Add remarks if needed
7. Click **"Confirm"**

### 3. Viewing History

1. Click the **History** icon (clock) at the bottom
2. View complete audit log with:
   - Deployment details
   - Return status
   - Incident reports
   - Item-by-item return verification
3. Export using the buttons at the top:
   - **CSV** (Excel-compatible)
   - **PDF** (Print or save as PDF)

## Authentication Status

The application displays the authentication status in the header:
- **Connecting...** - Initializing Firebase
- **● Connected** - Ready to use
- If authentication fails, helpful error messages will appear in the Deploy and Recovery sections

## Staff Database

The application includes 8 pre-configured staff members with their assigned equipment. Edit the `STAFF_DATABASE` array in `app/page.tsx` to update personnel information.

## Firebase Firestore Structure

```
artifacts/
  {appId}/
    public/
      data/
        equipment_logs/
          {documentId}:
            - timestamp (Timestamp)
            - staffName, staffId, staffRank (string)
            - shift (string: "MORNING" | "NIGHT")
            - issuedVehicle, issuedVKey, issuedWalkie, etc. (string)
            - dateStr, timeStr (string)
            - returnStatus (string: "PENDING" | "RETURNED")
            - returnTimestamp (Timestamp)
            - returnTimeStr, returnDateStr (string)
            - returnRemarks (string)
            - hasIncident (boolean)
            - returnedInventory (object: {[key]: boolean})
            - userId (string)
```

## Troubleshooting

### "Can't enter Deploy or Recovery"

**Issue**: Deploy Now and Recovery buttons not working

**Solutions**:

1. **Check Authentication Status**: Look in the header for connection status
   - If showing "Connecting..." for more than 5 seconds, there may be a Firebase config issue
   - Check browser console (F12) for error messages

2. **Verify Firebase Configuration**:
   - Ensure `.env.local` exists with correct credentials (development)
   - Verify `__firebase_config` is defined (production)
   - Check Firebase project settings match your configuration

3. **Test Anonymous Authentication**:
   - Open browser console (F12)
   - You should see successful authentication logs
   - If you see "Auth error", check Firebase Authentication settings

4. **Enable Anonymous Authentication in Firebase**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Anonymous" provider
   - Save changes

5. **Clear Browser Cache**:
   ```bash
   # Stop the dev server, then:
   rm -rf .next
   npm run dev
   ```

### Forms Don't Submit

- Ensure you've clicked "Sign Authorization" before submitting
- Check that at least one equipment item is selected
- Verify Firebase connection status in header

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Tech Stack

- **Frontend**: Next.js 16 (React 19), TypeScript
- **Backend**: Firebase Firestore, Firebase Authentication
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## License

Private use - Auxiliary Police EcoWorld

## Support

For issues or questions, check the troubleshooting section above or contact the development team.
