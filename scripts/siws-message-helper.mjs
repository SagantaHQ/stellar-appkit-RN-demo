/**
 * The SIWS message builder — mirrors core/src/siws.ts buildSiwsMessage so the
 * e2e test doesn't need to import the ESM-only core package through the
 * CommonJS require hook.
 */
export function buildSiwsMessageShape({ domain, address, statement, uri, nonce, issuedAt, expirationTime, chainId }) {
  return [
    `${domain} wants you to sign in with your Stellar account:`,
    address,
    '',
    `Statement: ${statement}`,
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    `Expiration Time: ${expirationTime.toISOString()}`,
  ].join('\n');
}
