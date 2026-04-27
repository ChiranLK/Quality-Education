import { sendMail } from "./mailService.js";

const isTrue = (v) => String(v).toLowerCase() === "true";

// Send password reset email with token link
export const sendPasswordResetEmail = async ({ fullName, email, resetUrl }) => {
  try {
    const displayName = fullName || email;

    const subject = `Reset Your TutorConnect Password`;

    const text = `
Hi ${displayName},

You requested a password reset for your TutorConnect account.

Click the link below to reset your password (valid for 15 minutes):
${resetUrl}

If you did not request this, please ignore this email. Your password will not change.

Best regards,
TutorConnect Team
    `.trim();

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #dc2626, #f97316); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
          <p style="color: #fecaca; margin: 8px 0 0; font-size: 14px;">TutorConnect Security</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${displayName}</strong>,</p>
          <p style="color: #475569;">We received a request to reset the password for your TutorConnect account associated with <strong>${email}</strong>.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #0066cc, #0099ff); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 13px; text-align: center;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color: #0066cc; word-break: break-all;">${resetUrl}</a>
          </p>

          <div style="background: #fef9c3; padding: 12px 16px; border-radius: 6px; border-left: 3px solid #eab308; margin: 20px 0;">
            <p style="margin: 0; color: #78350f; font-size: 14px;">
              This link expires in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated security email from <strong>TutorConnect</strong>.<br/>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: email, subject, text, html });
  } catch (err) {
    console.error("Password reset email failed:", err.message);
  }
};

// Send password changed confirmation email
export const sendPasswordChangedEmail = async ({ fullName, email }) => {
  try {
    const displayName = fullName || email;
    const changedTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = `Your TutorConnect Password Was Changed`;

    const text = `
Hi ${displayName},

Your TutorConnect account password was successfully changed on ${changedTime} (Sri Lanka Time).

If you did not make this change, please contact support immediately.

Best regards,
TutorConnect Team
    `.trim();

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Changed</h1>
          <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 14px;">TutorConnect Security</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${displayName}</strong>,</p>
          <p style="color: #475569;">Your TutorConnect account password was <strong>successfully changed</strong>.</p>

          <div style="background-color: #f0fdf4; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #15803d;">Change Details</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Account:</strong> ${email}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Time:</strong> ${changedTime} (Sri Lanka Time)</p>
            <p style="margin: 4px 0; color: #16a34a;"><strong>Status:</strong> Successfully Updated</p>
          </div>

          <div style="background: #fef2f2; padding: 12px 16px; border-radius: 6px; border-left: 3px solid #dc2626; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              If you did NOT make this change, please <strong>contact support immediately</strong> as your account may be compromised.
            </p>
          </div>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated security email from <strong>TutorConnect</strong>.<br/>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: email, subject, text, html });
  } catch (err) {
    console.error("Password changed email failed:", err.message);
  }
};

// Send login notification email to the user
export const sendLoginNotificationEmail = async ({ fullName, email, role }) => {
  try {
    const displayName = fullName || email;
    const displayRole = role === "tutor" ? "Tutor" : role === "admin" ? "Admin" : "Student";
    const loginTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = `Welcome back to TutorConnect, ${displayName}!`;

    const text = `
Hi ${displayName},

You have successfully logged in to your TutorConnect account.

Account Details:
- Role: ${displayRole}
- Email: ${email}
- Login Time: ${loginTime} (Sri Lanka Time)

If this wasn't you, please change your password immediately.

Best regards,
TutorConnect Team
    `.trim();

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0066cc, #0099ff); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome Back! 👋</h1>
          <p style="color: #cce5ff; margin: 8px 0 0; font-size: 14px;">TutorConnect</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${displayName}</strong>,</p>
          <p style="color: #475569;">You have successfully logged in to your TutorConnect account.</p>

          <div style="background-color: #eff6ff; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #0066cc; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">Login Details</p>
            <p style="margin: 4px 0; color: #374151;"> <strong>Role:</strong> ${displayRole}</p>
            <p style="margin: 4px 0; color: #374151;"> <strong>Email:</strong> ${email}</p>
            <p style="margin: 4px 0; color: #374151;"> <strong>Time:</strong> ${loginTime} (Sri Lanka Time)</p>
          </div>

          <p style="color: #64748b; font-size: 14px; background: #fef9c3; padding: 12px; border-radius: 6px; border-left: 3px solid #eab308;">
             If this wasn't you, please <strong>change your password immediately</strong> and contact support.
          </p>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated security notification from <strong>TutorConnect</strong>.<br/>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: email, subject, text, html });
  } catch (err) {
    console.error("Login notification email failed:", err.message);
  }
};

export const sendFeedbackNotificationEmail = async ({
  studentName,
  studentEmail,
  tutorName,
  tutorEmail,
  rating,
  message,
  sessionId,
}) => {
  if (!isTrue(process.env.SEND_FEEDBACK_EMAIL)) return;

  // Email 1: Send to TUTOR and ADMIN
  const tutorAdminList = [];

  if (isTrue(process.env.FEEDBACK_EMAIL_TO_TUTOR) && tutorEmail) {
    tutorAdminList.push(tutorEmail);
  }

  if (isTrue(process.env.FEEDBACK_EMAIL_TO_ADMIN) && process.env.ADMIN_NOTIFY_EMAIL) {
    tutorAdminList.push(process.env.ADMIN_NOTIFY_EMAIL);
  }

  // remove duplicates
  const tutorAdminTo = [...new Set(tutorAdminList)].filter(Boolean);

  // Send notification email to tutor and admin
  if (tutorAdminTo.length > 0) {
    const tutorAdminSubject = `New Feedback: ${rating}/5 for ${tutorName || "Tutor"}`;

    const tutorAdminText = `
New feedback received

Tutor: ${tutorName || "-"} (${tutorEmail || "-"})
Student: ${studentName || "-"} (${studentEmail || "-"})
Rating: ${rating}/5
Session: ${sessionId || "-"}

Message:
${message || "-"}
    `.trim();

    const tutorAdminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">New Feedback Received</h2>
        <p><strong>Tutor:</strong> ${tutorName || "-"} (${tutorEmail || "-"})</p>
        <p><strong>Student:</strong> ${studentName || "-"} (${studentEmail || "-"})</p>
        <p><strong>Rating:</strong> <strong style="color: #f59e0b;">${rating}/5 ⭐</strong></p>
        <p><strong>Session ID:</strong> ${sessionId || "-"}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p><strong>Feedback Message:</strong></p>
        <p style="background-color: #f9fafb; padding: 12px; border-left: 4px solid #0066cc; border-radius: 4px;">
          ${String(message || "-").replace(/\n/g, "<br/>")}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280;">This is an automated notification from Quality Education Platform.</p>
      </div>
    `;

    await sendMail({
      to: tutorAdminTo.join(", "),
      subject: tutorAdminSubject,
      text: tutorAdminText,
      html: tutorAdminHtml,
    });
  }

  // Email 2: Send THANK YOU confirmation email to STUDENT
  if (isTrue(process.env.FEEDBACK_EMAIL_TO_STUDENT) && studentEmail) {
    const studentSubject = `Thank You! Your Feedback has been Received`;

    const studentText = `
Dear ${studentName || "Student"},

Thank you for submitting your feedback! Your input is vital to help our tutors improve.

Feedback Details:
- Tutor: ${tutorName || "-"}
- Rating: ${rating}/5
- Session: ${sessionId || "-"}

Your feedback will help the tutor understand how to serve you better.

Best regards,
Quality Education Team
    `.trim();

    const studentHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Thank You for Your Feedback! 🙏</h2>
        <p>Dear <strong>${studentName || "Student"}</strong>,</p>
        <p>Thank you for submitting your feedback! Your input is valuable and helps us maintain high-quality tutoring services.</p>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
          <p style="margin: 0;"><strong>Feedback Summary:</strong></p>
          <p style="margin: 5px 0;">✓ <strong>Tutor:</strong> ${tutorName || "-"}</p>
          <p style="margin: 5px 0;">✓ <strong>Rating:</strong> <strong style="color: #f59e0b;">${rating}/5 ⭐</strong></p>
          <p style="margin: 5px 0;">✓ <strong>Status:</strong> <strong style="color: #10b981;">Successfully Received</strong></p>
        </div>

        <p>Your feedback will help the tutor understand how to serve you better and improve their teaching methods.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated confirmation from <strong>Quality Education Platform</strong><br/>
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    await sendMail({
      to: studentEmail,
      subject: studentSubject,
      text: studentText,
      html: studentHtml,
    });
  }
};

// Send progress update notification — behaviour depends on who updated
// updatedByRole: 'user' (student), 'tutor', or 'admin'
export const sendProgressNotificationEmail = async ({
  studentName,
  studentEmail,
  tutorName,
  tutorEmail,
  topic,
  completionPercent,
  notes,
  sessionId,
  updatedByRole = 'tutor',
}) => {
  if (!isTrue(process.env.SEND_PROGRESS_EMAIL)) return;

  const studentRole = process.env.STUDENT_ROLE || 'user';
  const studentDidUpdate = updatedByRole === studentRole;

  const progressTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
    dateStyle: "full",
    timeStyle: "short",
  });

  const progressBar = (pct) => {
    const filled = Math.round((pct || 0) / 10);
    return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${pct || 0}%`;
  };

  // ── EMAIL 1: Student notification (only when a TUTOR updated) ───────────────
  // We skip this when the student themselves made the update (they already know)
  if (!studentDidUpdate && isTrue(process.env.PROGRESS_EMAIL_TO_STUDENT) && studentEmail) {
    const subject = `📈 Your Progress Has Been Updated — ${topic || "General"}`;

    const text = `
Hi ${studentName || "Student"},

Your tutor ${tutorName || "your tutor"} has updated your progress record.

Progress Details:
- Topic:       ${topic || "-"}
- Completion:  ${completionPercent ?? "-"}%
- Session ID:  ${sessionId || "-"}
- Updated:     ${progressTime} (Sri Lanka Time)

Notes from your tutor:
${notes || "No additional notes."}

Keep up the great work!

Best regards,
TutorConnect Team
    `.trim();

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📈 Progress Update</h1>
          <p style="color: #ddd6fe; margin: 8px 0 0; font-size: 14px;">TutorConnect — Student Report</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${studentName || "Student"}</strong>,</p>
          <p style="color: #475569;">Your tutor <strong>${tutorName || "your tutor"}</strong> has just updated your progress record.</p>

          <div style="background-color: #f5f3ff; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-weight: bold; color: #5b21b6;">Progress Details</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Topic:</strong> ${topic || "-"}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Session ID:</strong> ${sessionId || "-"}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Updated:</strong> ${progressTime} (Sri Lanka Time)</p>
          </div>

          <div style="background-color: #faf5ff; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9d5ff;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #5b21b6;">Completion</p>
            <div style="background-color: #e9d5ff; border-radius: 999px; height: 18px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #7c3aed, #a855f7); height: 100%; width: ${completionPercent ?? 0}%; border-radius: 999px;"></div>
            </div>
            <p style="text-align: right; margin: 6px 0 0; font-size: 14px; color: #6d28d9; font-weight: bold;">${completionPercent ?? 0}%</p>
          </div>

          ${notes ? `
          <div style="background-color: #f0fdf4; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-weight: bold; color: #15803d;">Tutor's Notes</p>
            <p style="margin: 0; color: #374151;">${String(notes).replace(/\n/g, "<br/>")}</p>
          </div>` : ""}

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated notification from <strong>TutorConnect</strong>.<br/>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: studentEmail, subject, text, html });
  }

  // ── EMAIL 2: Tutor email ──────────────────────────────────────────────────
  // When STUDENT updates → alert tutor that the student self-reported progress
  // When TUTOR updates  → send a simple confirmation copy
  if (isTrue(process.env.PROGRESS_EMAIL_TO_TUTOR) && tutorEmail) {
    const subject = studentDidUpdate
      ? `🔔 Student Self-Update: ${studentName || 'A student'} updated their progress — ${topic || 'General'}`
      : `✅ Progress Record Updated — ${studentName || 'Student'} (${topic || 'General'})`;

    const text = studentDidUpdate ? `
Hi ${tutorName || 'Tutor'},

Your student ${studentName || 'a student'} has self-reported their progress for the topic "${topic || '-'}".

Progress Details:
- Student:     ${studentName || '-'} (${studentEmail || '-'})
- Topic:       ${topic || '-'}
- Completion:  ${completionPercent ?? '-'}%
- Session ID:  ${sessionId || '-'}
- Updated:     ${progressTime} (Sri Lanka Time)

Notes from student:
${notes || 'No notes added.'}

Best regards,
TutorConnect Team
    `.trim() : `
Hi ${tutorName || "Tutor"},

This is a confirmation that you have updated the progress record for ${studentName || "your student"}.

Progress Details:
- Student:     ${studentName || "-"} (${studentEmail || "-"})
- Topic:       ${topic || "-"}
- Completion:  ${completionPercent ?? "-"}%
- Session ID:  ${sessionId || "-"}
- Updated:     ${progressTime} (Sri Lanka Time)

Notes:
${notes || "No notes added."}

Best regards,
TutorConnect Team
    `.trim();

    const html = studentDidUpdate ? `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Student Progress Self-Update</h1>
          <p style="color: #fef3c7; margin: 8px 0 0; font-size: 14px;">TutorConnect — Student Report</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${tutorName || "Tutor"}</strong>,</p>
          <p style="color: #475569;">Your student <strong>${studentName || "-"}</strong> has self-reported their progress for the topic <strong>${topic || "-"}</strong>.</p>

          <div style="background-color: #fffbeb; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #d97706; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-weight: bold; color: #92400e;">Progress Details</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Student:</strong> ${studentName || "-"} (${studentEmail || "-"})</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Topic:</strong> ${topic || "-"}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Session ID:</strong> ${sessionId || "-"}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Updated:</strong> ${progressTime} (Sri Lanka Time)</p>
          </div>

          <div style="background-color: #fffbeb; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fde68a;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #92400e;">Completion</p>
            <div style="background-color: #fde68a; border-radius: 999px; height: 18px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #d97706, #f59e0b); height: 100%; width: ${completionPercent ?? 0}%; border-radius: 999px;"></div>
            </div>
            <p style="text-align: right; margin: 6px 0 0; font-size: 14px; color: #92400e; font-weight: bold;">${completionPercent ?? 0}%</p>
          </div>

          ${notes ? `
          <div style="background-color: #f9fafb; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-weight: bold; color: #374151;">Student's Notes</p>
            <p style="margin: 0; color: #374151;">${String(notes).replace(/\n/g, "<br/>")}</p>
          </div>` : ""}

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated notification from <strong>TutorConnect</strong>.<br/>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    ` : `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Progress Update Confirmed</h1>
          <p style="color: #99f6e4; margin: 8px 0 0; font-size: 14px;">TutorConnect — Tutor Confirmation</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${tutorName || "Tutor"}</strong>,</p>
          <p style="color: #475569;">You have successfully updated the progress record for student <strong>${studentName || "-"}</strong>.</p>

          <div style="background-color: #f0fdfa; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #0f766e; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-weight: bold; color: #115e59;">Progress Details</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Student:</strong> ${studentName || "-"} (${studentEmail || "-"})</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Topic:</strong> ${topic || "-"}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Completion:</strong> ${completionPercent ?? "-"}%</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Session ID:</strong> ${sessionId || "-"}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Updated:</strong> ${progressTime} (Sri Lanka Time)</p>
          </div>

          ${notes ? `
          <div style="background-color: #f9fafb; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-weight: bold; color: #374151;">Your Notes</p>
            <p style="margin: 0; color: #374151;">${String(notes).replace(/\n/g, "<br/>")}</p>
          </div>` : ""}

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated confirmation from <strong>TutorConnect</strong>.<br/>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: tutorEmail, subject, text, html });
  }
};