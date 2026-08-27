import { sha512 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

export const SHA512 = (message: string) => bytesToHex(sha512(utf8ToBytes(message)))
