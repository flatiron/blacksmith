Outline for an article on TLS

* What is TLS
  - Overview (encrypts ABOVE transport layer (ie tcp), public key, mac, etc.)
    - Encryption *above* the transport layer (usually tcp)
    - Uses public key encryption (private key + certificates)
  - History in Node.js
    - Relatively new (0.4.x first stable branch to have tls/https)

* The `tls` module
  - Subclass of net.server
  - You need certificates, etc.
    - options = { "key": /* from a pem */, "cert": /* from another pem */ }

* "starttls"
  - "Upgrading" an unencrypted connection into an tls encrypted one
  - Not built into Node yet, must do "by hand" atm
  - <https://gist.github.com/848444> is an example.
