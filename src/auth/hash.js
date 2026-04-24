// SHA-256 해시 (브라우저 Web Crypto API)

export async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 비밀번호 + salt 해시 (단순 문자열 결합)
export async function hashPassword(password, salt = 'casoshi_v1') {
  return sha256(`${salt}::${password}`);
}

// 해시 검증
export async function verifyPassword(password, storedHash, salt = 'casoshi_v1') {
  const computed = await hashPassword(password, salt);
  return computed === storedHash;
}
