import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = settings.SMTP_HOST if hasattr(settings, 'SMTP_HOST') else "smtp.gmail.com"
SMTP_PORT = settings.SMTP_PORT if hasattr(settings, 'SMTP_PORT') else 587
SMTP_USER = settings.SMTP_USER if hasattr(settings, 'SMTP_USER') else ""
SMTP_PASSWORD = settings.SMTP_PASSWORD if hasattr(settings, 'SMTP_PASSWORD') else ""
SMTP_FROM = settings.SMTP_FROM if hasattr(settings, 'SMTP_FROM') else "noreply@enhanceai.com"

def send_verification_email(email: str, token: str):
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Verify your email for {settings.PROJECT_NAME}"
    msg["From"] = SMTP_FROM
    msg["To"] = email

    html = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155;">
          <h1 style="color: #3b82f6; margin-bottom: 20px;">EnhanceAI</h1>
          <p style="font-size: 16px; color: #94a3b8;">Welcome! Please verify your email address to activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">If the button doesn't work, copy and paste this link:</p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">{verification_link}</p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
          <p style="font-size: 12px; color: #64748b;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, email, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
