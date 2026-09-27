import { describe, expect, it } from 'vitest'
import { buildWorkspaceBackup, parseWorkspaceBackup } from './workspaceBackup'
import { encryptWorkspaceBackup } from './workspaceBackupCrypto'
import { verifyEncryptedBackup } from './workspaceBackupVerify'

const storage = (values: Record<string, string> = {}) => ({
  getItem: (key: string) => values[key] ?? null,
  setItem: (key: string, value: string) => { values[key] = value },
  removeItem: (key: string) => { delete values[key] },
  key: (index: number) => Object.keys(values)[index] ?? null,
  get length() { return Object.keys(values).length },
} as unknown as Storage)

describe('encrypted verify orchestration', () => {
  it('settles successfully after Phase 28 decrypt and Phase 27 validation', async () => {
    const backup = buildWorkspaceBackup(storage())
    const envelope = await encryptWorkspaceBackup(backup, 'phase29h-correct-passphrase')
    await expect(verifyEncryptedBackup(envelope, 'phase29h-correct-passphrase')).resolves.toMatchObject({ ok: true, preview: { backup } })
  })

  it('settles safely for wrong passwords and invalid decrypted payloads', async () => {
    const backup = buildWorkspaceBackup(storage())
    const envelope = await encryptWorkspaceBackup(backup, 'phase29h-correct-passphrase')
    await expect(verifyEncryptedBackup(envelope, 'wrong-passphrase')).resolves.toEqual({ ok: false, reason: 'DECRYPT_FAILED' })
    const invalid = await encryptWorkspaceBackup({ ...backup, schema: 'wrong' as never }, 'phase29h-correct-passphrase')
    await expect(verifyEncryptedBackup(invalid, 'phase29h-correct-passphrase')).resolves.toEqual({ ok: false, reason: 'INVALID_BACKUP' })
  })

  it('keeps verification read-only for supported and unrelated storage', async () => {
    const values = {
      'israel-stocks.watchlist.v1': '["sano"]',
      'israel-stocks.saved-comparisons.v1': '[]',
      'israel-stocks.research-notes.v1': '[]',
      'israel-stocks.review-state.v1': '[]',
      sentinel: 'unchanged',
    }
    const before = { ...values }
    const backup = buildWorkspaceBackup(storage(values))
    const envelope = await encryptWorkspaceBackup(backup, 'phase29h-correct-passphrase')
    await verifyEncryptedBackup(envelope, 'phase29h-correct-passphrase')
    expect(values).toEqual(before)
  })

  it('keeps the Phase 27 plain validator available', () => {
    expect(parseWorkspaceBackup(buildWorkspaceBackup(storage())).backup.version).toBe(1)
  })
})
