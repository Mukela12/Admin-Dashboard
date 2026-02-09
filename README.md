# BantuRide Admin Dashboard

A modern, full-featured admin dashboard for managing the BantuRide ride-hailing platform.

## ✨ Features

### 🚀 Just Implemented (2-Day MVP)

1. **Push Notifications** 📱
   - Send notifications to all users, drivers, or passengers
   - Character limits and live preview
   - FCM integration with delivery tracking
   - Confirmation before sending

2. **Complaints Management** 📋
   - View all complaints in a table
   - Detailed complaint modal
   - Mark as resolved with notes
   - Status tracking

3. **Manual Driver Registration** 👤
   - Register drivers without mobile app
   - Phone number validation
   - Service capability selection
   - Auto-approval for admin registrations

4. **Enhanced Driver Approval** ✅
   - Confirmation dialogs before approve/deny
   - Toast notifications for feedback
   - Loading states
   - Direct Firebase integration

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)** - Technical details & troubleshooting
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Feature overview
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment guide
- **[FILES_CREATED.md](./FILES_CREATED.md)** - File structure reference

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Icons**: Heroicons

## 🎯 Key Features

### Complaints Management (`/dashboard/complaints`)
- View all user complaints
- Detailed complaint viewer
- Add resolution notes
- Mark as resolved
- Status badges

### Push Notifications (`/dashboard/notifications`)
- Send to all users, drivers, or passengers
- Character limits (title: 50, body: 200)
- Live preview
- Confirmation dialog
- Delivery tracking

### Driver Approval (`/dashboard/drivers`)
- View pending applications
- Approve with service class selection
- Deny with reason
- Confirmation dialogs
- Toast feedback

### Manual Registration (`/dashboard/drivers/new`)
- Register drivers without app
- Phone validation (+260 format)
- Service capabilities
- Auto-approval
- Firebase Auth integration

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

Set environment variables in Vercel dashboard:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed instructions.

## 🐛 Troubleshooting

### "Failed to initialize Firebase"
- Check `.env.local` exists
- Verify all environment variables are set
- Restart dev server

### "No FCM tokens found"
- Mobile apps must register FCM tokens
- Check `fcmToken` field exists in Firestore

See [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) for more troubleshooting.

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review browser console errors
3. Check Firestore console
4. Contact the development team

---

**Built with** ❤️ **for BantuRide**

**Status**: ✅ MVP Complete - Ready for Testing
