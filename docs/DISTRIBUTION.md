# Distribution status and release gates

Two deliverables must not be confused:

1. **Reporting kit**: the new read-only publisher, strict schemas, local queue, scripts and instructions. `npm run package:release` builds an allowlisted, generic-label ZIP with a SHA-256 manifest. It contains no source game, game binaries, models, portraits, ledger, secrets or saved accounts. Installing it does not create/reset a paper account. It requires a separately installed existing HQ.
2. **Full fresh HQ**: not released. The original runtime, mod patch, generic assets, runtime dependency provenance and fresh Windows/macOS behavior need independent verification before a full HQ download can be enabled. The public buttons are disabled rather than linked to an unverified archive.

The packaging workflow builds a review artifact only. It does not publish a GitHub release automatically or claim successful Windows installation. A full release must retain upstream MIT notices; exclude proprietary Mojang files, personal state and character likeness assets; install into a new directory; generate a fresh account only in that new instance; and demonstrate restart preservation. Generic default identities must be used unless redistribution rights are documented. Never package the original project directory wholesale.

Source requirements verified: Minecraft Java Edition 26.3, Fabric Loader 0.19.5, Fabric API 0.161.0+26.3, Java 25 on the source Mac, Node >=22 for the engine. The publisher requires Node >=22.13. Windows launch scripts are provided for the reporting kit, but this Mac cannot prove a Windows fresh install.

The local configuration schema distinguishes actual engine variables from source-defined policies and future unsupported features. No wizard collects secrets on the public site.
