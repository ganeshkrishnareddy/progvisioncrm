# ProgVision Candidate & Admin Onboarding Portal

This is a standalone onboarding and performance tracking website for ProgVision Digital.

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore (uses active `progvisionlive` database)
- **Authentication**: Custom client-side SHA-256 password hashing and `localStorage` session validation.

## Local Development Setup

1. **Verify Dependencies**:
   Ensure you are in the directory `d:\WebApps\Jobs Folder\progvision-portal`.
2. **Install Packages**:
   Make sure packages are installed:
   ```bash
   npm install
   ```
3. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
4. **Access the Portal**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Administrator Credentials
The database will automatically seed a default administrator user upon the first portal load:
- **Email**: `admin@progvision.online`
- **Password**: `admin@progvision`

## Candidate Registration
Candidates can sign up directly at `/signup` and select their assigned city and role (Sales Intern, BDE, BDA, Lead Gen Specialist, Digital Marketer). Their dashboard includes Check-ins, Training Schedules, CRM Lead submissions, and Profile Settings.
