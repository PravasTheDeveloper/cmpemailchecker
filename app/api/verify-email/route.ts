import { NextRequest, NextResponse } from 'next/server';
import validator from 'validator';
import { promises as dns } from 'dns';
import * as net from 'net';

interface VerificationResult {
  isValid: boolean;
  email: string;
  format: {
    isValid: boolean;
    message: string;
  };
  professional: {
    isValid: boolean;
    message: string;
  };
  domainStatus: {
    isValid: boolean;
    message: string;
  };
  mailbox: {
    isValid: boolean;
    message: string;
  };
}

const disposableEmailDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'throwaway.email',
  'temp-mail.org',
  'getairmail.com'
];

const businessEmailProviders = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'yandex.com',
  'mail.ru'
];

// Domains known to have catch-all behavior (accept all emails during SMTP but bounce later)
const catchAllDomains = [
  'hostinger.com',
  'namecheap.com',
  'godaddy.com'
];

// Function to verify email via SMTP
async function verifyEmailSMTP(email: string, mxRecords: any[]): Promise<{ isValid: boolean; message: string }> {
  if (!mxRecords || mxRecords.length === 0) {
    return { isValid: false, message: "No mail servers found for this domain." };
  }

  const domain = email.split('@')[1];
  
  // Check if domain uses catch-all behavior
  const hasCatchAll = catchAllDomains.some(catchDomain => 
    domain.includes(catchDomain) || mxRecords.some(mx => mx.exchange.includes(catchDomain))
  );

  if (hasCatchAll) {
    return { 
      isValid: false, 
      message: "Cannot verify mailbox - this domain accepts all emails during SMTP but may bounce invalid ones later." 
    };
  }

  // Sort MX records by priority (lower number = higher priority)
  const sortedMX = mxRecords.sort((a, b) => a.priority - b.priority);
  
  for (const mx of sortedMX) {
    try {
      const result = await checkEmailWithSMTP(email, mx.exchange);
      if (result.isValid !== null) {
        return result;
      }
    } catch (error) {
      console.log(`Failed to check via ${mx.exchange}:`, error);
      continue; // Try next MX server
    }
  }
  
  return { isValid: false, message: "Could not verify mailbox - all mail servers unreachable." };
}

// SMTP check function with better response handling
function checkEmailWithSMTP(email: string, mxHost: string): Promise<{ isValid: boolean; message: string }> {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let response = '';
    let step = 0;
    let allResponses: string[] = [];
    
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ isValid: false, message: "SMTP connection timeout." });
    }, 15000);

    socket.on('connect', () => {
      console.log(`Connected to ${mxHost}:25`);
    });

    socket.on('data', (data) => {
      response += data.toString();
      
      if (response.includes('\n')) {
        const lines = response.split('\n');
        const lastLine = lines[lines.length - 2] || lines[lines.length - 1];
        allResponses.push(lastLine);
        console.log(`SMTP Response from ${mxHost}: ${lastLine}`);
        
        switch (step) {
          case 0: // Initial connection
            if (lastLine.startsWith('220')) {
              socket.write('HELO emailverifier.com\r\n');
              step = 1;
            } else {
              clearTimeout(timeout);
              socket.destroy();
              resolve({ isValid: false, message: `SMTP server rejected connection: ${lastLine}` });
            }
            break;
            
          case 1: // After HELO
            if (lastLine.startsWith('250')) {
              socket.write('MAIL FROM:<noreply@emailverifier.com>\r\n');
              step = 2;
            } else {
              clearTimeout(timeout);
              socket.destroy();
              resolve({ isValid: false, message: `SMTP HELO failed: ${lastLine}` });
            }
            break;
            
          case 2: // After MAIL FROM
            if (lastLine.startsWith('250')) {
              socket.write(`RCPT TO:<${email}>\r\n`);
              step = 3;
            } else {
              clearTimeout(timeout);
              socket.destroy();
              resolve({ isValid: false, message: `SMTP MAIL FROM failed: ${lastLine}` });
            }
            break;
            
          case 3: // After RCPT TO - This is the actual mailbox check
            clearTimeout(timeout);
            socket.write('QUIT\r\n');
            socket.destroy();
            
            console.log(`Final SMTP response for ${email}: ${lastLine}`);
            
            if (lastLine.startsWith('250')) {
              // For legitimate providers like Gmail, Yahoo, etc., 250 means valid
              const isLegitimateProvider = mxHost.includes('gmail.com') || 
                                         mxHost.includes('yahoo.com') || 
                                         mxHost.includes('outlook.com') || 
                                         mxHost.includes('hotmail.com') ||
                                         mxHost.includes('icloud.com') ||
                                         mxHost.includes('live.com');
              
              if (isLegitimateProvider) {
                resolve({ isValid: true, message: `Mailbox verified: ${lastLine}` });
              } else {
                // For other providers, check if it's a generic catch-all response
                if (lastLine.toLowerCase().includes('relay accepted') || 
                    lastLine.toLowerCase().includes('will attempt delivery') ||
                    lastLine.toLowerCase().includes('accepted for delivery')) {
                  resolve({ 
                    isValid: false, 
                    message: `Server accepts all emails (catch-all): ${lastLine}` 
                  });
                } else {
                  resolve({ isValid: true, message: `Mailbox verified: ${lastLine}` });
                }
              }
            } else if (lastLine.startsWith('550') || lastLine.startsWith('551') || 
                      lastLine.startsWith('553') || lastLine.startsWith('5')) {
              resolve({ isValid: false, message: `Mailbox does not exist: ${lastLine}` });
            } else if (lastLine.startsWith('450') || lastLine.startsWith('4')) {
              resolve({ isValid: false, message: `Temporary error, likely invalid: ${lastLine}` });
            } else {
              resolve({ isValid: false, message: `Unknown response: ${lastLine}` });
            }
            break;
        }
        response = '';
      }
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`SMTP error with ${mxHost}:`, error);
      resolve({ isValid: false, message: `SMTP connection failed: ${error.message}` });
    });

    socket.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result: VerificationResult = {
      isValid: true,
      email: email.trim(),
      format: {
        isValid: false,
        message: ''
      },
      professional: {
        isValid: false,
        message: ''
      },
      domainStatus: {
        isValid: false,
        message: ''
      },
      mailbox: {
        isValid: false,
        message: ''
      }
    };

    // Check email format
    const isValidFormat = validator.isEmail(email.trim());
    result.format.isValid = isValidFormat;
    result.format.message = isValidFormat 
      ? "This email address is written correctly and isn't gibberish."
      : "This email address format is invalid.";

    if (!isValidFormat) {
      result.isValid = false;
      return NextResponse.json(result);
    }

    // Extract domain
    const domain = email.trim().split('@')[1]?.toLowerCase();
    
    if (!domain) {
      result.isValid = false;
      return NextResponse.json(result);
    }

    // Check if it's a professional email (not a free provider)
    const isProfessional = !businessEmailProviders.includes(domain);
    result.professional.isValid = isProfessional;
    result.professional.message = isProfessional 
      ? "The domain isn't linked to webmail or throwaway email services."
      : "This appears to be a personal email address.";

    // Check domain status with proper DNS lookup
    let hasMXRecord = false;
    let mxRecords: any[] = [];
    let domainExists = false;
    
    try {
      // First check if domain exists with A record
      try {
        await dns.lookup(domain);
        domainExists = true;
      } catch (err) {
        // Domain might not have A record but could have MX
      }

      // Check for MX records (email servers)
      try {
        mxRecords = await dns.resolveMx(domain);
        hasMXRecord = mxRecords && mxRecords.length > 0;
        console.log(`MX records for ${domain}:`, mxRecords);
      } catch (err) {
        console.log(`No MX records found for ${domain}:`, err);
      }

      // Domain is valid if it has MX records OR exists with A record
      const isDomainValid = hasMXRecord || domainExists;
      
      result.domainStatus.isValid = isDomainValid;
      result.domainStatus.message = isDomainValid
        ? hasMXRecord 
          ? "The domain name exists and has valid MX records."
          : "The domain name exists but may not be configured for email."
        : "The domain name doesn't exist or has no valid DNS records.";
        
    } catch (error) {
      console.error('DNS lookup error:', error);
      result.domainStatus.isValid = false;
      result.domainStatus.message = "Could not verify domain status due to DNS lookup error.";
    }

    // IMPROVED mailbox verification via SMTP
    const isDisposable = disposableEmailDomains.includes(domain);
    
    if (isDisposable) {
      result.mailbox.isValid = false;
      result.mailbox.message = "This appears to be a disposable email address.";
    } else if (hasMXRecord) {
      // Perform actual SMTP verification
      try {
        const smtpResult = await verifyEmailSMTP(email.trim(), mxRecords);
        result.mailbox.isValid = smtpResult.isValid;
        result.mailbox.message = smtpResult.message;
      } catch (error) {
        console.error('SMTP verification error:', error);
        result.mailbox.isValid = false;
        result.mailbox.message = "Could not verify mailbox due to SMTP connection error.";
      }
    } else {
      result.mailbox.isValid = false;
      result.mailbox.message = "Cannot verify mailbox - domain has no email servers configured.";
    }

    // Overall validity logic - PRIMARY check is domain status
    const isDomainValid = result.domainStatus.isValid;
    const isMailboxValid = result.mailbox.isValid;
    const isFormatValid = result.format.isValid;
    const isNotDisposable = !isDisposable;
    
    // Email is valid if:
    // 1. Format is correct
    // 2. Domain exists and has email servers (MAIN CRITERIA)
    // 3. Not a disposable email service
    // Mailbox status doesn't affect overall validity
    result.isValid = isFormatValid && isDomainValid && isNotDisposable;

    console.log(`Email verification summary for ${email}:`);
    console.log(`- Format valid: ${isFormatValid}`);
    console.log(`- Domain valid: ${isDomainValid}`);
    console.log(`- Not disposable: ${isNotDisposable}`);
    console.log(`- Mailbox valid: ${isMailboxValid}`);
    console.log(`- Overall result: ${result.isValid ? 'VALID' : 'INVALID'} (based on domain status)`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 