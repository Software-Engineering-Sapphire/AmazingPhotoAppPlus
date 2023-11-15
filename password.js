const { createHash, randomBytes } = require('crypto-browserify');

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry where passwordEntry is an object with two
 * string properties:
 *    salt - The salt used for the password.
 *    hash - The sha1 hash of the password and salt.
 */
function makePasswordEntry(clearTextPassword) {
    if (clearTextPassword === null || clearTextPassword === undefined || clearTextPassword === "") {
        return "invalid password";
    }
    let retObj = {};
    const hasher = createHash('sha1');
    retObj.salt = randomBytes(8).toString('hex');
    hasher.update(clearTextPassword + retObj.salt);
    retObj.hash = hasher.digest('hex');
    return retObj;
}

/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    const hasher = createHash('sha1');
    hasher.update(clearTextPassword + salt);
    const calculatedHash = hasher.digest('hex');
    return calculatedHash === hash;
}

module.exports = { makePasswordEntry, doesPasswordMatch };