import { parseWorkspaceBackup, type ParsedBackup, type WorkspaceBackupV1 } from './workspaceBackup'
import { decryptWorkspaceBackup, type EncryptedWorkspaceBackupV1 } from './workspaceBackupCrypto'

export type VerifyEncryptedBackupResult =
  | { ok: true; preview: ParsedBackup }
  | { ok: false; reason: 'DECRYPT_FAILED' | 'INVALID_BACKUP' }

export const verifyEncryptedBackup = async (
  envelope: EncryptedWorkspaceBackupV1,
  passphrase: string,
): Promise<VerifyEncryptedBackupResult> => {
  let plaintext: WorkspaceBackupV1
  try {
    plaintext = await decryptWorkspaceBackup(envelope, passphrase)
  } catch {
    return { ok: false, reason: 'DECRYPT_FAILED' }
  }
  try {
    return { ok: true, preview: parseWorkspaceBackup(plaintext) }
  } catch {
    return { ok: false, reason: 'INVALID_BACKUP' }
  }
}
