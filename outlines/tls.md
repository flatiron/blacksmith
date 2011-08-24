## What is TLS?

[Transport Layer Security](http://en.wikipedia.org/wiki/Transport_Layer_Security) (or TSL) is the successor to Secure Sockets Layer (or SSL). It, along with SSL, are the de-facto standard cryptographic protocols for secure communications over the web. TSL encrypts communications on top of a network transport layer (typically tcp), and uses public-key cryptography to encrypt messages.

### Public-Key Cryptography

In public-key cryptography, each peer has two keys: A public key, and a private key. The public key is shared with everyone, and the private key is (naturally) kept secret. In order to encrypt a message, a computer requires its private key and the recipient's public key. Then, in order to decrypt the message, the recipient requires its *own* private key and the *sender*'s public key.

In TLS connections, the public key is called a *[certificate](http://en.wikipedia.org/wiki/Digital_certificate)*. This is because it's "[signed](http://en.wikipedia.org/wiki/Digital_signature)" to prove that the public key belongs to its owner. TLS certificates may either be signed by a third-party certificate authority (CA), or they may be [self-signed](http://en.wikipedia.org/wiki/Self-signed_certificate). In the case of Certificate Authorities, Mozilla keeps [a list of trusted root CAs](http://mxr.mozilla.org/mozilla/source/security/nss/lib/ckfw/builtins/certdata.txt) that are generally agreed upon by most web browsers. These root CAs may then issue certificates to other signing authorities, which in turn sign certificates for the general public.

### History of TLS Support in Node.JS

TLS support in node is relatively new. The first stable version of node.js to support TSL and HTTPS was the v0.4 branch, which was released in early 2011. Since then, the primary focus of the core developers has shifted from TLS/HTTPS to Windows support in the v0.5 branch. As such, the TSL APIs in node are still a little rough around the edges, and documentation leaves something to be desired.

## The `tls` Module

* The `tls` module
  - Subclass of net.server
  - You need certificates, etc.
    - options = { "key": /* from a pem */, "cert": /* from another pem */ }

* "starttls"
  - "Upgrading" an unencrypted connection into an tls encrypted one
  - Not built into Node yet, must do "by hand" atm
  - <https://gist.github.com/848444> is an example.
