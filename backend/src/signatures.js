import crypto from 'crypto';
import { CONFIG } from './config.js';

const signatureConfigured =
  CONFIG.docusign.integrationKey && CONFIG.docusign.userId && CONFIG.docusign.privateKey && CONFIG.docusign.templateId;

const base64Url = (input) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const buildJwtAssertion = () => {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: CONFIG.docusign.integrationKey,
    sub: CONFIG.docusign.userId,
    aud: CONFIG.docusign.authServer,
    scope: 'signature',
    iat: now,
    exp: now + 10 * 60
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(CONFIG.docusign.privateKey);
  const encodedSignature = base64Url(signature);

  return `${signingInput}.${encodedSignature}`;
};

const requestJwtAccessToken = async () => {
  const assertion = buildJwtAssertion();

  const response = await fetch(`https://${CONFIG.docusign.authServer}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DocuSign token request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.access_token;
};

const fetchAccountId = async (accessToken) => {
  const response = await fetch(`https://${CONFIG.docusign.authServer}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DocuSign userinfo failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const account = data.accounts && data.accounts.find((acct) => acct.is_default) ? data.accounts.find((acct) => acct.is_default) : data.accounts?.[0];

  if (!account) {
    throw new Error('No DocuSign account available for the configured user.');
  }

  return account.account_id || account.accountId;
};

const createEnvelope = async ({ accessToken, accountId, signerName, signerEmail, documentType, clientId }) => {
  const envelopeDefinition = {
    templateId: CONFIG.docusign.templateId,
    templateRoles: [
      {
        email: signerEmail,
        name: signerName,
        roleName: 'Client',
        clientUserId: clientId,
        tabs: {
          textTabs: [
            { tabLabel: 'ClientID', value: clientId },
            { tabLabel: 'DocumentType', value: documentType }
          ]
        }
      }
    ],
    status: 'sent'
  };

  const response = await fetch(`${CONFIG.docusign.basePath}/accounts/${accountId}/envelopes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(envelopeDefinition)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DocuSign envelope creation failed: ${response.status} ${text}`);
  }

  return response.json();
};

const createRecipientView = async ({ accessToken, accountId, envelopeId, signerName, signerEmail, clientId }) => {
  const recipientRequest = {
    returnUrl: `${CONFIG.docusign.basePath}/envelope/${envelopeId}`,
    authenticationMethod: 'email',
    email: signerEmail,
    userName: signerName,
    clientUserId: clientId
  };

  const response = await fetch(
    `${CONFIG.docusign.basePath}/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recipientRequest)
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DocuSign recipient view failed: ${response.status} ${text}`);
  }

  return response.json();
};

export const requestSignature = async ({ clientId, signerName, signerEmail, documentType }) => {
  if (!signatureConfigured) {
    return {
      status: 'disabled',
      message: 'DocuSign environment variables are not configured. Unable to generate a signing session.'
    };
  }

  const accessToken = await requestJwtAccessToken();
  const accountId = await fetchAccountId(accessToken);
  const envelope = await createEnvelope({
    accessToken,
    accountId,
    signerName,
    signerEmail,
    documentType,
    clientId
  });

  const envelopeId = envelope.envelopeId || envelope.envelope_id;

  const view = await createRecipientView({
    accessToken,
    accountId,
    envelopeId,
    signerName,
    signerEmail,
    clientId
  });

  return {
    status: 'success',
    envelopeId,
    signingUrl: view.url
  };
};
