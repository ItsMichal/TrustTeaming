# Auth

Auth is a proxy/interface that contains logic to ensure the user identity and valid access. Originally supposed to use a proper login system or JWTs, but due to time constraints and the low need for security due to lack of sensitive info, just a simple `session` system is used. Contains decorators for use in `cores`.

**Note**: `AuthCore` is the core Authentication component- not a `/cores` equivalent.