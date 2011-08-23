# The Crypto Module

The crypto module is a wrapper for [OpenSSL](http://en.wikipedia.org/wiki/Openssl) cryptographic functions.

## Hashes and HMAC

What are hashes? What's HMAC?

http://en.wikipedia.org/wiki/Cryptographic_hash_function
http://en.wikipedia.org/wiki/HMAC

### Hashes that work with crypto

The hashes that work with crypto are dependent on what your version of OpenSSL
supports. If you have a new enough version of OpenSSL, you can get a list of
hash types your OpenSSL supports by typing `openssl list-message-digest-algorithms` into the command line. Some common hash types that should work are:

* sha1
* md5
* sha256
* sha512

### Example:

This example finds the md5 hash for "Man oh man do I love node!":

    require("crypto")
      .createHash("md5")
      .update("Man oh man do I love node!")
      .digest("hex");

the `update` method can be invoked multiple times to ingest streaming data (ie, buffers).

The API for hmacs is very similar:

    require("crypto")
      .createHmac("md5", key)
      .update("If you love node so much why don't you marry it?")
      .digest("hex");

## Ciphers

What's a cipher?
Example (I wrote one)
(Pretty similar api actually)

## Certificates, keys, all that jazz

I'm starting to think that I should point users towards the tls module for this, even though the base tools are in here.
