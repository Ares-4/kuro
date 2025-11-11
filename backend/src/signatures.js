import docusign from 'docusign-esign';
import { CONFIG } from './config.js';

const signatureConfigured = CONFIG.docusign.integrationKey && CONFIG.docusign.userId && CONFIG.docusign.privateKey && CONFIG.docusign.templateId;

export const requestSignature = async ({ clientId, signerName, signerEmail, documentType }) => {
  if (!signatureConfigured) {
    return {
      status: 'disabled',
      message: 'DocuSign environment variables are not configured. Unable to generate a signing session.'
    };
  }

  const jwtLifeSec = 10 * 60;
  const apiClient = new docusign.ApiClient({ basePath: CONFIG.docusign.basePath });
  apiClient.setOAuthBasePath(CONFIG.docusign.authServer);

  const results = await apiClient.requestJWTUserToken(
    CONFIG.docusign.integrationKey,
    CONFIG.docusign.userId,
    'signature',
    Buffer.from(CONFIG.docusign.privateKey, 'base64'),
    jwtLifeSec
  );

  const accessToken = results.body.access_token;
  const userInfo = await apiClient.getUserInfo(accessToken);
  const accountId = userInfo.accounts[0].accountId;

  const envelopesApi = new docusign.EnvelopesApi(apiClient);
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.templateId = CONFIG.docusign.templateId;
  envelopeDefinition.templateRoles = [
    new docusign.TemplateRole({
      email: signerEmail,
      name: signerName,
      roleName: 'Client',
      tabs: {
        textTabs: [
          new docusign.Text({ tabLabel: 'ClientID', value: clientId }),
          new docusign.Text({ tabLabel: 'DocumentType', value: documentType })
        ]
      }
    })
  ];
  envelopeDefinition.status = 'sent';

  const resultsEnvelope = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });
  const envelopeId = resultsEnvelope.envelopeId;

  const viewRequest = new docusign.RecipientViewRequest();
  viewRequest.returnUrl = `${CONFIG.docusign.basePath}/envelope/${envelopeId}`;
  viewRequest.authenticationMethod = 'email';
  viewRequest.email = signerEmail;
  viewRequest.userName = signerName;

  const view = await envelopesApi.createRecipientView(accountId, envelopeId, { recipientViewRequest: viewRequest });

  return {
    status: 'success',
    envelopeId,
    signingUrl: view.url
  };
};
