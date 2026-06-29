import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, role, city, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'ProgVision Support <support@progvision.online>',
      to: email,
      subject: 'Welcome to ProgVision! Your Candidate Portal Access Details',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to ProgVision!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Welcome to the team! We are thrilled to have you join ProgVision as a <strong>${role || 'Candidate'}</strong> for the <strong>${city || 'India'}</strong> region.</p>
          <p>To get started, we have set up your official Candidate Portal. This portal will be your central hub for checking in daily, accessing your step-by-step training modules, and managing your leads.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #1e293b;">Your Login Credentials</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Portal Link:</strong> <a href="https://progvisioncrm.vercel.app/login">https://progvisioncrm.vercel.app/login</a></li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</code></li>
            </ul>
            <p style="font-size: 0.9em; color: #64748b; margin-bottom: 0;"><em>(For security purposes, you can update your password at any time in the portal).</em></p>
          </div>

          <h3>Your First Steps</h3>
          <ol>
            <li><strong>Log into the Portal:</strong> Use the link and credentials above.</li>
            <li><strong>Complete Your Profile (Required):</strong> Before you can access the main dashboard, you must complete your profile to 100%. This includes entering your identity documents, educational background, and bank account details for smooth compensation payouts.</li>
            <li><strong>Start Training (Day 1):</strong> Once your profile is complete, head over to the "My Role & Training" tab. Your Day 1 module will be unlocked immediately!</li>
          </ol>

          <p>If you have any questions, encounter any issues with the portal, or need help with your profile, please don't hesitate to reply directly to this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 0; font-weight: bold;">The ProgVision Team</p>
          <p style="margin: 0; font-size: 0.9em; color: #64748b;">support@progvision.online | <a href="https://progvisioncrm.vercel.app">www.progvision.online</a></p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Failed to send onboarding email:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
