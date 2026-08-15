import secrets from "secrets.js-grempe";

/**
 * Encrypts raw text using AES-256-GCM and splits the Master Key via SSS
 */
export async function encryptAndSplitSecret(
    plainText: string,
    userPassphrase: string,
) {
    const encoder = new TextEncoder();

    // 1. Generate 256-bit Master Encryption Key
    const masterKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    const masterKeyHex = Array.from(masterKeyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    // 2. Derive Key from User Passphrase using PBKDF2 (for wrapping Master Key)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passphraseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(userPassphrase),
        "PBKDF2",
        false,
        ["deriveKey"],
    );

    const derivedAesKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        passphraseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"],
    );

    // 3. Encrypt the .env Content with AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        derivedAesKey,
        encoder.encode(plainText),
    );

    // 4. Split Master Key into 5 shares (Threshold = 3) via Shamir's Secret Sharing
    const sharesHex = secrets.share(masterKeyHex, 5, 3);
    const shares = sharesHex.map((shareData, idx) => ({
        shareIndex: idx + 1,
        shareData,
    }));

    // Convert binary buffers to Base64
    return {
        ciphertext: bufferToBase64(encryptedBuffer),
        iv: bufferToBase64(iv.buffer),
        salt: bufferToBase64(salt.buffer),
        shares,
    };
}

function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
